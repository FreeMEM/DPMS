from django.db import migrations


EDITION_DESCRIPTIONS = {
    "Posadas Party 2026": {
        "en": "POSADAS PARTY 2026 IS BACK AT THE AUDITORIUM!\n26th, 27th and 28th June",
    },
    "Posadas Party 2025": {
        "es": "Posadas Party 2025 - 28 de junio de 2025, Posadas, Córdoba, España",
        "en": "Posadas Party 2025 - June 28th 2025, Posadas, Cordoba, Spain",
    },
}


def populate(apps, schema_editor):
    Edition = apps.get_model("compos", "Edition")
    for title, translations in EDITION_DESCRIPTIONS.items():
        updates = {}
        if "es" in translations:
            updates["description_es"] = translations["es"]
        if "en" in translations:
            updates["description_en"] = translations["en"]
        if updates:
            Edition.objects.filter(title=title).update(**updates)


def reverse_noop(apps, schema_editor):
    pass


class Migration(migrations.Migration):

    dependencies = [
        ("compos", "0021_populate_english_translations"),
    ]

    operations = [
        migrations.RunPython(populate, reverse_noop),
    ]
