""" Gallery Image Model """

import os
import uuid
from django.db import models
from django.contrib.auth import get_user_model
from django.utils.text import slugify

from dpms.utils.models import BaseModel

User = get_user_model()


def gallery_image_upload_to(instance, filename):
    """
    Constructs the upload path for gallery images, based on the edition title.
    Stores the original filename in the instance.
    """
    instance.original_filename = filename

    ext = filename.split(".")[-1].lower()
    filename_slug = slugify(os.path.splitext(filename)[0])
    unique_filename = f"{filename_slug}_{uuid.uuid4().hex}.{ext}"

    if instance.edition:
        edition_title = slugify(instance.edition.title)
        path = os.path.join("gallery", edition_title, unique_filename)
    else:
        path = os.path.join("gallery", "general", unique_filename)

    return path


class GalleryImage(BaseModel):
    """
    Model for storing gallery images uploaded by users.
    Images are organized by edition.
    """
    title = models.CharField(max_length=255, blank=True)
    description = models.TextField(blank=True)
    edition = models.ForeignKey(
        'compos.Edition',
        on_delete=models.CASCADE,
        related_name="gallery_images",
        null=True,
        blank=True
    )
    uploaded_by = models.ForeignKey(
        User,
        on_delete=models.CASCADE,
        related_name="gallery_images"
    )
    original_filename = models.CharField(max_length=255, editable=False, blank=True)
    image = models.ImageField(
        "Image",
        upload_to=gallery_image_upload_to,
        max_length=255
    )
    thumbnail = models.ImageField(
        "Thumbnail",
        upload_to="gallery/thumbnails/",
        max_length=255,
        blank=True,
        null=True
    )
    public = models.BooleanField(default=True)
    is_active = models.BooleanField(default=True)
    is_deleted = models.BooleanField(default=False)

    class Meta:
        verbose_name = "Gallery Image"
        verbose_name_plural = "Gallery Images"
        ordering = ["-created"]

    def __str__(self):
        return self.title or self.original_filename or f"Image {self.id}"

    def delete(self, using=None, keep_parents=False):
        if self.image:
            self.image.storage.delete(self.image.name)
        if self.thumbnail:
            self.thumbnail.storage.delete(self.thumbnail.name)
        super().delete()

    def get_uploader_display_name(self):
        """Returns the display name of the uploader."""
        if hasattr(self.uploaded_by, 'profile') and self.uploaded_by.profile.nickname:
            return self.uploaded_by.profile.nickname
        return self.uploaded_by.first_name or self.uploaded_by.email.split('@')[0]
