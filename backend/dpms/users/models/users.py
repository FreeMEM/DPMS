""" User model """


# Django
from django.db import models
from django.contrib.auth.models import AbstractUser

from django.utils import timezone

# Utilities
from dpms.utils.models import BaseModel


class User(BaseModel, AbstractUser):
    """User model

    Extend from Django's Abstract User, change the username field
    to email and add some extra fields
    """

    email = models.EmailField(
        "email address",
        unique=True,
        error_messages={"unique": "A user with that email already exists."},
    )

    USERNAME_FIELD = "email"
    REQUIRED_FIELDS = ["username",]


    is_verified = models.BooleanField(
        "Verified",
        default=False,
        help_text="Set to true when the user have verified its email address",
    )

    allow_concurrence = models.BooleanField(
        "Concurrencia permitida",
        default=False,
        help_text="allows you to be logged in on several devices at the same time with the same user",
    )

    def __str__(self):
        """Return nickname"""
        return self.username

    def get_short_name(self):
        return self.username
