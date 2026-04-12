"""
Management command to fetch missing screenshots from multiple sources.

Usage:
    python manage.py fetch_missing_screenshots [--dry-run]

Sources tried in order:
1. Demozoo API (re-fetch production details)
2. Pouet.net (scrape screenshot from production page)
3. Scene.org download links (for image files in graphics compos)
"""

import json
import re
import time
from urllib.request import urlopen, Request
from urllib.error import URLError, HTTPError

from django.core.management.base import BaseCommand
from django.core.files.base import ContentFile

from dpms.compos.models import Production


USER_AGENT = "DPMS/1.0 (Posadas Party Management System)"

# Compos where the production itself is likely visual
VISUAL_COMPOS = [
    "graphics", "gfx", "pixel", "demo", "intro", "cracktro",
    "wild", "game", "homebrew",
]


def is_visual_compo(compo_name):
    name_lower = compo_name.lower()
    return any(v in name_lower for v in VISUAL_COMPOS)


def is_image_url(url):
    ext = url.rsplit(".", 1)[-1].lower().split("?")[0]
    return ext in ("jpg", "jpeg", "png", "gif", "bmp", "webp")


class Command(BaseCommand):
    help = "Fetch missing screenshots from Demozoo, Pouet, and Scene.org"

    def add_arguments(self, parser):
        parser.add_argument("--dry-run", action="store_true")
        parser.add_argument("--delay", type=float, default=1.5)

    def fetch_url(self, url, retries=3, delay=1.5):
        for attempt in range(retries):
            try:
                req = Request(url, headers={"User-Agent": USER_AGENT})
                with urlopen(req, timeout=20) as resp:
                    return resp.read()
            except HTTPError as e:
                wait = delay * (2 ** attempt)
                if e.code == 429:
                    wait = max(wait, 10)
                self.stderr.write(f"  [RETRY {attempt+1}] {url}: {e}")
                time.sleep(wait)
            except (URLError, OSError) as e:
                wait = delay * (2 ** attempt)
                self.stderr.write(f"  [RETRY {attempt+1}] {url}: {e}")
                time.sleep(wait)
        return None

    def fetch_json(self, url, delay=1.5):
        data = self.fetch_url(url)
        if data:
            time.sleep(delay)
            return json.loads(data.decode("utf-8"))
        return None

    def try_demozoo(self, production, delay):
        """Try to get screenshot from Demozoo API."""
        demozoo_url = production.demozoo_url
        if not demozoo_url:
            return None

        match = re.search(r"/productions/(\d+)/", demozoo_url)
        if not match:
            return None

        prod_id = match.group(1)
        api_url = f"https://demozoo.org/api/v1/productions/{prod_id}/?format=json"
        data = self.fetch_json(api_url, delay)
        if not data:
            return None

        screenshots = data.get("screenshots", [])
        if screenshots:
            url = screenshots[0].get("standard_url") or screenshots[0].get("original_url")
            if url:
                content = self.fetch_url(url)
                if content:
                    filename = url.rsplit("/", 1)[-1]
                    return filename, content
        return None

    def try_pouet(self, production, delay):
        """Try to get screenshot from Pouet.net API."""
        pouet_url = production.pouet_url
        if not pouet_url:
            return None

        match = re.search(r"prod\.php\?which=(\d+)", pouet_url)
        if not match:
            match = re.search(r"/prod/(\d+)", pouet_url)
        if not match:
            return None

        prod_id = match.group(1)
        api_url = f"https://api.pouet.net/v1/prod/?id={prod_id}"
        data = self.fetch_json(api_url, delay)
        if not data or "prod" not in data:
            return None

        screenshot = data["prod"].get("screenshot")
        if screenshot:
            content = self.fetch_url(screenshot)
            if content:
                filename = screenshot.rsplit("/", 1)[-1]
                return filename, content
        return None

    def try_sceneorg(self, production, delay):
        """Try to download image file from Scene.org for graphics compos."""
        if not is_visual_compo(production.compo.name):
            return None

        scene_url = production.scene_org_url
        if not scene_url:
            return None

        # Convert view URL to direct download
        download_url = scene_url.replace(
            "files.scene.org/view/", "files.scene.org/get/"
        )

        if is_image_url(download_url):
            content = self.fetch_url(download_url)
            if content and len(content) > 1000:  # Basic sanity check
                filename = download_url.rsplit("/", 1)[-1]
                return filename, content
        return None

    def handle(self, *args, **options):
        dry_run = options["dry_run"]
        delay = options["delay"]

        # Get productions without screenshots
        prods = Production.objects.filter(
            screenshot=""
        ).select_related("compo", "edition").order_by("edition__start_date", "compo__name")

        self.stdout.write(f"Productions without screenshots: {prods.count()}")

        if dry_run:
            self.stdout.write(self.style.WARNING("DRY RUN"))

        stats = {"demozoo": 0, "pouet": 0, "sceneorg": 0, "failed": 0}

        for prod in prods:
            label = f"[{prod.edition.title}] {prod.compo.name} / {prod.title}"

            # 1. Try Demozoo
            if prod.demozoo_url:
                result = self.try_demozoo(prod, delay)
                if result:
                    filename, content = result
                    self.stdout.write(self.style.SUCCESS(f"  DEMOZOO: {label}"))
                    if not dry_run:
                        path = f"productions/screenshots/{prod.edition_id}/{prod.id}/{filename}"
                        prod.screenshot.save(path, ContentFile(content), save=True)
                    stats["demozoo"] += 1
                    continue

            # 2. Try Pouet
            if prod.pouet_url:
                result = self.try_pouet(prod, delay)
                if result:
                    filename, content = result
                    self.stdout.write(self.style.SUCCESS(f"  POUET: {label}"))
                    if not dry_run:
                        path = f"productions/screenshots/{prod.edition_id}/{prod.id}/{filename}"
                        prod.screenshot.save(path, ContentFile(content), save=True)
                    stats["pouet"] += 1
                    continue

            # 3. Try Scene.org (only for visual compos)
            if prod.scene_org_url and is_visual_compo(prod.compo.name):
                result = self.try_sceneorg(prod, delay)
                if result:
                    filename, content = result
                    self.stdout.write(self.style.SUCCESS(f"  SCENEORG: {label}"))
                    if not dry_run:
                        path = f"productions/screenshots/{prod.edition_id}/{prod.id}/{filename}"
                        prod.screenshot.save(path, ContentFile(content), save=True)
                    stats["sceneorg"] += 1
                    continue

            if is_visual_compo(prod.compo.name):
                self.stdout.write(f"  MISS: {label}")
                stats["failed"] += 1

        self.stdout.write(f"\n{'='*50}")
        self.stdout.write(self.style.SUCCESS("Done:"))
        for source, count in stats.items():
            self.stdout.write(f"  {source}: {count}")
