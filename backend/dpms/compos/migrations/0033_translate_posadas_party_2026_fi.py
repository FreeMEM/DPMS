"""
Data migration: populate Finnish translations for Posadas Party 2026.

Idempotent: only fills a translated field when it is empty, so manual edits
via the admin are preserved.
"""

from django.db import migrations


EDITION_TITLE = "Posadas Party 2026"


DESCRIPTION_FI = (
    "Paluu Auditorio Municipal Felipe Péreziin. "
    "Kolme päivää demosceneä, kilpailuja ja ystävällistä seuraa."
)


TRAVEL_INFO_FI = """## Tapahtumapaikka
**Auditorio Municipal Felipe Pérez**
Avd. de Andalucía s/n, 14730 Posadas, Córdoba, Espanja

[Katso Google Mapsissa](https://goo.gl/maps/EziquvdTtxe8MCRR8)

## Saapuminen lentäen
- **Córdoban lentokenttä (ODB)**: 35 km tapahtumapaikalta
- **Sevillan lentokenttä (SVQ)**: 120 km, hyvät juna- ja bussiyhteydet Córdobaan
- **Málagan lentokenttä (AGP)**: 190 km, suora AVE-juna Córdobaan (n. 1h)

## Saapuminen junalla
- **Córdoba Centralin asema**: AVE-pysäkki, yhteydet Madridista (1h45), Sevillasta (45min), Málagasta (1h) ja Barcelonasta (4h30)
- Córdoban asemalta Posadasiin pääsee bussilla tai autolla (n. 30 min)

## Saapuminen bussilla
- Kaukoliikennelinjat Córdobasta Posadasiin (n. 30-40 min)
- Aikataulut Córdoban linja-autoasemalta

## Saapuminen autolla
- Córdobasta: A-431 Posadasiin (30 min)
- Sevillasta: A-4 Córdobaan, sitten A-431 (1h30)
- Madridista: A-4 etelään Córdobaan (4h)
- Parkkipaikkoja tapahtumapaikan lähellä

## Lisätietoja
[Posadas Tourism - Saapuminen](https://posadas.es/turismo/turismo-como_llegar/)"""


WHAT_TO_BRING_FI = """## Sisäänpääsy
**Ilmainen** — ennakkoilmoittautuminen vaaditaan

## Mitä tuoda mukaan
- Oma Amiga-tietokoneesi (mieluiten), näyttö ja kaapelit
- Verkkokortti ja verkkokaapeli
- Jatkojohto
- Hygieniatarvikkeet ja puhtaita vaatteita

## Yhteiselo
- Jaamme tilan: kunnioita muiden tilaa
- Vältä paljon sähköä kuluttavia laitteita
- Pidä huolta tiloista ja pidä paikkasi siistinä
- Aiheuttajan vastuulla ovat kaikki vahingot

## Ilmoittautuminen
1. Ennakkoilmoittautuminen verkkosivuston lomakkeella
2. Saavuttuasi kirjaudu äänestysjärjestelmään
3. Luo tili ja lataa tuotantosi

## Demoscene
Demoscene on digitaalisen taiteen muoto, jonka **UNESCO** on tunnustanut aineettomaksi kulttuuriperinnöksi. Se yhdistää ohjelmointia, grafiikkaa ja musiikkia reaaliaikaisissa audiovisuaalisissa tuotannoissa."""


CONTACT_INFO_FI = """## Sähköposti
- **posadasparty2022@gmail.com**
- **toledanoferrerajd@gmail.com**

## Telegram
Virallinen kanava (suositus kysymyksille ja nopealle yhteydenpidolle): [t.me/posadasparty](https://t.me/posadasparty)

## Sosiaalinen media
- **Twitter:** [@posadasparty](https://twitter.com/posadasparty)
- **Facebook:** [Posadas Party](https://www.facebook.com/posadasparty)
- **Twitch:** [twitch.tv/posadasparty](https://www.twitch.tv/posadasparty)"""


FIELD_MAP = {
    "description": DESCRIPTION_FI,
    "travel_info": TRAVEL_INFO_FI,
    "what_to_bring": WHAT_TO_BRING_FI,
    "contact_info": CONTACT_INFO_FI,
}


def populate_finnish(apps, schema_editor):
    Edition = apps.get_model("compos", "Edition")
    edition = Edition.objects.filter(title=EDITION_TITLE).first()
    if not edition:
        return

    updated = False
    for field, value in FIELD_MAP.items():
        attr = f"{field}_fi"
        if not getattr(edition, attr, None):
            setattr(edition, attr, value)
            updated = True
    if updated:
        edition.save()


def clear_finnish(apps, schema_editor):
    Edition = apps.get_model("compos", "Edition")
    edition = Edition.objects.filter(title=EDITION_TITLE).first()
    if not edition:
        return
    for field in FIELD_MAP:
        setattr(edition, f"{field}_fi", "")
    edition.save()


class Migration(migrations.Migration):

    dependencies = [
        ("compos", "0032_compo_description_fi_compo_rules_fi_and_more"),
    ]

    operations = [
        migrations.RunPython(populate_finnish, clear_finnish),
    ]
