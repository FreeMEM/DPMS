"""
Attendance model — confirmation that a user will physically attend an edition.

Kept separate from AttendanceCode (voting.py), which is a single-use token
handed out at the venue to verify physical presence during voting. This model
is the RSVP: who plans to come, what gear they bring, where they sleep, and
which days.
"""

from django.contrib.auth import get_user_model
from django.contrib.postgres.fields import ArrayField
from django.db import models

from dpms.utils.models import BaseModel

User = get_user_model()


class Attendance(BaseModel):
    """RSVP of a registered user for a given edition."""

    SLEEPS_AT_VENUE = "venue"
    SLEEPS_AT_EXTERNAL = "external"
    SLEEPS_AT_CHOICES = [
        (SLEEPS_AT_VENUE, "En la party"),
        (SLEEPS_AT_EXTERNAL, "Fuera"),
    ]

    user = models.ForeignKey(
        User,
        on_delete=models.CASCADE,
        related_name="attendances",
        verbose_name="Usuario",
    )
    edition = models.ForeignKey(
        "compos.Edition",
        on_delete=models.CASCADE,
        related_name="attendances",
        verbose_name="Edición",
    )
    equipment = models.TextField(
        "Equipo que trae",
        blank=True,
        default="",
        help_text="Descripción libre del equipo/material que el asistente traerá.",
    )
    sleeps_at = models.CharField(
        "Dónde duerme",
        max_length=10,
        choices=SLEEPS_AT_CHOICES,
        default=SLEEPS_AT_VENUE,
    )
    days = ArrayField(
        models.DateField(),
        verbose_name="Días que asistirá",
        default=list,
        blank=True,
        help_text="Lista de fechas dentro del rango de la edición que el asistente confirma.",
    )

    class Meta:
        verbose_name = "Asistencia"
        verbose_name_plural = "Asistencias"
        constraints = [
            models.UniqueConstraint(
                fields=["user", "edition"],
                name="unique_attendance_per_user_and_edition",
            ),
        ]
        ordering = ("-created",)

    def __str__(self):
        return f"{self.user} → {self.edition}"
