from django.db import migrations


COMPO_DESCRIPTIONS = {
    "4K Intro": (
        "Producción audiovisual ejecutable con un tamaño máximo de 4096 bytes. "
        "Efectos visuales, música y código comprimidos al extremo. El ejecutable "
        "debe funcionar sin dependencias externas ni recursos adicionales. Duración "
        "máxima de 10 minutos incluyendo tiempos de carga y precálculo."
    ),
    "64K Intro": (
        "Producción audiovisual ejecutable con un límite de 65536 bytes. El espacio "
        "adicional respecto a la 4K permite efectos más elaborados y bandas sonoras "
        "más complejas, pero todo debe generarse desde el propio ejecutable. Duración "
        "máxima de 10 minutos incluyendo tiempos de carga y precálculo."
    ),
    "AGA Cracktro": (
        "Cracktro para Amiga con chipset AGA (A1200 + 060 + 64MB RAM). Competición "
        "centrada en un efecto al estilo de las intros clásicas de los grupos de "
        "cracking, con scrolltexts, logos y música chip. Ejecutable de un máximo de "
        "65536 bytes (64KB). Duración máxima de 4 minutos incluyendo tiempos de carga "
        "y precálculo."
    ),
    "AGA Demo": (
        "Demo en tiempo real para Amiga con chipset AGA. Máquina de referencia: "
        "A1200 + 060 + 64MB RAM. Entrega en archivo comprimido (preferiblemente .lha "
        "o .lzx) con un tamaño máximo de 20MB, con el ejecutable en el directorio "
        "raíz. Duración máxima de 10 minutos incluyendo tiempos de carga. Debe "
        "permitir detención con botón derecho del ratón o tecla Escape."
    ),
    "AGA Intro": (
        "Intro de tamaño reducido para Amiga con chipset AGA. Máquina de referencia: "
        "A1200 + 060 + 64MB RAM. Ejecutable de un máximo de 65536 bytes para la compo "
        "de 64KB y de 4096 bytes para la de 4KB. Duración máxima de 10 minutos "
        "incluyendo tiempos de carga y precálculo."
    ),
    "AGA Pixel Gfx": (
        "Pixel art creado respetando las restricciones del chipset AGA de Amiga. "
        "Cualquier resolución PAL mostrable por un Amiga 1200, incluyendo modos "
        "Super-hires entrelazado, HAM6/8, etc. Formato IFF obligatorio con al menos "
        "4 pasos previos del proceso de creación. Se permite overscan. No se permiten "
        "imágenes generadas por IA."
    ),
    "ASCII/ANSI": (
        "Arte visual creado exclusivamente con caracteres de texto ASCII o secuencias "
        "de escape ANSI. Nacida en los BBS y terminales, esta disciplina utiliza "
        "tipografía y bloques de color como único medio de expresión gráfica. La obra "
        "debe ser original y no haber sido presentada en competiciones anteriores."
    ),
    "Bootblock AGA": (
        "Demo contenida en un único bootblock de disquete Amiga AGA: exactamente 1024 "
        "bytes para código, gráficos y sonido. Duración máxima de 4 minutos incluyendo "
        "tiempos de carga y precálculo. No se requiere capacidad de detención ni salida "
        "al sistema operativo. Se recomienda compatibilidad con todos los Amigas aunque "
        "sea OCS."
    ),
    "Bootblock OCS ": (
        "Demo contenida en un bootblock de disquete Amiga OCS: exactamente 1024 bytes "
        "sobre el hardware original. Máquina de referencia: A500 kick 1.3 + 512KB. "
        "Duración máxima de 4 minutos incluyendo tiempos de carga y precálculo. No se "
        "requiere capacidad de detención ni salida al sistema operativo."
    ),
    "Executable Music": (
        "Composición musical generada íntegramente por código ejecutable con un máximo "
        "de 32KB (32768 bytes). Máquina de referencia: A1200 + 060 + 64MB RAM. No se "
        "permiten ficheros adicionales ni samples pregrabados. Se permite el uso de "
        "AmigaKlang, Pretracker, sintetizadores propios u otras herramientas de síntesis."
    ),
    "Fast Gfx": (
        "Competición relámpago de gráficos realizada en vivo durante la party. El tema "
        "se anuncia en el momento. Resolución máxima de 1920x1080. Se deben incluir al "
        "menos 4 pasos previos del proceso de creación. No se permiten imágenes "
        "generadas por IA."
    ),
    "Fast Music": (
        "Competición relámpago de música realizada en vivo durante la party. Los "
        "samples, el tema y las condiciones se anuncian en el momento del evento. Los "
        "participantes disponen de un tiempo limitado para componer y producir una pieza "
        "musical completa desde cero."
    ),
    "Graphics": (
        "Obra gráfica 2D creada con cualquier técnica: pintura digital, modelado 3D "
        "renderizado, fotomanipulación o técnicas mixtas. Sin restricciones de "
        "herramientas, resolución ni paleta de colores. No se permiten imágenes "
        "generadas por IA. Si se emplean herramientas de IA debe indicarse "
        "explícitamente."
    ),
    "Homebrew games": (
        "Juegos desarrollados para Amiga OCS o AGA. Se permite el uso de gamemakers y "
        "lenguajes diversos: RedPill, Scorpion Engine, Backbone, GRAC, AMOS, Blitz "
        "Basic, C, ASM. Las máquinas de prueba son las mismas que en las competiciones "
        "de demos (A500 para OCS, A1200 para AGA)."
    ),
    "OCS Cracktro": (
        "Cracktro para Amiga con chipset OCS (A500 kick 1.3 + 512KB). Competición "
        "centrada en un efecto al estilo de las intros clásicas de los grupos de "
        "cracking, con scrolltexts, logos animados y música a través del chip Paula. "
        "Ejecutable de un máximo de 65536 bytes (64KB). Duración máxima de 4 minutos."
    ),
    "OCS Demo": (
        "Demo en tiempo real para Amiga con chipset OCS. Máquina de referencia: A500 "
        "kick 1.3 + 512KB. Máximo dos discos de 880KB o dos archivos .adf. El primer "
        "disco debe autoarrancar. Duración máxima de 10 minutos incluyendo tiempos de "
        "carga. Debe permitir detención con botón derecho del ratón o tecla Escape."
    ),
    "OCS Intro": (
        "Intro de tamaño reducido para Amiga con chipset OCS. Máquina de referencia: "
        "A500 kick 1.3 + 512KB. Ejecutable de un máximo de 65536 bytes para la compo "
        "de 64KB y de 4096 bytes para la de 4KB. Duración máxima de 10 minutos "
        "incluyendo tiempos de carga y precálculo."
    ),
    "OCS Pixel Gfx": (
        "Pixel art creado dentro de las restricciones del chipset OCS de Amiga. "
        "Cualquier resolución soportada por Amigas OCS PAL, con excepción de modos "
        "HAM. Se permiten modos LoRes, MedRes, HiRes con o sin entrelazado y EHB. "
        "Formato IFF obligatorio con al menos 4 pasos previos. No se permiten "
        "imágenes generadas por IA."
    ),
    "Oldschool Demo": (
        "Demo en tiempo real para plataformas clásicas: Amiga, Commodore 64, Atari ST, "
        "ZX Spectrum, MSX y otras máquinas retro. La producción debe ejecutarse en el "
        "hardware original o en un emulador cycle-exact de la plataforma elegida. Se "
        "permite participación remota."
    ),
    "PC Demo": (
        "Demo en tiempo real para plataformas PC modernas. Sin límite de tamaño ni "
        "restricciones de hardware. Producciones audiovisuales que combinan "
        "programación de efectos, arte y música sincronizada. Se permite participación "
        "remota."
    ),
    "Photo": (
        "Competición de fotografía. Las obras deben ser fotografías originales del "
        "autor. Se admite procesado y edición digital, pero la base debe ser una "
        "captura fotográfica real, no una imagen generada o ilustrada. No se permite "
        "el uso de IA generativa."
    ),
    "Pixel Graphics": (
        "Pixel art con paleta de colores y resolución restringidas. El trabajo debe "
        "realizarse píxel a píxel, sin uso de filtros automáticos, escalado ni "
        "herramientas que generen detalle de forma procedural. No se permiten imágenes "
        "generadas por IA."
    ),
    "Streaming Music": (
        "Composición musical en formatos de audio digital: MP3, OGG, FLAC o similares. "
        "Sin restricciones de herramientas de producción ni estilo musical. La pieza "
        "debe ser original, no se permiten versiones ni remixes. La pieza se entrega "
        "como archivo de audio renderizado."
    ),
    "Tracked Music": (
        "Música compuesta en formatos tracker: MOD, MED, DBM, AHX u otros formatos de "
        "módulo. Tamaño máximo de 1900KB. La pieza debe ser original, no se permiten "
        "versiones ni remixes. La música debe reproducirse correctamente en un "
        "reproductor de trackers estándar."
    ),
    "Wild": (
        "Categoría libre para todas aquellas producciones que no encajan en otras "
        "competiciones: vídeos, demos para otras plataformas, musicdiscs, slideshows, "
        "hardware hacks, animaciones, instalaciones interactivas u cualquier otra "
        "creación. Se puede presentar en formato vídeo o con máquina física en el "
        "evento."
    ),
}


def update_descriptions(apps, schema_editor):
    Compo = apps.get_model("compos", "Compo")
    for name, description in COMPO_DESCRIPTIONS.items():
        Compo.objects.filter(name=name).update(description=description)


def reverse_descriptions(apps, schema_editor):
    """No-op reverse: original descriptions are not preserved."""
    pass


class Migration(migrations.Migration):

    dependencies = [
        ("compos", "0011_add_production_status_and_auto_approve"),
    ]

    operations = [
        migrations.RunPython(update_descriptions, reverse_descriptions),
    ]
