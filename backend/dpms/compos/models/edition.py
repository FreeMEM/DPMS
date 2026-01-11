""" Edition model """

# Django and Python libraries
import os
import uuid
from django.db import models
from django.contrib.auth import get_user_model
from django.utils.text import slugify

# Application models
from dpms.utils.models import BaseModel

User = get_user_model()


def edition_logo_upload_to(instance, filename):
    """
    Constructs the upload path for edition logo images.
    Path: editions/<edition-slug>/logo_<uuid>.<ext>
    """
    ext = filename.split(".")[-1].lower()
    edition_slug = slugify(instance.title) if instance.title else "untitled"
    unique_filename = f"logo_{uuid.uuid4().hex}.{ext}"
    return os.path.join("editions", edition_slug, unique_filename)


def edition_poster_upload_to(instance, filename):
    """
    Constructs the upload path for edition poster images.
    Path: editions/<edition-slug>/poster_<uuid>.<ext>
    """
    ext = filename.split(".")[-1].lower()
    edition_slug = slugify(instance.title) if instance.title else "untitled"
    unique_filename = f"poster_{uuid.uuid4().hex}.{ext}"
    return os.path.join("editions", edition_slug, unique_filename)


class Edition(BaseModel):
    title = models.CharField(max_length=255)
    description = models.TextField()
    uploaded_by = models.ForeignKey(
        User, on_delete=models.CASCADE, related_name="editions"
    )
    logo = models.ImageField(
        "Logo",
        upload_to=edition_logo_upload_to,
        max_length=255,
        blank=True,
        null=True
    )
    poster = models.ImageField(
        "Poster",
        upload_to=edition_poster_upload_to,
        max_length=255,
        blank=True,
        null=True
    )
    logo_border_color = models.CharField(
        "Logo Border Color",
        max_length=7,
        default="#FFA500",
        help_text="Hex color for logo border/glow (e.g., #FFA500)"
    )
    logo_border_width = models.PositiveIntegerField(
        "Logo Border Width",
        default=0,
        help_text="Border width in pixels (0 = no border)"
    )
    public = models.BooleanField(default=False)
    open_to_upload = models.BooleanField(default=False)
    open_to_update = models.BooleanField(default=False)
    productions_public = models.BooleanField(
        "Productions Public",
        default=False,
        help_text="If False, users can only see their own productions. Enable after voting to publish all productions."
    )
    compos = models.ManyToManyField(
        "compos.Compo",
        through="compos.HasCompo",
        through_fields=("edition", "compo"),
        related_name="editions",
    )
