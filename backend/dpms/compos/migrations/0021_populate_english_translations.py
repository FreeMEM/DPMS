"""Populate English translations for all compo descriptions, rules, and edition contact/travel info."""
from django.db import migrations


COMPO_DESCRIPTIONS_EN = {
    "4K Intro": (
        "Audiovisual executable production with a maximum size of 4096 bytes. "
        "Visual effects, music and code compressed to the extreme. The executable "
        "must run without external dependencies or additional resources. Maximum "
        "duration of 10 minutes including loading and precalculation times."
    ),
    "64K Intro": (
        "Audiovisual executable production with a limit of 65536 bytes. The extra "
        "space compared to 4K allows more elaborate effects and more complex "
        "soundtracks, but everything must be generated from the executable itself. "
        "Maximum duration of 10 minutes including loading and precalculation times."
    ),
    "AGA Cracktro": (
        "Cracktro for Amiga with AGA chipset (A1200 + 060 + 64MB RAM). Competition "
        "focused on a single effect in the style of classic cracking group intros, "
        "with scrolltexts, logos and chip music. Maximum executable size of 65536 "
        "bytes (64KB). Maximum duration of 4 minutes including loading and "
        "precalculation times."
    ),
    "AGA Demo": (
        "Real-time demo for Amiga with AGA chipset. Reference machine: A1200 + 060 "
        "+ 64MB RAM. Delivered as a compressed archive (preferably .lha or .lzx) "
        "with a maximum size of 20MB, with the executable in the root directory. "
        "Maximum duration of 10 minutes including loading times. Must allow stopping "
        "via right mouse button or Escape key."
    ),
    "AGA Intro": (
        "Size-limited intro for Amiga with AGA chipset. Reference machine: A1200 + "
        "060 + 64MB RAM. Maximum executable size of 65536 bytes for the 64KB compo "
        "and 4096 bytes for the 4KB compo. Maximum duration of 10 minutes including "
        "loading and precalculation times."
    ),
    "AGA Pixel Gfx": (
        "Pixel art created within the restrictions of the Amiga AGA chipset. Any PAL "
        "resolution displayable by an Amiga 1200, including Super-hires interlaced, "
        "HAM6/8 modes, etc. IFF format mandatory with at least 4 work-in-progress "
        "steps. Overscan allowed. AI-generated images are not permitted."
    ),
    "ASCII/ANSI": (
        "Visual art created exclusively with ASCII text characters or ANSI escape "
        "sequences. Born in BBS and terminals, this discipline uses typography and "
        "color blocks as the only means of graphic expression. The work must be "
        "original and not previously submitted to other competitions."
    ),
    "Bootblock AGA": (
        "Demo contained in a single Amiga AGA floppy bootblock: exactly 1024 bytes "
        "for code, graphics and sound. Maximum duration of 4 minutes including "
        "loading and precalculation times. Stopping execution or returning to the OS "
        "is not required. Compatibility with all Amigas including OCS is recommended."
    ),
    "Bootblock OCS ": (
        "Demo contained in an Amiga OCS floppy bootblock: exactly 1024 bytes on the "
        "original hardware. Reference machine: A500 kick 1.3 + 512KB. Maximum "
        "duration of 4 minutes including loading and precalculation times. Stopping "
        "execution or returning to the OS is not required."
    ),
    "Executable Music": (
        "Musical composition generated entirely by executable code with a maximum of "
        "32KB (32768 bytes). Reference machine: A1200 + 060 + 64MB RAM. No "
        "additional files or pre-recorded samples allowed. AmigaKlang, Pretracker, "
        "custom synthesizers or other synthesis tools are permitted."
    ),
    "Fast Gfx": (
        "Live graphics competition held during the party. The theme is announced on "
        "the spot. Maximum resolution of 1920x1080. At least 4 work-in-progress "
        "steps must be included. AI-generated images are not permitted."
    ),
    "Fast Music": (
        "Live music competition held during the party. Samples, theme and conditions "
        "are announced at the event. Participants have limited time to compose and "
        "produce a complete musical piece from scratch."
    ),
    "Graphics": (
        "2D graphic work created with any technique: digital painting, rendered 3D "
        "modeling, photo manipulation or mixed techniques. No restrictions on tools, "
        "resolution or color palette. AI-generated images are not permitted. If AI "
        "tools are used, it must be explicitly stated."
    ),
    "Homebrew games": (
        "Games developed for Amiga OCS or AGA. Both gamemakers and various "
        "programming languages are allowed: RedPill, Scorpion Engine, Backbone, GRAC, "
        "AMOS, Blitz Basic, C, ASM. Testing machines are the same as in demo "
        "competitions (A500 for OCS, A1200 for AGA)."
    ),
    "OCS Cracktro": (
        "Cracktro for Amiga with OCS chipset (A500 kick 1.3 + 512KB). Competition "
        "focused on a single effect in the style of classic cracking group intros, "
        "with scrolltexts, animated logos and music through the Paula chip. Maximum "
        "executable size of 65536 bytes (64KB). Maximum duration of 4 minutes."
    ),
    "OCS Demo": (
        "Real-time demo for Amiga with OCS chipset. Reference machine: A500 kick "
        "1.3 + 512KB. Maximum two 880KB disks or two .adf files. The first disk "
        "must autoboot. Maximum duration of 10 minutes including loading times. Must "
        "allow stopping via right mouse button or Escape key."
    ),
    "OCS Intro": (
        "Size-limited intro for Amiga with OCS chipset. Reference machine: A500 "
        "kick 1.3 + 512KB. Maximum executable size of 65536 bytes for the 64KB "
        "compo and 4096 bytes for the 4KB compo. Maximum duration of 10 minutes "
        "including loading and precalculation times."
    ),
    "OCS Pixel Gfx": (
        "Pixel art created within the restrictions of the Amiga OCS chipset. Any "
        "resolution supported by Amiga OCS PAL, except HAM modes. LoRes, MedRes, "
        "HiRes with or without interlace and EHB allowed. IFF format mandatory "
        "with at least 4 work-in-progress steps. AI-generated images are not permitted."
    ),
    "Oldschool Demo": (
        "Real-time demo for classic platforms: Amiga, Commodore 64, Atari ST, ZX "
        "Spectrum, MSX and other retro machines. The production must run on the "
        "original hardware or a cycle-exact emulator of the chosen platform. Remote "
        "participation is allowed."
    ),
    "PC Demo": (
        "Real-time demo for modern PC platforms. No size limit or hardware "
        "restrictions. Audiovisual productions combining effect programming, art "
        "and synchronized music. Remote participation is allowed."
    ),
    "Photo": (
        "Photography competition. Works must be original photographs by the author. "
        "Digital processing and editing is allowed, but the base must be a real "
        "photographic capture, not a generated or illustrated image. Generative AI "
        "is not permitted."
    ),
    "Pixel Graphics": (
        "Pixel art with restricted color palette and resolution. Work must be done "
        "pixel by pixel, without automatic filters, scaling or tools that generate "
        "detail procedurally. AI-generated images are not permitted."
    ),
    "Streaming Music": (
        "Musical composition in digital audio formats: MP3, OGG, FLAC or similar. "
        "No restrictions on production tools or musical style. The piece must be "
        "original, covers and remixes are not allowed. Delivered as a rendered audio file."
    ),
    "Tracked Music": (
        "Music composed in tracker formats: MOD, MED, DBM, AHX or other module "
        "formats. Maximum size of 1900KB. The piece must be original, covers and "
        "remixes are not allowed. Music must play correctly in a standard tracker player."
    ),
    "Wild": (
        "Open category for all productions that don't fit in other competitions: "
        "videos, demos for other platforms, musicdiscs, slideshows, hardware hacks, "
        "animations, interactive installations or any other creation. Can be "
        "presented as video or with a physical machine at the event."
    ),
}

COMPO_RULES_EN = {
    "OCS Demo": (
        "## Delivery\n"
        "Maximum **two disks** (880KB) or two .adf files. Demos, intros and bootblocks are allowed. "
        "The first disk must autoboot the production.\n\n"
        "## Machine\n"
        "A500 kick 1.3 + 512KB expansion.\n\n"
        "## General Demo Rules\n"
        "- The demo must be submitted as a compressed archive with all files needed for execution.\n"
        "- Productions that cannot run correctly on the competition machine will not be accepted.\n"
        "- Additional software components requiring installation are not permitted.\n"
        "- Must allow stopping execution via right mouse button or Escape key. Trackmo-type demos are exempt.\n"
        "- Maximum duration: **10 minutes** including loading times.\n"
        "- Productions containing viruses, trojans or malware will be automatically disqualified.\n"
    ),
    "AGA Demo": (
        "## Delivery\n"
        "Single compressed archive (preferably .lha or .lzx) with a maximum size of **20MB** (20,971,520 bytes). "
        "The executable must be in the root directory and easily distinguishable (e.g., with .exe extension).\n\n"
        "## Machine\n"
        "A1200 + 060 + 64MB RAM.\n\n"
        "## General Demo Rules\n"
        "- The demo must be submitted as a compressed archive with all files needed for execution.\n"
        "- Productions that cannot run correctly on the competition machine will not be accepted.\n"
        "- Additional software components requiring installation are not permitted.\n"
        "- Must allow stopping execution via right mouse button or Escape key. Trackmo-type demos are exempt.\n"
        "- Maximum duration: **10 minutes** including loading times.\n"
        "- Productions containing viruses, trojans or malware will be automatically disqualified.\n"
    ),
    "Oldschool Demo": (
        "## Delivery\n"
        "The production must run on the original hardware or a cycle-exact emulator of the chosen platform.\n\n"
        "## Platforms\n"
        "Amiga, Commodore 64, Atari ST, ZX Spectrum, MSX and other retro machines.\n\n"
        "## Rules\n"
        "- Maximum duration: **10 minutes** including loading times.\n"
        "- Remote participation is allowed.\n"
    ),
    "PC Demo": (
        "## Delivery\n"
        "No size limit or hardware restrictions.\n\n"
        "## Rules\n"
        "- Real-time audiovisual productions combining effect programming, art and synchronized music.\n"
        "- Remote participation is allowed.\n"
    ),
    "OCS Intro": (
        "## Delivery\n"
        "Compressed archive with an executable of maximum **65,536 bytes** for the 64KB compo "
        "and **4,096 bytes** for the 4KB compo. Only the executable will be decompressed.\n\n"
        "## Machine\n"
        "A500 kick 1.3 + 512KB expansion.\n\n"
        "## Rules\n"
        "- Same general rules as demos: must run correctly, no additional software required, "
        "must allow stopping via right mouse button or Escape (trackmos exempt).\n"
        "- Maximum duration: **10 minutes** including loading and precalculation times.\n"
        "- Productions containing malware will be disqualified.\n"
    ),
    "AGA Intro": (
        "## Delivery\n"
        "Compressed archive with an executable of maximum **65,536 bytes** for the 64KB compo "
        "and **4,096 bytes** for the 4KB compo. Only the executable will be decompressed.\n\n"
        "## Machine\n"
        "A1200 + 060 + 64MB RAM.\n\n"
        "## Rules\n"
        "- Same general rules as demos: must run correctly, no additional software required, "
        "must allow stopping via right mouse button or Escape (trackmos exempt).\n"
        "- Maximum duration: **10 minutes** including loading and precalculation times.\n"
        "- Productions containing malware will be disqualified.\n"
    ),
    "4K Intro": (
        "## Delivery\n"
        "Executable of maximum **4,096 bytes**. No external dependencies or additional resources.\n\n"
        "## Rules\n"
        "- Maximum duration: **10 minutes** including loading and precalculation times.\n"
        "- Productions containing malware will be disqualified.\n"
    ),
    "64K Intro": (
        "## Delivery\n"
        "Executable of maximum **65,536 bytes**. Everything must be generated from the executable itself.\n\n"
        "## Rules\n"
        "- Maximum duration: **10 minutes** including loading and precalculation times.\n"
        "- Productions containing malware will be disqualified.\n"
    ),
    "OCS Cracktro": (
        "## Concept\n"
        "Classic cracktro competition focused on a single effect, simultaneously showing a logo and a scrolltext.\n\n"
        "## Delivery\n"
        "Compressed archive with an executable of maximum **65,536 bytes** (64KB). Only the executable will be decompressed.\n\n"
        "## Machine\n"
        "A500 kick 1.3 + 512KB expansion.\n\n"
        "## Rules\n"
        "- Must allow stopping via right mouse button or Escape (trackmos exempt).\n"
        "- Maximum duration: **4 minutes** including loading and precalculation times.\n"
        "- Productions containing malware will be disqualified.\n"
    ),
    "AGA Cracktro": (
        "## Concept\n"
        "Classic cracktro competition focused on a single effect, simultaneously showing a logo and a scrolltext.\n\n"
        "## Delivery\n"
        "Compressed archive with an executable of maximum **65,536 bytes** (64KB). Only the executable will be decompressed.\n\n"
        "## Machine\n"
        "A1200 + 060 + 64MB RAM.\n\n"
        "## Rules\n"
        "- Must allow stopping via right mouse button or Escape (trackmos exempt).\n"
        "- Maximum duration: **4 minutes** including loading and precalculation times.\n"
        "- Productions containing malware will be disqualified.\n"
    ),
    "Bootblock OCS ": (
        "## Delivery\n"
        "Bootblock of maximum **1,024 bytes** (1KB).\n\n"
        "## Machine\n"
        "A500 kick 1.3 + 512KB expansion.\n\n"
        "## Rules\n"
        "- Stopping execution or returning to the OS is not required.\n"
        "- Maximum duration: **4 minutes** including loading and precalculation times.\n"
        "- Compatibility with all Amigas including OCS is recommended.\n"
        "- Productions containing malware will be disqualified.\n"
    ),
    "Bootblock AGA": (
        "## Delivery\n"
        "Bootblock of maximum **1,024 bytes** (1KB).\n\n"
        "## Machine\n"
        "A1200 + 060 + 64MB RAM.\n\n"
        "## Rules\n"
        "- Stopping execution or returning to the OS is not required.\n"
        "- Maximum duration: **4 minutes** including loading and precalculation times.\n"
        "- Compatibility with all Amigas including OCS is recommended.\n"
        "- Productions containing malware will be disqualified.\n"
    ),
    "Tracked Music": (
        "## Formats\n"
        "MOD, MED (all versions including SoundStudio), DBM, AHX.\n\n"
        "## Limits\n"
        "- Maximum size: **1,900KB**.\n"
        "- Music must be **original**. Covers and remixes are not allowed.\n"
    ),
    "Executable Music": (
        "## Delivery\n"
        "Single executable with a maximum size of **32KB** (32,768 bytes). No additional files "
        "or reading from the accompanying .txt file is allowed.\n\n"
        "## Machine\n"
        "A1200 + 060 + 64MB RAM.\n\n"
        "## Tools\n"
        "Full freedom: AmigaKlang, Pretracker, custom synthesizers, MOD with embedded p61, etc.\n\n"
        "## Rules\n"
        "- Music must be **original**. Covers and remixes are not allowed.\n"
    ),
    "Streaming Music": (
        "## Formats\n"
        "MP3, OGG, FLAC or similar.\n\n"
        "## Rules\n"
        "- No restrictions on production tools or musical style.\n"
        "- The piece must be **original**. Covers and remixes are not allowed.\n"
    ),
    "OCS Pixel Gfx": (
        "## Format\n"
        "IFF mandatory. Must include at least **4 work-in-progress steps**.\n\n"
        "## Resolution\n"
        "Any resolution supported by Amiga OCS PAL, **except HAM modes**. "
        "LoRes, MedRes, HiRes with or without interlace, EHB allowed.\n\n"
        "## Rules\n"
        "- Overscan is allowed but full display is not guaranteed.\n"
        "- Must be viewable with 1.9MB of free chipmem.\n"
        "- No scrolling. Parts exceeding screen size will not be shown.\n"
        "- **AI-generated images are NOT allowed.**\n"
    ),
    "AGA Pixel Gfx": (
        "## Format\n"
        "IFF mandatory. Must include at least **4 work-in-progress steps**.\n\n"
        "## Resolution\n"
        "Any PAL resolution displayable by an Amiga 1200, including Super-hires interlaced, HAM6/8 modes, etc.\n\n"
        "## Rules\n"
        "- Overscan is allowed but full display is not guaranteed.\n"
        "- Must be viewable with 1.9MB of free chipmem.\n"
        "- No scrolling. Parts exceeding screen size will not be shown.\n"
        "- **AI-generated images are NOT allowed.**\n"
    ),
    "Graphics": (
        "## Techniques\n"
        "Any technique: digital painting, rendered 3D modeling, photo manipulation or mixed techniques.\n\n"
        "## Rules\n"
        "- No restrictions on tools, resolution or color palette.\n"
        "- **AI-generated images are NOT allowed.** If AI tools are used, it must be explicitly stated.\n"
    ),
    "Pixel Graphics": (
        "## Rules\n"
        "- Work must be done pixel by pixel.\n"
        "- Automatic filters, scaling or tools that generate detail procedurally are not allowed.\n"
        "- **AI-generated images are NOT allowed.**\n"
    ),
    "Photo": (
        "## Rules\n"
        "- Works must be original photographs by the author.\n"
        "- Digital processing and editing is allowed, but the base must be a real photographic capture.\n"
        "- **Generative AI is NOT allowed.**\n"
    ),
    "ASCII/ANSI": (
        "## Rules\n"
        "- Art created exclusively with ASCII characters or ANSI escape sequences.\n"
        "- The work must be original and not previously submitted to other competitions.\n"
    ),
    "Fast Gfx": (
        "## Development\n"
        "Live competition during the party. The **theme is announced on the spot**.\n\n"
        "## Rules\n"
        "- Maximum resolution: **1920x1080**.\n"
        "- Must include at least **4 work-in-progress steps**.\n"
        "- **AI-generated images are NOT allowed.**\n"
    ),
    "Fast Music": (
        "## Development\n"
        "Live competition during the party. **Samples, theme and conditions are announced on the spot**.\n\n"
        "## Rules\n"
        "- Accepted formats and maximum duration will be announced at the party.\n"
    ),
    "Wild": (
        "## Concept\n"
        "Open category for productions that don't fit in other competitions: "
        "videos, demos for other platforms, musicdiscs, slideshows, hardware hacks, etc.\n\n"
        "## Rules\n"
        "- For productions on other computers, we'd appreciate a video and/or bringing the machine.\n"
        "- Please notify in advance if possible.\n"
    ),
    "Homebrew games": (
        "## Platforms\n"
        "Amiga OCS or AGA. Testing machines are the same as in demo competitions.\n\n"
        "## Tools\n"
        "Both gamemakers and various languages are allowed: RedPill, Scorpion Engine, Backbone "
        "(with its free update and key), GRAC, AMOS, Blitz Basic, C, ASM, etc.\n"
    ),
}

EDITION_TRANSLATIONS_EN = {
    "Posadas Party 2026": {
        "contact_info": (
            "## Email\n"
            "- **posadasparty2022@gmail.com**\n"
            "- **toledanoferrerajd@gmail.com**\n\n"
            "## Telegram\n"
            "Official channel (preferred for quick questions and contact): [t.me/posadasparty](https://t.me/posadasparty)\n\n"
            "## Social media\n"
            "- **Twitter:** [@posadasparty](https://twitter.com/posadasparty)\n"
            "- **Facebook:** [Posadas Party](https://www.facebook.com/posadasparty)\n"
            "- **Twitch:** [twitch.tv/posadasparty](https://www.twitch.tv/posadasparty)\n\n"
            "## Official website\n"
            "[posadasparty.com](https://posadasparty.com)\n"
        ),
        "travel_info": (
            "## Venue\n"
            "**Auditorio Municipal Felipe Perez**\n"
            "Avd. de Andalucia s/n, 14730 Posadas, Cordoba, Spain\n\n"
            "[View on Google Maps](https://goo.gl/maps/EziquvdTtxe8MCRR8)\n\n"
            "## By plane\n"
            "- **Cordoba Airport (ODB)**: 35 km from the venue\n"
            "- **Seville Airport (SVQ)**: 120 km, with good train and bus connections to Cordoba\n"
            "- **Malaga Airport (AGP)**: 190 km, with direct AVE high-speed train to Cordoba (approx. 1h)\n\n"
            "## By train\n"
            "- **Cordoba Central Station**: AVE high-speed stop with connections from Madrid (1h45), "
            "Seville (45min), Malaga (1h) and Barcelona (4h30)\n"
            "- From Cordoba station you can reach Posadas by bus or car (approx. 30 min)\n\n"
            "## By bus\n"
            "- Intercity lines from Cordoba to Posadas (approx. 30-40 min)\n"
            "- Check schedules at Cordoba bus station\n\n"
            "## By car\n"
            "- From Cordoba: A-431 towards Posadas (30 min)\n"
            "- From Seville: A-4 to Cordoba, then A-431 (1h30)\n"
            "- From Madrid: A-4 south towards Cordoba (4h)\n"
            "- Parking available near the auditorium\n\n"
            "## More information\n"
            "[Posadas Tourism - How to get there](https://posadas.es/turismo/turismo-como_llegar/)\n"
        ),
    },
}


def populate_en(apps, schema_editor):
    Compo = apps.get_model("compos", "Compo")
    for name, desc_en in COMPO_DESCRIPTIONS_EN.items():
        rules_en = COMPO_RULES_EN.get(name, '')
        Compo.objects.filter(name=name).update(
            description_en=desc_en,
            rules_en=rules_en,
        )

    Edition = apps.get_model("compos", "Edition")
    for title, data in EDITION_TRANSLATIONS_EN.items():
        Edition.objects.filter(title__icontains=title.split()[-1]).update(
            contact_info_en=data.get('contact_info', ''),
            travel_info_en=data.get('travel_info', ''),
        )


def reverse_noop(apps, schema_editor):
    pass


class Migration(migrations.Migration):

    dependencies = [
        ("compos", "0020_copy_existing_data_to_es_fields"),
    ]

    operations = [
        migrations.RunPython(populate_en, reverse_noop),
    ]
