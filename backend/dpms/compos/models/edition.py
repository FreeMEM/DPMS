""" Edition model """

# Django and Python libraries
from django.db import models
from django.contrib.auth import get_user_model

# Application models
from dpms.utils.models import BaseModel

User = get_user_model()


class Edition(BaseModel):
    title = models.CharField(max_length=255)
    description = models.TextField()
    uploaded_by = models.ForeignKey(
        User, on_delete=models.CASCADE, related_name="editions"
    )
    public = models.BooleanField(default=False)
    open_to_upload = models.BooleanField(default=False)
    open_to_update = models.BooleanField(default=False)
    compos = models.ManyToManyField(
        "compos.Compo",
        through="compos.HasCompo",
        through_fields=("edition", "compo"),
        related_name="editions",
    )
