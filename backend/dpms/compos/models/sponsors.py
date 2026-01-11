""" Sponsor model """

import os
import uuid
from django.db import models
from django.utils.text import slugify

from dpms.utils.models import BaseModel


def sponsor_logo_upload_to(instance, filename):
    """
    Constructs the upload path for sponsor logo images.
    Path: sponsors/<sponsor-slug>/logo_<uuid>.<ext>
    """
    ext = filename.split(".")[-1].lower()
    sponsor_slug = slugify(instance.name) if instance.name else "untitled"
    unique_filename = f"logo_{uuid.uuid4().hex}.{ext}"
    return os.path.join("sponsors", sponsor_slug, unique_filename)


class Sponsor(BaseModel):
    """
    Sponsor model for party sponsors.
    Can be associated with multiple editions.
    """
    name = models.CharField(max_length=255)
    logo = models.ImageField(
        "Logo",
        upload_to=sponsor_logo_upload_to,
        max_length=255,
        blank=True,
        null=True
    )
    url = models.URLField(
        "Website URL",
        max_length=500,
        blank=True,
        null=True,
        help_text="Sponsor's website URL"
    )
    description = models.TextField(
        blank=True,
        null=True,
        help_text="Optional description of the sponsor"
    )
    display_order = models.PositiveIntegerField(
        default=0,
        help_text="Order in which sponsors are displayed (lower = first)"
    )
    editions = models.ManyToManyField(
        "compos.Edition",
        related_name="sponsors",
        blank=True,
        help_text="Editions this sponsor is associated with"
    )

    class Meta:
        ordering = ['display_order', 'name']

    def __str__(self):
        return self.name
