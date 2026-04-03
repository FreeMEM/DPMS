"""
Data migration: populate production details from Demozoo API data.
Downloads screenshots from Demozoo and stores them locally.
"""
import os
import logging
from urllib.request import urlopen, Request
from urllib.error import URLError

from django.db import migrations
from django.core.files.base import ContentFile

logger = logging.getLogger(__name__)

# Demozoo platform name -> our platform choice
PLATFORM_MAP = {
    'Amiga OCS/ECS': 'amiga_ocs',
    'Amiga AGA': 'amiga_aga',
    'Windows': 'pc',
    'Linux': 'pc',
    'MS-Dos': 'pc',
    'Android': 'other',
    'TIC-80': 'other',
    'Custom Hardware': 'other',
}

# Mapping: DB production title -> demozoo data
# Titles in DB may differ slightly from Demozoo, so we map by DB title
DEMOZOO_DATA = {
    # --- Tracked Music ---
    "Being In Trance": {
        "demozoo_id": 374157, "platform": "Amiga OCS/ECS", "release_date": "2025-06-28",
        "screenshot_url": None, "youtube_url": None, "pouet_url": None,
        "scene_org_url": "https://files.scene.org/view/parties/2025/posadas25/tracked_music/estrayk-being_in_trance.mod",
    },
    "30 years of party": {
        "demozoo_id": 374158, "platform": "Amiga OCS/ECS", "release_date": "2025-06-28",
        "screenshot_url": "https://media.demozoo.org/screens/o/15/ea/a66e.363308.jpg",
        "youtube_url": "https://www.youtube.com/watch?v=dUlyIEV4Oi0", "pouet_url": None,
        "scene_org_url": "https://files.scene.org/view/parties/2025/posadas25/tracked_music/fireboy-30_years_of_party.zip",
    },
    "Loorah!": {
        "demozoo_id": 374159, "platform": "Amiga OCS/ECS", "release_date": "2025-06-28",
        "screenshot_url": None,
        "youtube_url": "https://www.youtube.com/watch?v=mhs1hIWegSU", "pouet_url": None,
        "scene_org_url": "https://files.scene.org/view/parties/2025/posadas25/tracked_music/josss_loorah.zip",
    },
    "Funk Da Posadas": {
        "demozoo_id": 374160, "platform": "Amiga OCS/ECS", "release_date": "2025-06-28",
        "screenshot_url": None, "youtube_url": None, "pouet_url": None,
        "scene_org_url": "https://files.scene.org/view/parties/2025/posadas25/tracked_music/filippp-funk_da_posadas.mod",
    },
    "wargamez": {
        "demozoo_id": 374161, "platform": "Amiga OCS/ECS", "release_date": "2025-06-28",
        "screenshot_url": None, "youtube_url": None, "pouet_url": None,
        "scene_org_url": "https://files.scene.org/view/parties/2025/posadas25/tracked_music/reset-wargamez.mod",
    },
    "GuadAmigalquivir": {
        "demozoo_id": 374162, "platform": "Amiga OCS/ECS", "release_date": "2025-06-28",
        "screenshot_url": None, "youtube_url": None, "pouet_url": None,
        "scene_org_url": "https://files.scene.org/view/parties/2025/posadas25/tracked_music/jesusito-guadamigalquivir.zip",
    },
    "Long Time Coming": {
        "demozoo_id": 374163, "platform": "Amiga OCS/ECS", "release_date": "2025-06-28",
        "screenshot_url": None, "youtube_url": None, "pouet_url": None,
        "scene_org_url": "https://files.scene.org/view/parties/2025/posadas25/tracked_music/fl1n-long_time_coming.med",
    },
    "Vengan a Inércia!": {
        "demozoo_id": 374164, "platform": "Amiga OCS/ECS", "release_date": "2025-06-28",
        "screenshot_url": None, "youtube_url": None, "pouet_url": None,
        "scene_org_url": "https://files.scene.org/view/parties/2025/posadas25/tracked_music/jeenio-vengan_a_in__rcia.mod",
    },
    # --- Fast Music ---
    "Elektrik Acid Jazz": {
        "demozoo_id": 374165, "platform": "Amiga OCS/ECS", "release_date": "2025-06-28",
        "screenshot_url": None, "youtube_url": None, "pouet_url": None,
        "scene_org_url": "https://files.scene.org/view/parties/2025/posadas25/fast_music/jeenio-elekjazz.mod",
    },
    "mobyda": {
        "demozoo_id": 374166, "platform": "Amiga OCS/ECS", "release_date": "2025-06-28",
        "screenshot_url": None, "youtube_url": None, "pouet_url": None,
        "scene_org_url": "https://files.scene.org/view/parties/2025/posadas25/fast_music/mcgyv-mobyda10.med",
    },
    "La Mobi-da malena": {
        "demozoo_id": 374167, "platform": "Amiga OCS/ECS", "release_date": "2025-06-28",
        "screenshot_url": None, "youtube_url": None, "pouet_url": None,
        "scene_org_url": "https://files.scene.org/view/parties/2025/posadas25/fast_music/jesusito-la_mobida_malena.mod",
    },
    # --- Executable Music ---
    "Sweet Marmalade": {
        "demozoo_id": 374168, "platform": "Amiga OCS/ECS", "release_date": "2025-06-28",
        "screenshot_url": None,
        "youtube_url": "https://www.youtube.com/watch?v=0hSXmNYP64o", "pouet_url": None,
        "scene_org_url": "https://files.scene.org/view/parties/2025/posadas25/executable_music/josss_sweetmarmalade.zip",
    },
    # --- OCS Pixel Gfx ---
    "magiA": {
        "demozoo_id": 374169, "platform": "Amiga OCS/ECS", "release_date": "2025-06-28",
        "screenshot_url": "https://media.demozoo.org/screens/o/36/f1/8ede.363142.png",
        "youtube_url": None, "pouet_url": None,
        "scene_org_url": "https://files.scene.org/view/parties/2025/posadas25/graphics_ocs/z3k___veritaz_-_magia.zip",
    },
    "Do Androids Dream of Electric Sheep?": {
        "demozoo_id": 374170, "platform": "Amiga OCS/ECS", "release_date": "2025-06-28",
        "screenshot_url": "https://media.demozoo.org/screens/o/76/ef/4e79.363098.png",
        "youtube_url": None, "pouet_url": None,
        "scene_org_url": "https://files.scene.org/view/parties/2025/posadas25/graphics_ocs/jok_-_do_the_androids_dream_of_electric_sheep.zip",
    },
    "Inercia 2025": {
        "demozoo_id": 374171, "platform": "Amiga OCS/ECS", "release_date": "2025-06-28",
        "screenshot_url": "https://media.demozoo.org/screens/o/c6/2c/30f8.363134.png",
        "youtube_url": None, "pouet_url": None,
        "scene_org_url": "https://files.scene.org/view/parties/2025/posadas25/graphics_ocs/harvest_-_inercia_2025.zip",
    },
    # --- AGA Pixel Gfx ---
    "Whos afraid of batman group": {
        "demozoo_id": 374172, "platform": "Amiga AGA", "release_date": "2025-06-28",
        "screenshot_url": "https://media.demozoo.org/screens/o/ff/d2/d9db.363379.png",
        "youtube_url": None, "pouet_url": None,
        "scene_org_url": "https://files.scene.org/view/parties/2025/posadas25/graphics_aga/zaac_-_whos_afraid_of_batman_group.zip",
    },
    # --- AGA Intro ---
    "Ephemeral Permanence": {
        "demozoo_id": 374173, "platform": "Amiga AGA", "release_date": "2025-06-28",
        "screenshot_url": "https://media.demozoo.org/screens/o/29/a0/27b5.363263.png",
        "youtube_url": "https://www.youtube.com/watch?v=BplaVdGh3Lo",
        "pouet_url": "https://www.pouet.net/prod.php?which=104381",
        "scene_org_url": "https://files.scene.org/view/parties/2025/posadas25/intro_aga_64k/sfl-ephemeralpermanence.lha",
    },
    # --- Fast Gfx ---
    "Sierrezuelo Común": {
        "demozoo_id": 374174, "platform": "Amiga OCS/ECS", "release_date": "2025-06-28",
        "screenshot_url": "https://media.demozoo.org/screens/o/0f/cd/6c9c.363381.png",
        "youtube_url": None, "pouet_url": None,
        "scene_org_url": "https://files.scene.org/view/parties/2025/posadas25/fast_graphics/freddy_-_sierrezuelo_comun.zip",
    },
    # --- OCS Intro ---
    "Posadas Chronicles": {
        "demozoo_id": 374175, "platform": "Amiga OCS/ECS", "release_date": "2025-06-28",
        "screenshot_url": "https://media.demozoo.org/screens/o/0c/df/b4be.363207.png",
        "youtube_url": None,
        "pouet_url": "https://www.pouet.net/prod.php?which=104377",
        "scene_org_url": "https://files.scene.org/view/parties/2025/posadas25/intro_ocs_64k/posadaschronicles.zip",
    },
    "Planartunnel 4k": {
        "demozoo_id": 374176, "platform": "Amiga OCS/ECS", "release_date": "2025-06-28",
        "screenshot_url": "https://media.demozoo.org/screens/o/f9/1e/2e25.363143.png",
        "youtube_url": "https://www.youtube.com/watch?v=qkFyqdVQ6OU",
        "pouet_url": "https://www.pouet.net/prod.php?which=104371",
        "scene_org_url": "https://files.scene.org/view/parties/2025/posadas25/intro_ocs_64k/rse-planartunnel.zip",
    },
    # --- OCS Cracktro ---
    "Twelve Jokers In A Deck": {
        "demozoo_id": 374177, "platform": "Amiga OCS/ECS", "release_date": "2025-06-28",
        "screenshot_url": "https://media.demozoo.org/screens/o/c3/12/1401.363397.jpg",
        "youtube_url": "https://www.youtube.com/watch?v=POZNZ7XXiTk",
        "pouet_url": "https://www.pouet.net/prod.php?which=104357",
        "scene_org_url": "https://files.scene.org/view/parties/2025/posadas25/cracktro_ocs/lns_and_tte_-_tjiad.zip",
    },
    "BorealDust": {
        "demozoo_id": 374178, "platform": "Amiga OCS/ECS", "release_date": "2025-06-28",
        "screenshot_url": "https://media.demozoo.org/screens/o/75/18/8934.363398.jpg",
        "youtube_url": "https://www.youtube.com/watch?v=ZnF41VCLH4Q",
        "pouet_url": "https://www.pouet.net/prod.php?which=104356",
        "scene_org_url": "https://files.scene.org/view/parties/2025/posadas25/cracktro_ocs/borealdust.rar",
    },
    "Goblins Cracktris!": {
        "demozoo_id": 374179, "platform": "Amiga OCS/ECS", "release_date": "2025-06-28",
        "screenshot_url": "https://media.demozoo.org/screens/o/24/c9/08a9.363399.png",
        "youtube_url": None,
        "pouet_url": "https://www.pouet.net/prod.php?which=104415",
        "scene_org_url": "https://files.scene.org/view/parties/2025/posadas25/cracktro_ocs/goblins-cracktris.adf",
    },
    "TTTF": {
        "demozoo_id": 374180, "platform": "Amiga OCS/ECS", "release_date": "2025-06-28",
        "screenshot_url": "https://media.demozoo.org/screens/o/85/d1/935d.363162.jpg",
        "youtube_url": "https://www.youtube.com/watch?v=YXMPMCpdk2M",
        "pouet_url": "https://www.pouet.net/prod.php?which=104389",
        "scene_org_url": "https://files.scene.org/view/parties/2025/posadas25/cracktro_ocs/compofillers-tttf.adf",
    },
    "MarshMallow": {
        "demozoo_id": 374181, "platform": "Amiga OCS/ECS", "release_date": "2025-06-28",
        "screenshot_url": "https://media.demozoo.org/screens/o/a1/8f/0da8.363400.png",
        "youtube_url": "https://www.youtube.com/watch?v=pC7JFxz9XbE",
        "pouet_url": "https://www.pouet.net/prod.php?which=104423",
        "scene_org_url": "https://files.scene.org/view/parties/2025/posadas25/cracktro_ocs/ozone_marshmallow.exe",
    },
    # --- Bootblock AGA ---
    "Goblins_Mandaelbro": {
        "demozoo_id": 374182, "platform": "Amiga AGA", "release_date": "2025-06-28",
        "screenshot_url": "https://media.demozoo.org/screens/o/59/e0/52f3.363383.png",
        "youtube_url": None,
        "pouet_url": "https://www.pouet.net/prod.php?which=104413",
        "scene_org_url": "https://files.scene.org/view/parties/2025/posadas25/bootblock_aga/goblins-mandaelbro_bootblock.adf",
    },
    "Chunky Tubular Bells": {
        "demozoo_id": 374183, "platform": "Amiga AGA", "release_date": "2025-06-28",
        "screenshot_url": None, "youtube_url": None,
        "pouet_url": "https://www.pouet.net/prod.php?which=104439",
        "scene_org_url": "https://files.scene.org/view/parties/2025/posadas25/bootblock_aga/goblins-chunkytubullarbells_bootblock.adf",
    },
    # --- Bootblock OCS ---
    "Goblins_Banderolo": {
        "demozoo_id": 374184, "platform": "Amiga OCS/ECS", "release_date": "2025-06-28",
        "screenshot_url": "https://media.demozoo.org/screens/o/5e/54/1ece.363305.png",
        "youtube_url": None,
        "pouet_url": "https://www.pouet.net/prod.php?which=104414",
        "scene_org_url": "https://files.scene.org/view/parties/2025/posadas25/bootblock_ocs/goblins_banderolo_bootblock_ecs.zip",
    },
    # --- Wild ---
    "VI-SAT 01": {
        "demozoo_id": 374186, "platform": "Custom Hardware", "release_date": "2025-06-28",
        "screenshot_url": "https://media.demozoo.org/screens/s/78/6a/b3cb.363147.jpg",
        "youtube_url": "https://www.youtube.com/watch?v=wQpjSa-ZW1Q", "pouet_url": None,
        "scene_org_url": None,
    },
    "inCubus Mundi": {
        "demozoo_id": 374187, "platform": "Android", "release_date": "2025-06-28",
        "screenshot_url": "https://media.demozoo.org/screens/s/00/b4/1727.363137.jpg",
        "youtube_url": "https://www.youtube.com/watch?v=Z8MwsiCRKOo",
        "pouet_url": "https://www.pouet.net/prod.php?which=104390",
        "scene_org_url": None,
    },
    "Te Gusta Guay": {
        "demozoo_id": 374188, "platform": "TIC-80", "release_date": "2025-06-28",
        "screenshot_url": "https://media.demozoo.org/screens/s/fb/8c/3fa8.363135.png",
        "youtube_url": "https://www.youtube.com/watch?v=58vEU79_9x4",
        "pouet_url": "https://www.pouet.net/prod.php?which=104440",
        "scene_org_url": None,
    },
    "GrooveBox Nr 4": {
        "demozoo_id": 374189, "platform": "Amiga AGA", "release_date": "2025-06-28",
        "screenshot_url": "https://media.demozoo.org/screens/o/d8/b0/fcbc.363432.png",
        "youtube_url": "https://www.youtube.com/watch?v=ZzKtZB_SR9c",
        "pouet_url": "https://www.pouet.net/prod.php?which=104441",
        "scene_org_url": "https://files.scene.org/view/parties/2025/posadas25/wild/grt-gb4.zip",
    },
    "Save the date": {
        "demozoo_id": 374190, "platform": "Amiga AGA", "release_date": "2025-06-28",
        "screenshot_url": "https://media.demozoo.org/screens/s/af/e7/8134.363461.jpg",
        "youtube_url": "https://www.youtube.com/watch?v=AFT9__ue0Tc",
        "pouet_url": "https://www.pouet.net/prod.php?which=104442",
        "scene_org_url": "https://files.scene.org/view/parties/2025/posadas25/wild/tek_savethedate.mpeg",
    },
    "Omoide": {
        "demozoo_id": 374191, "platform": "Amiga AGA", "release_date": "2025-06-28",
        "screenshot_url": "https://media.demozoo.org/screens/o/cb/4f/fe7b.363396.jpg",
        "youtube_url": "https://www.youtube.com/watch?v=dBFqwToiQP8",
        "pouet_url": "https://www.pouet.net/prod.php?which=104369",
        "scene_org_url": None,
    },
    "Calling my name (Llámame por mi nombre) ft. Junior Peas": {
        "demozoo_id": 374192, "platform": "Windows", "release_date": "2025-06-28",
        "screenshot_url": None, "youtube_url": None, "pouet_url": None, "scene_org_url": None,
    },
    # --- Homebrew Games ---
    "Ninjyations AGA": {
        "demozoo_id": 374193, "platform": "Amiga AGA", "release_date": "2025-06-28",
        "screenshot_url": "https://media.demozoo.org/screens/o/f3/81/a162.363149.png",
        "youtube_url": None, "pouet_url": None,
        "scene_org_url": "https://files.scene.org/view/parties/2025/posadas25/homebrew_games/s0y-ninjyations_aga.lha",
    },
    "Xenomorph": {
        "demozoo_id": 374194, "platform": "Amiga AGA", "release_date": "2025-06-28",
        "screenshot_url": "https://media.demozoo.org/screens/o/32/1d/1349.363144.jpg",
        "youtube_url": None, "pouet_url": None,
        "scene_org_url": "https://files.scene.org/view/parties/2025/posadas25/homebrew_games/juande-xenomorph_amiga-aga.zip",
    },
    "SwitcherBoy": {
        "demozoo_id": 374195, "platform": "Amiga AGA", "release_date": "2025-06-28",
        "screenshot_url": "https://media.demozoo.org/screens/o/95/02/05fa.363401.png",
        "youtube_url": None, "pouet_url": None,
        "scene_org_url": "https://files.scene.org/view/parties/2025/posadas25/homebrew_games/tecniman-switcherboy_partyversion.rar",
    },
    "The Last Door - episodio 1": {
        "demozoo_id": 374196, "platform": "Amiga AGA", "release_date": "2025-06-28",
        "screenshot_url": "https://media.demozoo.org/screens/o/1d/6f/01f9.363405.png",
        "youtube_url": None, "pouet_url": None,
        "scene_org_url": "https://files.scene.org/view/parties/2025/posadas25/homebrew_games/danielo-tld.exe",
    },
    "BitByBit": {
        "demozoo_id": 374197, "platform": "Amiga AGA", "release_date": "2025-06-28",
        "screenshot_url": "https://media.demozoo.org/screens/o/90/74/9447.363408.png",
        "youtube_url": None, "pouet_url": None,
        "scene_org_url": "https://files.scene.org/view/parties/2025/posadas25/homebrew_games/laguiri-bitbybit_wip.rar",
    },
    "Hundra": {
        "demozoo_id": 374198, "platform": "Amiga AGA", "release_date": "2025-06-28",
        "screenshot_url": "https://media.demozoo.org/screens/s/cd/ed/3e09.363409.jpg",
        "youtube_url": None, "pouet_url": None,
        "scene_org_url": "https://files.scene.org/view/parties/2025/posadas25/homebrew_games/amigafactory-hundra.lha",
    },
    "Apagón!": {
        "demozoo_id": 374199, "platform": "Amiga OCS/ECS", "release_date": "2025-06-28",
        "screenshot_url": "https://media.demozoo.org/screens/o/aa/f2/032d.363136.png",
        "youtube_url": None, "pouet_url": None,
        "scene_org_url": "https://files.scene.org/view/parties/2025/posadas25/homebrew_games/the_blackout_crew-apagon.zip",
    },
    "LogRolling": {
        "demozoo_id": 374200, "platform": "Amiga AGA", "release_date": "2025-06-28",
        "screenshot_url": "https://media.demozoo.org/screens/s/6c/7b/efd0.363433.jpg",
        "youtube_url": None, "pouet_url": None, "scene_org_url": None,
    },
    "Escape To Posadas 2025": {
        "demozoo_id": 374201, "platform": "Amiga AGA", "release_date": "2025-06-28",
        "screenshot_url": "https://media.demozoo.org/screens/o/73/25/60cc.363410.png",
        "youtube_url": None, "pouet_url": None,
        "scene_org_url": "https://files.scene.org/view/parties/2025/posadas25/homebrew_games/mtr-escapetoposadas2025.rar",
    },
}


def download_screenshot(url, retries=3):
    """Download image from URL with retries. Returns (filename, content) or None."""
    import time
    for attempt in range(retries):
        try:
            req = Request(url, headers={'User-Agent': 'DPMS/1.0'})
            response = urlopen(req, timeout=15)
            content = response.read()
            filename = url.rsplit('/', 1)[-1]
            return filename, content
        except (URLError, OSError) as e:
            logger.warning(f"Attempt {attempt + 1}/{retries} failed for {url}: {e}")
            if attempt < retries - 1:
                time.sleep(2 * (attempt + 1))
    logger.error(f"All {retries} attempts failed for {url}")
    return None


def populate_production_details(apps, schema_editor):
    Production = apps.get_model("compos", "Production")

    # Only process Posadas Party 2025 productions
    productions = Production.objects.filter(
        edition__title__icontains="2025"
    ).select_related('edition')

    updated = 0
    screenshots_downloaded = 0

    for prod in productions:
        data = DEMOZOO_DATA.get(prod.title)
        if not data:
            logger.info(f"No Demozoo data for: {prod.title}")
            continue

        # Platform
        platform_name = data.get("platform", "")
        prod.platform = PLATFORM_MAP.get(platform_name, "other") if platform_name else ""

        # Release date
        if data.get("release_date"):
            from datetime import date
            parts = data["release_date"].split("-")
            prod.release_date = date(int(parts[0]), int(parts[1]), int(parts[2]))

        # URLs
        demozoo_id = data.get("demozoo_id")
        if demozoo_id:
            prod.demozoo_url = f"https://demozoo.org/productions/{demozoo_id}/"

        if data.get("youtube_url"):
            prod.youtube_url = data["youtube_url"]
        if data.get("pouet_url") and data["pouet_url"] != "None":
            prod.pouet_url = data["pouet_url"]
        if data.get("scene_org_url"):
            prod.scene_org_url = data["scene_org_url"]

        # Download screenshot
        screenshot_url = data.get("screenshot_url")
        if screenshot_url:
            result = download_screenshot(screenshot_url)
            if result:
                filename, content = result
                # Save to the screenshot field path
                path = f"productions/screenshots/{prod.edition_id}/{prod.id}/{filename}"
                prod.screenshot.save(path, ContentFile(content), save=False)
                screenshots_downloaded += 1

        prod.save()
        updated += 1

    logger.info(
        f"Updated {updated} productions, downloaded {screenshots_downloaded} screenshots"
    )


def reverse_noop(apps, schema_editor):
    pass


class Migration(migrations.Migration):

    dependencies = [
        ("compos", "0013_add_production_details_fields"),
    ]

    operations = [
        migrations.RunPython(populate_production_details, reverse_noop),
    ]
