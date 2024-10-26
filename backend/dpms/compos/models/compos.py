from django.db import models
from django.contrib.auth import get_user_model

from dpms.utils.models import BaseModel


User = get_user_model()


class Compo(BaseModel):

    name = models.CharField(max_length=255)
    description = models.TextField()
    created_by = models.ForeignKey(
        User, on_delete=models.CASCADE, related_name="compos"
    )


class HasCompo(BaseModel):

    start = models.DateTimeField()
    show_authors_on_slide = models.BooleanField(default=True)
    open_to_upload = models.BooleanField(default=False)
    open_to_update = models.BooleanField(default=False)
    edition = models.ForeignKey("Edition", on_delete=models.CASCADE)
    compo = models.ForeignKey(Compo, on_delete=models.CASCADE)
    created_by = models.ForeignKey(
        User, on_delete=models.CASCADE, related_name="has_compos"
    )
