""" File Model """

# Django and Python libraries
import os
import uuid
from django.db import models
from django.contrib.auth import get_user_model
from django.utils.text import slugify

# Application models
from dpms.utils.models import BaseModel

User = get_user_model()


def production_file_upload_to(instance, filename):
    """
    Constructs the upload path for the file, based on the edition title and the compo name.
    Stores the original filename in the instance.
    """
    # Store the original filename in the instance
    instance.original_filename = filename

    # Access the first associated production
    production = instance.productions.first()
    if production:
        edition_title = slugify(production.edition.title)
        compo_name = slugify(production.compo.name)
        # Generate a unique filename using UUID
        ext = filename.split(".")[-1]
        filename_slug = slugify(os.path.splitext(filename)[0])
        unique_filename = f"{filename_slug}_{uuid.uuid4().hex}.{ext}"
        path = os.path.join("files", edition_title, compo_name, unique_filename)
    else:
        unique_filename = f"{slugify(filename)}_{uuid.uuid4().hex}.{ext}"
        path = os.path.join(
            "files", "unknown_edition", "unknown_compo", unique_filename
        )
    return path


class File(BaseModel):
    title = models.CharField(max_length=255)
    description = models.TextField()
    uploaded_by = models.ForeignKey(
        User, on_delete=models.CASCADE, related_name="files"
    )
    # New field to store the original filename
    original_filename = models.CharField(max_length=255, editable=False)
    file = models.FileField(
        "Files", upload_to=production_file_upload_to, max_length=255
    )
    public = models.BooleanField(default=False)
    is_active = models.BooleanField(default=True)
    is_deleted = models.BooleanField(default=False)

    def delete(self, using=None, keep_parents=False):
        self.file.storage.delete(self.file.name)
        super().delete()

    def get_download_filename(self):
        """
        Returns the original filename for downloading purposes.
        """
        return self.original_filename
