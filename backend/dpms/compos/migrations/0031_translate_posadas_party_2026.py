"""
Data migration: populate EN/FR/PT/DE translations for Posadas Party 2026.

Idempotent: only fills a translated field when it is empty, so manual edits
via the admin are preserved.
"""

from django.db import migrations


EDITION_TITLE = "Posadas Party 2026"


DESCRIPTION = {
    "es": "Vuelve al Auditorio Municipal Felipe Pérez. Tres días de demoscene, competiciones y convivencia amiga.",
    "en": "Back at the Auditorio Municipal Felipe Pérez. Three days of demoscene, competitions and good company.",
    "fr": "De retour à l'Auditorio Municipal Felipe Pérez. Trois jours de demoscene, de compétitions et de convivialité.",
    "pt": "De volta ao Auditório Municipal Felipe Pérez. Três dias de demoscene, competições e convivência.",
    "de": "Zurück im Auditorio Municipal Felipe Pérez. Drei Tage Demoscene, Wettbewerbe und Gemeinschaft.",
}


TRAVEL_INFO = {
    "en": """## Venue
**Auditorio Municipal Felipe Pérez**
Avd. de Andalucía s/n, 14730 Posadas, Córdoba, Spain

[View on Google Maps](https://goo.gl/maps/EziquvdTtxe8MCRR8)

## Getting there by plane
- **Córdoba Airport (ODB)**: 35 km from the venue
- **Seville Airport (SVQ)**: 120 km, with good train and bus connections to Córdoba
- **Málaga Airport (AGP)**: 190 km, with direct AVE train to Córdoba (about 1h)

## Getting there by train
- **Córdoba Central station**: AVE stop with connections from Madrid (1h45), Seville (45min), Málaga (1h) and Barcelona (4h30)
- From Córdoba station you can reach Posadas by bus or car (approx. 30 min)

## Getting there by bus
- Intercity lines from Córdoba city to Posadas (approx. 30-40 min)
- Check timetables at the Córdoba bus station

## Getting there by car
- From Córdoba: A-431 towards Posadas (30 min)
- From Seville: A-4 to Córdoba, then A-431 (1h30)
- From Madrid: A-4 south towards Córdoba (4h)
- Parking available near the venue

## More info
[Posadas Tourism - How to get there](https://posadas.es/turismo/turismo-como_llegar/)""",

    "fr": """## Lieu de l'événement
**Auditorio Municipal Felipe Pérez**
Avd. de Andalucía s/n, 14730 Posadas, Córdoba, Espagne

[Voir sur Google Maps](https://goo.gl/maps/EziquvdTtxe8MCRR8)

## Comment venir en avion
- **Aéroport de Córdoba (ODB)** : à 35 km du lieu
- **Aéroport de Séville (SVQ)** : à 120 km, bonnes liaisons en train et en bus vers Córdoba
- **Aéroport de Málaga (AGP)** : à 190 km, avec train AVE direct vers Córdoba (environ 1h)

## Comment venir en train
- **Gare de Córdoba Central** : arrêt AVE avec liaisons depuis Madrid (1h45), Séville (45min), Málaga (1h) et Barcelone (4h30)
- Depuis la gare de Córdoba, on peut rejoindre Posadas en bus ou en voiture (environ 30 min)

## Comment venir en bus
- Lignes interurbaines entre Córdoba et Posadas (env. 30-40 min)
- Consulter les horaires à la gare routière de Córdoba

## Comment venir en voiture
- Depuis Córdoba : A-431 direction Posadas (30 min)
- Depuis Séville : A-4 jusqu'à Córdoba, puis A-431 (1h30)
- Depuis Madrid : A-4 direction sud jusqu'à Córdoba (4h)
- Parking disponible à proximité

## Plus d'informations
[Office de tourisme de Posadas - Comment venir](https://posadas.es/turismo/turismo-como_llegar/)""",

    "pt": """## Local do evento
**Auditorio Municipal Felipe Pérez**
Avd. de Andalucía s/n, 14730 Posadas, Córdoba, Espanha

[Ver no Google Maps](https://goo.gl/maps/EziquvdTtxe8MCRR8)

## Como chegar de avião
- **Aeroporto de Córdoba (ODB)**: a 35 km do local
- **Aeroporto de Sevilha (SVQ)**: a 120 km, com boas ligações de comboio e autocarro a Córdoba
- **Aeroporto de Málaga (AGP)**: a 190 km, com comboio AVE direto para Córdoba (cerca de 1h)

## Como chegar de comboio
- **Estação de Córdoba Central**: paragem do AVE com ligações a partir de Madrid (1h45), Sevilha (45min), Málaga (1h) e Barcelona (4h30)
- Da estação de Córdoba é possível chegar a Posadas de autocarro ou de carro (aprox. 30 min)

## Como chegar de autocarro
- Linhas interurbanas entre Córdoba e Posadas (aprox. 30-40 min)
- Consultar horários na estação de autocarros de Córdoba

## Como chegar de carro
- A partir de Córdoba: A-431 direção Posadas (30 min)
- A partir de Sevilha: A-4 até Córdoba, depois A-431 (1h30)
- A partir de Madrid: A-4 direção sul até Córdoba (4h)
- Estacionamento disponível junto ao local

## Mais informação
[Turismo Posadas - Como chegar](https://posadas.es/turismo/turismo-como_llegar/)""",

    "de": """## Veranstaltungsort
**Auditorio Municipal Felipe Pérez**
Avd. de Andalucía s/n, 14730 Posadas, Córdoba, Spanien

[Auf Google Maps anzeigen](https://goo.gl/maps/EziquvdTtxe8MCRR8)

## Anreise mit dem Flugzeug
- **Flughafen Córdoba (ODB)**: 35 km vom Veranstaltungsort entfernt
- **Flughafen Sevilla (SVQ)**: 120 km, gute Zug- und Busverbindungen nach Córdoba
- **Flughafen Málaga (AGP)**: 190 km, direkter AVE-Zug nach Córdoba (ca. 1h)

## Anreise mit dem Zug
- **Bahnhof Córdoba Central**: AVE-Halt mit Verbindungen aus Madrid (1h45), Sevilla (45min), Málaga (1h) und Barcelona (4h30)
- Vom Bahnhof Córdoba ist Posadas mit dem Bus oder Auto erreichbar (ca. 30 min)

## Anreise mit dem Bus
- Überlandlinien zwischen Córdoba und Posadas (ca. 30-40 min)
- Fahrpläne am Busbahnhof Córdoba einsehen

## Anreise mit dem Auto
- Aus Córdoba: A-431 Richtung Posadas (30 min)
- Aus Sevilla: A-4 bis Córdoba, dann A-431 (1h30)
- Aus Madrid: A-4 Richtung Süden bis Córdoba (4h)
- Parkplätze in der Nähe vorhanden

## Weitere Infos
[Tourismus Posadas - Anreise](https://posadas.es/turismo/turismo-como_llegar/)""",
}


WHAT_TO_BRING = {
    "en": """## Entry
**Free** — advance registration required

## What to bring
- Your Amiga computer (preferably), monitor and cables
- Network card and network cable
- Power strip
- Toiletries and clean clothes

## Coexistence
- We share the space: respect others
- Avoid high-power-consumption devices
- Take care of the facilities and keep your spot clean
- Any damage is the responsibility of the person causing it

## Registration
1. Pre-register via the web form
2. When you arrive, log in to the voting system
3. Create your account and upload your productions

## The Demoscene
The demoscene is a digital art form recognised by **UNESCO** as intangible cultural heritage. It combines programming, graphics and music into real-time audiovisual productions.""",

    "fr": """## Entrée
**Gratuite** — inscription préalable requise

## Quoi apporter
- Ton ordinateur Amiga (de préférence), moniteur et câbles
- Carte réseau et câble réseau
- Multiprise
- Articles d'hygiène et vêtements propres

## Vivre ensemble
- On partage l'espace : respecte celui des autres
- Évite les appareils à forte consommation électrique
- Prends soin des locaux et maintiens ton poste propre
- Tout dégât est à la charge de la personne qui l'a causé

## Inscription
1. Pré-inscription via le formulaire du site web
2. À ton arrivée, connecte-toi au système de vote
3. Crée ton compte et envoie tes productions

## La Demoscene
La demoscene est une forme d'art numérique reconnue par l'**UNESCO** comme patrimoine culturel immatériel. Elle combine programmation, graphismes et musique dans des productions audiovisuelles en temps réel.""",

    "pt": """## Entrada
**Gratuita** — exige pré-inscrição

## O que trazer
- O teu computador Amiga (de preferência), monitor e cabos
- Placa de rede e cabo de rede
- Extensão elétrica
- Artigos de higiene e roupa limpa

## Convivência
- Partilhamos o espaço: respeita o dos outros
- Evita aparelhos de alto consumo elétrico
- Cuida das instalações e mantém o teu posto limpo
- Qualquer dano será da responsabilidade de quem o causar

## Inscrição
1. Pré-inscrição através do formulário no site
2. À chegada, inicia sessão no sistema de votação
3. Cria a tua conta e envia as tuas produções

## A Demoscene
A demoscene é uma forma de arte digital reconhecida pela **UNESCO** como património cultural imaterial. Combina programação, gráficos e música em produções audiovisuais em tempo real.""",

    "de": """## Eintritt
**Kostenlos** — Voranmeldung erforderlich

## Was mitbringen
- Deinen Amiga-Rechner (bevorzugt), Monitor und Kabel
- Netzwerkkarte und Netzwerkkabel
- Steckdosenleiste
- Hygieneartikel und saubere Kleidung

## Miteinander
- Wir teilen den Raum: respektiere die anderen
- Vermeide stromfressende Geräte
- Pflege die Einrichtung und halte deinen Platz sauber
- Jeder Schaden geht zulasten des Verursachers

## Anmeldung
1. Vorab-Anmeldung über das Formular auf der Website
2. Bei der Ankunft im Abstimmungssystem anmelden
3. Konto erstellen und Produktionen hochladen

## Die Demoscene
Die Demoscene ist eine von der **UNESCO** als immaterielles Kulturerbe anerkannte digitale Kunstform. Sie verbindet Programmierung, Grafik und Musik zu audiovisuellen Produktionen in Echtzeit.""",
}


CONTACT_INFO = {
    "en": """## Email
- **posadasparty2022@gmail.com**
- **toledanoferrerajd@gmail.com**

## Telegram
Official channel (preferred for questions and quick contact): [t.me/posadasparty](https://t.me/posadasparty)

## Social media
- **Twitter:** [@posadasparty](https://twitter.com/posadasparty)
- **Facebook:** [Posadas Party](https://www.facebook.com/posadasparty)
- **Twitch:** [twitch.tv/posadasparty](https://www.twitch.tv/posadasparty)""",

    "fr": """## Email
- **posadasparty2022@gmail.com**
- **toledanoferrerajd@gmail.com**

## Telegram
Canal officiel (à privilégier pour les questions et un contact rapide) : [t.me/posadasparty](https://t.me/posadasparty)

## Réseaux sociaux
- **Twitter :** [@posadasparty](https://twitter.com/posadasparty)
- **Facebook :** [Posadas Party](https://www.facebook.com/posadasparty)
- **Twitch :** [twitch.tv/posadasparty](https://www.twitch.tv/posadasparty)""",

    "pt": """## Email
- **posadasparty2022@gmail.com**
- **toledanoferrerajd@gmail.com**

## Telegram
Canal oficial (preferencial para dúvidas e contacto rápido): [t.me/posadasparty](https://t.me/posadasparty)

## Redes sociais
- **Twitter:** [@posadasparty](https://twitter.com/posadasparty)
- **Facebook:** [Posadas Party](https://www.facebook.com/posadasparty)
- **Twitch:** [twitch.tv/posadasparty](https://www.twitch.tv/posadasparty)""",

    "de": """## E-Mail
- **posadasparty2022@gmail.com**
- **toledanoferrerajd@gmail.com**

## Telegram
Offizieller Kanal (bevorzugt für Fragen und schnellen Kontakt): [t.me/posadasparty](https://t.me/posadasparty)

## Soziale Netzwerke
- **Twitter:** [@posadasparty](https://twitter.com/posadasparty)
- **Facebook:** [Posadas Party](https://www.facebook.com/posadasparty)
- **Twitch:** [twitch.tv/posadasparty](https://www.twitch.tv/posadasparty)""",
}


FIELD_MAP = {
    "description": DESCRIPTION,
    "travel_info": TRAVEL_INFO,
    "what_to_bring": WHAT_TO_BRING,
    "contact_info": CONTACT_INFO,
}


def populate_translations(apps, schema_editor):
    Edition = apps.get_model("compos", "Edition")
    edition = Edition.objects.filter(title=EDITION_TITLE).first()
    if not edition:
        return

    updated = False
    for field, langs in FIELD_MAP.items():
        # Ensure ES field is populated from the base column if empty
        es_attr = f"{field}_es"
        base_value = getattr(edition, field, None) or ""
        if not getattr(edition, es_attr, None) and base_value:
            setattr(edition, es_attr, base_value)
            updated = True
        # Apply EN value from the map if provided
        if "es" in langs and not getattr(edition, es_attr, None):
            setattr(edition, es_attr, langs["es"])
            updated = True
        # Fill other languages only if empty (preserve admin edits)
        for code in ("en", "fr", "pt", "de"):
            if code not in langs:
                continue
            attr = f"{field}_{code}"
            if not getattr(edition, attr, None):
                setattr(edition, attr, langs[code])
                updated = True

    if updated:
        edition.save()


def clear_translations(apps, schema_editor):
    Edition = apps.get_model("compos", "Edition")
    edition = Edition.objects.filter(title=EDITION_TITLE).first()
    if not edition:
        return
    for field in FIELD_MAP:
        for code in ("en", "fr", "pt", "de"):
            setattr(edition, f"{field}_{code}", "")
    edition.save()


class Migration(migrations.Migration):

    dependencies = [
        ("compos", "0030_edition_schedule_de_edition_schedule_en_and_more"),
    ]

    operations = [
        migrations.RunPython(populate_translations, clear_translations),
    ]
