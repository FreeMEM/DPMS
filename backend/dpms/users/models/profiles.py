""" Profile model """

# Django
from django.db import models


# Utilities
from dpms.utils.models import BaseModel




class Profile(BaseModel):
    """Profile model

    A profile hold's a user's public data like biography, picture, and statistics

    """

    user = models.OneToOneField(
        "users.User", on_delete=models.CASCADE, blank=True, null=True
    )

    extra_information = models.TextField(max_length=500, blank=True)

    avatar = models.ImageField(
        "avatar profile",
        upload_to="users/picture",
        blank=True,
        null=True,
    )
    nickname = models.CharField(max_length=128, blank=True)
    group = models.CharField(max_length=128, blank=True)
    visit_listing = models.BooleanField(
        "Listing",
        default=False,
        help_text="Do you want to appear on the visitors listing?",
    )

    def __str__(self):
        """return user's str representation"""
        return "{} {} {}".format(self.user.username, self.user.email, self.nickname)
