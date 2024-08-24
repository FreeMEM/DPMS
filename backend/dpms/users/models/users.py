""" User model """

# Django
from django.db import models
from django.contrib.auth.models import AbstractUser
from django.utils.translation import gettext_lazy as _

# Utilities
from dpms.utils.models import BaseModel

# Managers
from dpms.users.models.managers import UserManager


class User(BaseModel, AbstractUser):
    """User model"""

    email = models.EmailField(
        _("email address"),
        unique=True,
        error_messages={"unique": _("A user with that email already exists.")},
    )

    USERNAME_FIELD = "email"
    REQUIRED_FIELDS = ["username"]

    is_verified = models.BooleanField(
        _("Verified"),
        default=False,
        help_text=_("Set to true when the user has verified their email address"),
    )

    allow_concurrence = models.BooleanField(
        _("Concurrencia permitida"),
        default=False,
        help_text=_(
            "Allows you to be logged in on several devices at the same time with the same user"
        ),
    )

    objects = UserManager()

    def __str__(self):
        """Return email"""
        return self.email

    def get_short_name(self):
        return self.email
