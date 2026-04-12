"""
Management command to scrape Posadas Party data from Demozoo API.

Usage:
    python manage.py scrape_demozoo [--output FILE] [--edition PARTY_ID]

Fetches all Posadas Party editions and their productions from Demozoo API.
Saves the result as a JSON file for later import with import_demozoo.
"""

import json
import time
from urllib.request import urlopen, Request
from urllib.error import URLError, HTTPError

from django.core.management.base import BaseCommand


API_BASE = "https://demozoo.org/api/v1"
USER_AGENT = "DPMS/1.0 (Posadas Party Management System)"

# All Posadas Party editions in Demozoo
POSADAS_EDITIONS = {
    718: "Posadas 1995",
    3205: "Posadas 2017",
    3650: "Posadas 2018",
    3875: "Posadas 2019",
    4485: "Posadas 2022",
    4583: "Posadas 2022 Autumn Edition",
    4674: "Posadas 2023",
    5061: "Posadas 2024",
    5065: "Posadas 2025",
}


class Command(BaseCommand):
    help = "Scrape Posadas Party productions from Demozoo API"

    def add_arguments(self, parser):
        parser.add_argument(
            "--output", "-o",
            default="posadas_demozoo.json",
            help="Output JSON file path (default: posadas_demozoo.json)",
        )
        parser.add_argument(
            "--edition",
            type=int,
            help="Only scrape a specific Demozoo party ID",
        )
        parser.add_argument(
            "--delay",
            type=float,
            default=1.5,
            help="Delay between API requests in seconds (default: 1.5)",
        )

    def api_get(self, url, retries=5, delay=1.0):
        for attempt in range(retries):
            try:
                req = Request(url, headers={"User-Agent": USER_AGENT})
                with urlopen(req, timeout=30) as resp:
                    data = json.loads(resp.read().decode("utf-8"))
                time.sleep(delay)
                return data
            except HTTPError as e:
                wait = delay * (2 ** attempt)  # Exponential backoff
                if e.code == 429:
                    wait = max(wait, 10)  # At least 10s on rate limit
                self.stderr.write(f"  [RETRY {attempt + 1}/{retries}] {url}: {e} (waiting {wait:.0f}s)")
                time.sleep(wait)
            except URLError as e:
                wait = delay * (2 ** attempt)
                self.stderr.write(f"  [RETRY {attempt + 1}/{retries}] {url}: {e} (waiting {wait:.0f}s)")
                time.sleep(wait)
        self.stderr.write(self.style.ERROR(f"  [FAILED] {url}"))
        return None

    def fetch_production_details(self, production_id, delay):
        url = f"{API_BASE}/productions/{production_id}/?format=json"
        data = self.api_get(url, delay=delay)
        if not data:
            return None

        screenshots = [
            {
                "original_url": s.get("original_url"),
                "standard_url": s.get("standard_url"),
                "thumbnail_url": s.get("thumbnail_url"),
            }
            for s in data.get("screenshots", [])
        ]

        download_links = [
            {"url": l.get("url"), "link_class": l.get("link_class")}
            for l in data.get("download_links", [])
        ]

        external_links = [
            {"url": l.get("url"), "link_class": l.get("link_class")}
            for l in data.get("external_links", [])
        ]

        # Extract authors
        authors = []
        for nick in data.get("author_nicks", []):
            if nick.get("name"):
                authors.append(nick["name"])
        for nick in data.get("author_affiliation_nicks", []):
            if nick.get("name"):
                authors.append(nick["name"])

        # Extract specific URLs
        youtube_url = pouet_url = scene_org_url = None
        for link in external_links + download_links:
            url_str = link.get("url", "")
            if "youtube.com" in url_str or "youtu.be" in url_str:
                youtube_url = url_str
            elif "pouet.net" in url_str:
                pouet_url = url_str
            elif "scene.org" in url_str:
                scene_org_url = url_str

        platforms = [p.get("name", "") for p in data.get("platforms", [])]
        types = [t.get("name", "") for t in data.get("types", [])]

        return {
            "demozoo_id": data.get("id"),
            "title": data.get("title"),
            "authors": authors,
            "platforms": platforms,
            "types": types,
            "release_date": data.get("release_date"),
            "screenshots": screenshots,
            "download_links": download_links,
            "external_links": external_links,
            "youtube_url": youtube_url,
            "pouet_url": pouet_url,
            "scene_org_url": scene_org_url,
        }

    def fetch_party(self, party_id, party_name, delay):
        self.stdout.write(f"\n{'='*60}")
        self.stdout.write(self.style.SUCCESS(f"Fetching: {party_name} (ID: {party_id})"))

        party_data = self.api_get(f"{API_BASE}/parties/{party_id}/?format=json")
        if not party_data:
            return None

        edition = {
            "demozoo_party_id": party_id,
            "name": party_data.get("name", party_name),
            "start_date": party_data.get("start_date"),
            "end_date": party_data.get("end_date"),
            "location": party_data.get("location"),
            "website": party_data.get("website"),
            "competitions": [],
        }

        competitions = party_data.get("competitions", [])
        self.stdout.write(f"  {len(competitions)} competitions found")

        for comp in competitions:
            comp_name = comp.get("name", "Unknown")
            results = comp.get("results", []) or comp.get("placings", [])
            self.stdout.write(f"  - {comp_name}: {len(results)} productions")

            competition = {
                "name": comp_name,
                "shown_date": comp.get("shown_date"),
                "platform": comp.get("platform"),
                "production_type": comp.get("production_type"),
                "productions": [],
            }

            for placing in results:
                prod_data = placing.get("production", {})
                prod_id = prod_data.get("id")
                if not prod_id:
                    continue

                self.stdout.write(f"    -> {prod_data.get('title', '?')} (ID: {prod_id})")
                details = self.fetch_production_details(prod_id, delay)

                if not details:
                    # Fallback: use data from party results
                    authors = [
                        n.get("name", "")
                        for n in prod_data.get("author_nicks", [])
                    ]
                    details = {
                        "demozoo_id": prod_id,
                        "title": prod_data.get("title", "Unknown"),
                        "authors": authors,
                        "platforms": [p.get("name") for p in prod_data.get("platforms", [])],
                        "types": [t.get("name") for t in prod_data.get("types", [])],
                        "release_date": prod_data.get("release_date"),
                        "screenshots": [],
                        "download_links": [],
                        "external_links": [],
                        "youtube_url": None,
                        "pouet_url": None,
                        "scene_org_url": None,
                    }

                details["position"] = placing.get("position")
                details["ranking"] = placing.get("ranking")
                details["score"] = placing.get("score")
                details["competition"] = comp_name
                competition["productions"].append(details)

            edition["competitions"].append(competition)

        total = sum(len(c["productions"]) for c in edition["competitions"])
        self.stdout.write(f"  Total: {total} productions")
        return edition

    def handle(self, *args, **options):
        output = options["output"]
        delay = options["delay"]
        single_edition = options.get("edition")

        if single_edition:
            editions_to_fetch = {
                single_edition: POSADAS_EDITIONS.get(single_edition, f"Party {single_edition}")
            }
        else:
            editions_to_fetch = POSADAS_EDITIONS

        self.stdout.write(f"Scraping {len(editions_to_fetch)} editions from Demozoo API...")

        all_editions = []
        for party_id, party_name in editions_to_fetch.items():
            edition = self.fetch_party(party_id, party_name, delay)
            if edition:
                all_editions.append(edition)

        with open(output, "w", encoding="utf-8") as f:
            json.dump(all_editions, f, indent=2, ensure_ascii=False)

        total_prods = sum(
            sum(len(c["productions"]) for c in e["competitions"])
            for e in all_editions
        )

        self.stdout.write(f"\n{'='*60}")
        self.stdout.write(self.style.SUCCESS(
            f"Saved {len(all_editions)} editions, {total_prods} productions to {output}"
        ))
