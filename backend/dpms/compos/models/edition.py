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
    start_date = models.DateTimeField(
        "Start Date",
        blank=True,
        null=True,
        help_text="Date and time when the edition starts"
    )
    end_date = models.DateTimeField(
        "End Date",
        blank=True,
        null=True,
        help_text="Date and time when the edition ends"
    )
    public = models.BooleanField(default=False)
    open_to_upload = models.BooleanField(default=False)
    open_to_update = models.BooleanField(default=False)
    productions_public = models.BooleanField(
        "Productions Public",
        default=False,
        help_text="If False, users can only see their own productions. Enable after voting to publish all productions."
    )
    auto_approve_productions = models.BooleanField(
        "Auto-approve Productions",
        default=True,
        help_text="Automatically approve new productions on submission. If disabled, productions require manual admin approval."
    )
    contact_info = models.TextField(
        "Contact Info",
        blank=True, default='',
        help_text="Contact information in markdown format (social media, email, Telegram, etc.)"
    )
    travel_info = models.TextField(
        "Travel Info",
        blank=True, default='',
        help_text="How to get there: venue address, airports, trains, buses, parking, accommodation (markdown)"
    )
    schedule = models.TextField(
        "Schedule",
        blank=True, default='',
        help_text="Event schedule/programme in markdown format"
    )
    what_to_bring = models.TextField(
        "What to Bring",
        blank=True, default='',
        help_text="What attendees should bring and basic conduct rules (markdown)"
    )
    contact_form_enabled = models.BooleanField(
        "Contact Form Enabled",
        default=False,
        help_text="Enable the public contact form for this edition"
    )
    attendance_count_public = models.BooleanField(
        "Attendance Count Public",
        default=False,
        help_text="Publish the confirmed-attendance counter on the landing page."
    )
    contact_email = models.EmailField(
        "Contact Email",
        blank=True, default='',
        help_text="Email address where contact form messages will be sent"
    )
    compos = models.ManyToManyField(
        "compos.Compo",
        through="compos.HasCompo",
        through_fields=("edition", "compo"),
        related_name="editions",
    )

    def save(self, *args, **kwargs):
        # Track changes for side effects
        productions_public_changed = False
        open_changed = False
        if self.pk:
            try:
                old = Edition.objects.get(pk=self.pk)
                open_changed = old.open_to_upload != self.open_to_upload
                productions_public_changed = (
                    not old.productions_public and self.productions_public
                )
            except Edition.DoesNotExist:
                pass

        super().save(*args, **kwargs)

        # Propagate open_to_upload to all related HasCompo entries
        if open_changed:
            self.hascompo_set.update(open_to_upload=self.open_to_upload)

        # Close voting periods when productions are published
        if productions_public_changed:
            from dpms.compos.models.voting import VotingPeriod

            VotingPeriod.objects.filter(
                edition=self, is_active=True
            ).update(is_active=False)

    def __str__(self):
        return self.title
