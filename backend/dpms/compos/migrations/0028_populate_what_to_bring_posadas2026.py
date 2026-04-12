"""
Data migration: populate what_to_bring for Posadas Party 2026.
"""

from django.db import migrations


WHAT_TO_BRING = """## Entrada
**Gratuita** — se requiere registro previo

## Qué traer
- Tu ordenador Amiga (preferiblemente), monitor y cables
- Tarjeta de red y cable de red
- Regleta de enchufes
- Artículos de aseo y ropa limpia

## Convivencia
- Compartimos espacio: respeta el de los demás
- Evita aparatos de alto consumo eléctrico
- Cuida las instalaciones y mantén limpio tu puesto
- Cualquier desperfecto será responsabilidad del causante

## Registro
1. Pre-registro mediante formulario en la web
2. Al llegar al evento, accede al sistema de votaciones
3. Crea tu cuenta y sube tus producciones

## La Demoscene
La demoscene es una forma de arte digital reconocida por la **UNESCO** como patrimonio cultural inmaterial. Combina programación, gráficos y música en producciones audiovisuales en tiempo real."""


def populate(apps, schema_editor):
    Edition = apps.get_model("compos", "Edition")
    try:
        e = Edition.objects.get(title="Posadas Party 2026")
        e.what_to_bring = WHAT_TO_BRING.strip()
        e.save(update_fields=["what_to_bring"])
    except Edition.DoesNotExist:
        pass


def reverse(apps, schema_editor):
    pass


class Migration(migrations.Migration):

    dependencies = [
        ("compos", "0027_add_schedule_and_what_to_bring"),
    ]

    operations = [
        migrations.RunPython(populate, reverse),
    ]
