"""Copy existing field data to the _es translation fields."""
from django.db import migrations


def copy_to_es(apps, schema_editor):
    Compo = apps.get_model("compos", "Compo")
    for compo in Compo.objects.all():
        compo.description_es = compo.description
        compo.rules_es = compo.rules
        compo.save(update_fields=['description_es', 'rules_es'])

    Edition = apps.get_model("compos", "Edition")
    for edition in Edition.objects.all():
        edition.description_es = edition.description
        edition.contact_info_es = edition.contact_info
        edition.travel_info_es = edition.travel_info
        edition.save(update_fields=['description_es', 'contact_info_es', 'travel_info_es'])


def reverse_noop(apps, schema_editor):
    pass


class Migration(migrations.Migration):

    dependencies = [
        ("compos", "0019_add_translation_fields"),
    ]

    operations = [
        migrations.RunPython(copy_to_es, reverse_noop),
    ]
