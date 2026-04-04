from django.db import models
from django.contrib.auth import get_user_model

from dpms.utils.models import BaseModel
from dpms.compos.models import Compo, Edition

User = get_user_model()


STATUS_CHOICES = [
    ('pending', 'Pendiente'),
    ('approved', 'Aprobada'),
    ('rejected', 'Rechazada'),
]

REJECTION_REASONS = [
    ('technical', 'No cumple requisitos técnicos'),
    ('inappropriate', 'Contenido inapropiado'),
    ('wrong_compo', 'Compo incorrecta'),
    ('duplicate', 'Duplicado'),
    ('other', 'Otro'),
]

PLATFORM_CHOICES = [
    ('amiga_ocs', 'Amiga OCS'),
    ('amiga_aga', 'Amiga AGA'),
    ('pc', 'PC'),
    ('c64', 'Commodore 64'),
    ('atari_st', 'Atari ST'),
    ('zx_spectrum', 'ZX Spectrum'),
    ('msx', 'MSX'),
    ('amstrad_cpc', 'Amstrad CPC'),
    ('snes', 'SNES'),
    ('megadrive', 'Mega Drive'),
    ('gameboy', 'Game Boy'),
    ('arduino', 'Arduino'),
    ('web', 'Web/Browser'),
    ('multiplatform', 'Multiplataforma'),
    ('other', 'Otra'),
]


def production_screenshot_path(instance, filename):
    return f'productions/screenshots/{instance.edition_id}/{instance.id}/{filename}'


class Production(BaseModel):
    title = models.CharField(max_length=255)
    authors = models.CharField(max_length=255)
    description = models.TextField(blank=True, default='')
    uploaded_by = models.ForeignKey(
        User, on_delete=models.CASCADE, related_name="productions"
    )
    files = models.ManyToManyField("File", related_name="productions")
    edition = models.ForeignKey(
        Edition, on_delete=models.CASCADE, related_name="productions"
    )
    compo = models.ForeignKey(
        Compo, on_delete=models.CASCADE, related_name="productions"
    )
    platform = models.CharField(
        max_length=20, choices=PLATFORM_CHOICES, blank=True, default=''
    )
    release_date = models.DateField(null=True, blank=True)
    screenshot = models.ImageField(
        upload_to=production_screenshot_path, blank=True, null=True
    )
    youtube_url = models.URLField(blank=True, default='')
    demozoo_url = models.URLField(blank=True, default='')
    pouet_url = models.URLField(blank=True, default='')
    scene_org_url = models.URLField(blank=True, default='')
    status = models.CharField(
        max_length=20, choices=STATUS_CHOICES, default='pending'
    )
    rejection_reason = models.CharField(
        max_length=20, choices=REJECTION_REASONS, blank=True, default=''
    )
    rejection_notes = models.TextField(blank=True, default='')
    reviewed_by = models.ForeignKey(
        User, null=True, blank=True, on_delete=models.SET_NULL,
        related_name="reviewed_productions"
    )
    reviewed_at = models.DateTimeField(null=True, blank=True)
