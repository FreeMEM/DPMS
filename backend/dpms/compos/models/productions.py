from django.db import models
from django.contrib.auth import get_user_model

from dpms.utils.models import BaseModel
from dpms.compos.models import Compo, Edition

User = get_user_model()


class Production(BaseModel):
    title = models.CharField(max_length=255)
    authors = models.CharField(max_length=255)
    description = models.TextField()
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
