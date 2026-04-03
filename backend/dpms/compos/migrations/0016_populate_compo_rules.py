from django.db import migrations

COMPO_RULES = {
    "OCS Demo": (
        "## Entrega\n"
        "Máximo **dos discos** (880KB) o dos archivos .adf. Se permiten demos, intros o bootblocks. "
        "El primer disco debe autoarrancar la producción.\n\n"
        "## Máquina\n"
        "A500 kick 1.3 + expansión de 512KB.\n\n"
        "## Normas comunes de demos\n"
        "- La demo debe remitirse como archivo comprimido con todos los ficheros necesarios para su ejecución.\n"
        "- No se aceptarán producciones que no funcionen correctamente en la máquina de competición.\n"
        "- No se permiten componentes software adicionales que requieran instalación.\n"
        "- Debe permitir detener la ejecución con botón derecho del ratón o tecla Escape. Las demos tipo trackmo están exentas.\n"
        "- Duración máxima: **10 minutos** incluyendo tiempos de carga.\n"
        "- Se descalificarán automáticamente las producciones que contengan virus, troyanos o malware.\n"
    ),
    "AGA Demo": (
        "## Entrega\n"
        "Archivo comprimido único (preferiblemente .lha o .lzx) con un tamaño máximo de **20MB** (20.971.520 bytes). "
        "El ejecutable debe estar en el directorio raíz y ser fácilmente distinguible (por ejemplo con extensión .exe).\n\n"
        "## Máquina\n"
        "A1200 + 060 + 64MB RAM.\n\n"
        "## Normas comunes de demos\n"
        "- La demo debe remitirse como archivo comprimido con todos los ficheros necesarios para su ejecución.\n"
        "- No se aceptarán producciones que no funcionen correctamente en la máquina de competición.\n"
        "- No se permiten componentes software adicionales que requieran instalación.\n"
        "- Debe permitir detener la ejecución con botón derecho del ratón o tecla Escape. Las demos tipo trackmo están exentas.\n"
        "- Duración máxima: **10 minutos** incluyendo tiempos de carga.\n"
        "- Se descalificarán automáticamente las producciones que contengan virus, troyanos o malware.\n"
    ),
    "Oldschool Demo": (
        "## Entrega\n"
        "La producción debe ejecutarse en el hardware original o en un emulador cycle-exact de la plataforma elegida.\n\n"
        "## Plataformas\n"
        "Amiga, Commodore 64, Atari ST, ZX Spectrum, MSX y otras máquinas retro.\n\n"
        "## Normas\n"
        "- Duración máxima: **10 minutos** incluyendo tiempos de carga.\n"
        "- Se permite participación remota.\n"
    ),
    "PC Demo": (
        "## Entrega\n"
        "Sin límite de tamaño ni restricciones de hardware.\n\n"
        "## Normas\n"
        "- Producciones audiovisuales en tiempo real que combinan programación de efectos, arte y música sincronizada.\n"
        "- Se permite participación remota.\n"
    ),
    "OCS Intro": (
        "## Entrega\n"
        "Archivo comprimido con un ejecutable de máximo **65.536 bytes** para la compo de 64KB "
        "y de **4.096 bytes** para la de 4KB. Solo se descomprimirá el ejecutable.\n\n"
        "## Máquina\n"
        "A500 kick 1.3 + expansión de 512KB.\n\n"
        "## Normas\n"
        "- Mismas normas generales que las demos: debe funcionar correctamente, no requiere software adicional, "
        "debe permitir detención con botón derecho o Escape (trackmos exentos).\n"
        "- Duración máxima: **10 minutos** incluyendo tiempos de carga y precálculo.\n"
        "- Se descalificarán las producciones con malware.\n"
    ),
    "AGA Intro": (
        "## Entrega\n"
        "Archivo comprimido con un ejecutable de máximo **65.536 bytes** para la compo de 64KB "
        "y de **4.096 bytes** para la de 4KB. Solo se descomprimirá el ejecutable.\n\n"
        "## Máquina\n"
        "A1200 + 060 + 64MB RAM.\n\n"
        "## Normas\n"
        "- Mismas normas generales que las demos: debe funcionar correctamente, no requiere software adicional, "
        "debe permitir detención con botón derecho o Escape (trackmos exentos).\n"
        "- Duración máxima: **10 minutos** incluyendo tiempos de carga y precálculo.\n"
        "- Se descalificarán las producciones con malware.\n"
    ),
    "4K Intro": (
        "## Entrega\n"
        "Ejecutable de máximo **4.096 bytes**. Sin dependencias externas ni recursos adicionales.\n\n"
        "## Normas\n"
        "- Duración máxima: **10 minutos** incluyendo tiempos de carga y precálculo.\n"
        "- Se descalificarán las producciones con malware.\n"
    ),
    "64K Intro": (
        "## Entrega\n"
        "Ejecutable de máximo **65.536 bytes**. Todo debe generarse desde el propio ejecutable.\n\n"
        "## Normas\n"
        "- Duración máxima: **10 minutos** incluyendo tiempos de carga y precálculo.\n"
        "- Se descalificarán las producciones con malware.\n"
    ),
    "OCS Cracktro": (
        "## Concepto\n"
        "Competición de cracktros clásicas centradas en un efecto, mostrando simultáneamente un logo y un scrolltext.\n\n"
        "## Entrega\n"
        "Archivo comprimido con un ejecutable de máximo **65.536 bytes** (64KB). Solo se descomprimirá el ejecutable.\n\n"
        "## Máquina\n"
        "A500 kick 1.3 + expansión de 512KB.\n\n"
        "## Normas\n"
        "- Debe permitir detención con botón derecho o Escape (trackmos exentos).\n"
        "- Duración máxima: **4 minutos** incluyendo tiempos de carga y precálculo.\n"
        "- Se descalificarán las producciones con malware.\n"
    ),
    "AGA Cracktro": (
        "## Concepto\n"
        "Competición de cracktros clásicas centradas en un efecto, mostrando simultáneamente un logo y un scrolltext.\n\n"
        "## Entrega\n"
        "Archivo comprimido con un ejecutable de máximo **65.536 bytes** (64KB). Solo se descomprimirá el ejecutable.\n\n"
        "## Máquina\n"
        "A1200 + 060 + 64MB RAM.\n\n"
        "## Normas\n"
        "- Debe permitir detención con botón derecho o Escape (trackmos exentos).\n"
        "- Duración máxima: **4 minutos** incluyendo tiempos de carga y precálculo.\n"
        "- Se descalificarán las producciones con malware.\n"
    ),
    "Bootblock OCS ": (
        "## Entrega\n"
        "Bootblock de máximo **1.024 bytes** (1KB).\n\n"
        "## Máquina\n"
        "A500 kick 1.3 + expansión de 512KB.\n\n"
        "## Normas\n"
        "- No es necesario que se pueda detener la ejecución ni salir al sistema operativo.\n"
        "- Duración máxima: **4 minutos** incluyendo tiempos de carga y precálculo.\n"
        "- Se recomienda compatibilidad con todos los Amigas aunque sea OCS.\n"
        "- Se descalificarán las producciones con malware.\n"
    ),
    "Bootblock AGA": (
        "## Entrega\n"
        "Bootblock de máximo **1.024 bytes** (1KB).\n\n"
        "## Máquina\n"
        "A1200 + 060 + 64MB RAM.\n\n"
        "## Normas\n"
        "- No es necesario que se pueda detener la ejecución ni salir al sistema operativo.\n"
        "- Duración máxima: **4 minutos** incluyendo tiempos de carga y precálculo.\n"
        "- Se recomienda compatibilidad con todos los Amigas aunque sea OCS.\n"
        "- Se descalificarán las producciones con malware.\n"
    ),
    "Tracked Music": (
        "## Formatos\n"
        "MOD, MED (todas las versiones incluyendo SoundStudio), DBM, AHX.\n\n"
        "## Límites\n"
        "- Tamaño máximo: **1.900KB**.\n"
        "- La música debe ser **original**. No se permiten versiones ni remixes.\n"
    ),
    "Executable Music": (
        "## Entrega\n"
        "Ejecutable único con un tamaño máximo de **32KB** (32.768 bytes). No se permiten ficheros adicionales "
        "ni leer del .txt que acompañe la producción.\n\n"
        "## Máquina\n"
        "A1200 + 060 + 64MB RAM.\n\n"
        "## Herramientas\n"
        "Libertad total: AmigaKlang, Pretracker, sintetizadores propios, MOD con p61 incrustado, etc.\n\n"
        "## Normas\n"
        "- La música debe ser **original**. No se permiten versiones ni remixes.\n"
    ),
    "Streaming Music": (
        "## Formatos\n"
        "MP3, OGG, FLAC o similares.\n\n"
        "## Normas\n"
        "- Sin restricciones de herramientas de producción ni estilo musical.\n"
        "- La pieza debe ser **original**. No se permiten versiones ni remixes.\n"
    ),
    "OCS Pixel Gfx": (
        "## Formato\n"
        "IFF obligatorio. Debe incluir al menos **4 pasos previos** del proceso de creación.\n\n"
        "## Resolución\n"
        "Cualquier resolución soportada por Amigas OCS PAL, **excepto modos HAM**. "
        "Se permiten LoRes, MedRes, HiRes con o sin entrelazado, EHB.\n\n"
        "## Normas\n"
        "- Se permite overscan aunque no se garantiza que sea mostrado completamente.\n"
        "- Debe poderse visualizar con 1.9MB de chipmem libres.\n"
        "- No se hará scroll. Si la imagen excede la pantalla, la parte sobrante no se mostrará.\n"
        "- **No se permiten imágenes generadas por IA.**\n"
    ),
    "AGA Pixel Gfx": (
        "## Formato\n"
        "IFF obligatorio. Debe incluir al menos **4 pasos previos** del proceso de creación.\n\n"
        "## Resolución\n"
        "Cualquier resolución PAL mostrable por un Amiga 1200, incluyendo modos Super-hires entrelazado, HAM6/8, etc.\n\n"
        "## Normas\n"
        "- Se permite overscan aunque no se garantiza que sea mostrado completamente.\n"
        "- Debe poderse visualizar con 1.9MB de chipmem libres.\n"
        "- No se hará scroll. Si la imagen excede la pantalla, la parte sobrante no se mostrará.\n"
        "- **No se permiten imágenes generadas por IA.**\n"
    ),
    "Graphics": (
        "## Técnicas\n"
        "Cualquier técnica: pintura digital, modelado 3D renderizado, fotomanipulación o técnicas mixtas.\n\n"
        "## Normas\n"
        "- Sin restricciones de herramientas, resolución ni paleta de colores.\n"
        "- **No se permiten imágenes generadas por IA.** Si se emplean herramientas de IA debe indicarse explícitamente.\n"
    ),
    "Pixel Graphics": (
        "## Normas\n"
        "- El trabajo debe realizarse píxel a píxel.\n"
        "- No se permiten filtros automáticos, escalado ni herramientas que generen detalle de forma procedural.\n"
        "- **No se permiten imágenes generadas por IA.**\n"
    ),
    "Photo": (
        "## Normas\n"
        "- Las obras deben ser fotografías originales del autor.\n"
        "- Se admite procesado y edición digital, pero la base debe ser una captura fotográfica real.\n"
        "- **No se permite el uso de IA generativa.**\n"
    ),
    "ASCII/ANSI": (
        "## Normas\n"
        "- Arte creado exclusivamente con caracteres ASCII o secuencias de escape ANSI.\n"
        "- La obra debe ser original y no haber sido presentada en competiciones anteriores.\n"
    ),
    "Fast Gfx": (
        "## Desarrollo\n"
        "Competición en vivo durante la party. El **tema se anuncia en el momento**.\n\n"
        "## Normas\n"
        "- Resolución máxima: **1920x1080**.\n"
        "- Debe incluir al menos **4 pasos previos** del proceso de creación.\n"
        "- **No se permiten imágenes generadas por IA.**\n"
    ),
    "Fast Music": (
        "## Desarrollo\n"
        "Competición en vivo durante la party. Los **samples, tema y condiciones se anuncian en el momento**.\n\n"
        "## Normas\n"
        "- Los formatos admitidos y duración máxima se anunciarán en la party.\n"
    ),
    "Wild": (
        "## Concepto\n"
        "Categoría libre para producciones que no encajan en otras competiciones: "
        "vídeos, demos para otras plataformas, musicdiscs, slideshows, hardware hacks, etc.\n\n"
        "## Normas\n"
        "- Para producciones en otros ordenadores, agradeceríamos un vídeo y/o traer la máquina.\n"
        "- Avisar con antelación si es posible.\n"
    ),
    "Homebrew games": (
        "## Plataformas\n"
        "Amiga OCS o AGA. Las máquinas de prueba son las mismas que en las competiciones de demos.\n\n"
        "## Herramientas\n"
        "Se permite usar gamemakers y lenguajes diversos: RedPill, Scorpion Engine, Backbone "
        "(con su actualización y key gratuita), GRAC, AMOS, Blitz Basic, C, ASM, etc.\n"
    ),
}


def populate_rules(apps, schema_editor):
    Compo = apps.get_model("compos", "Compo")
    for name, rules in COMPO_RULES.items():
        Compo.objects.filter(name=name).update(rules=rules)


def reverse_noop(apps, schema_editor):
    pass


class Migration(migrations.Migration):

    dependencies = [
        ("compos", "0015_add_rules_to_compo"),
    ]

    operations = [
        migrations.RunPython(populate_rules, reverse_noop),
    ]
