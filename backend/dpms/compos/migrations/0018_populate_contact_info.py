from django.db import migrations


CONTACT_INFO = """\
## Email
- **posadasparty2022@gmail.com**
- **toledanoferrerajd@gmail.com**

## Telegram
Canal oficial (preferente para dudas y contacto rápido): [t.me/posadasparty](https://t.me/posadasparty)

## Redes sociales
- **Twitter:** [@posadasparty](https://twitter.com/posadasparty)
- **Facebook:** [Posadas Party](https://www.facebook.com/posadasparty)
- **Twitch:** [twitch.tv/posadasparty](https://www.twitch.tv/posadasparty)

## Web oficial
[posadasparty.com](https://posadasparty.com)
"""

TRAVEL_INFO = """\
## Lugar del evento
**Auditorio Municipal Felipe Pérez**
Avd. de Andalucía s/n, 14730 Posadas, Córdoba, España

[Ver en Google Maps](https://goo.gl/maps/EziquvdTtxe8MCRR8)

## Cómo llegar en avión
- **Aeropuerto de Córdoba (ODB)**: a 35 km del venue
- **Aeropuerto de Sevilla (SVQ)**: a 120 km, con buenas conexiones de tren y autobús a Córdoba
- **Aeropuerto de Málaga (AGP)**: a 190 km, con tren AVE directo a Córdoba (1h aprox.)

## Cómo llegar en tren
- **Estación de Córdoba Central**: parada de AVE con conexiones desde Madrid (1h45), Sevilla (45min), Málaga (1h) y Barcelona (4h30)
- Desde la estación de Córdoba se puede llegar a Posadas en autobús o coche (30 min aprox.)

## Cómo llegar en autobús
- Líneas interurbanas desde Córdoba capital a Posadas (aprox. 30-40 min)
- Consultar horarios en la estación de autobuses de Córdoba

## Cómo llegar en coche
- Desde Córdoba: A-431 dirección Posadas (30 min)
- Desde Sevilla: A-4 hasta Córdoba, luego A-431 (1h30)
- Desde Madrid: A-4 dirección sur hasta Córdoba (4h)
- Parking disponible en las inmediaciones del auditorio

## Más información
[Turismo Posadas - Cómo llegar](https://posadas.es/turismo/turismo-como_llegar/)
"""


def populate_contact(apps, schema_editor):
    Edition = apps.get_model("compos", "Edition")
    # Populate for Posadas Party 2026
    Edition.objects.filter(title__icontains="2026").update(
        contact_info=CONTACT_INFO,
        travel_info=TRAVEL_INFO,
        contact_form_enabled=True,
        contact_email="posadasparty2022@gmail.com",
    )


def reverse_noop(apps, schema_editor):
    pass


class Migration(migrations.Migration):

    dependencies = [
        ("compos", "0017_add_contact_fields_to_edition"),
    ]

    operations = [
        migrations.RunPython(populate_contact, reverse_noop),
    ]
