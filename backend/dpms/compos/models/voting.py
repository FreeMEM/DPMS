"""
Voting system models for DPMS.

This module contains all models related to the voting system including:
- VotingConfiguration: Configure voting modes and access control per edition
- AttendanceCode: Unique codes for physical attendance verification
- AttendeeVerification: Track verified attendees
- JuryMember: Manage jury members and their compo assignments
- Vote: Store votes from users and jury members
- VotingPeriod: Define when voting is open
"""

# Django and Python libraries
from django.db import models
from django.contrib.auth import get_user_model
from django.core.validators import MinValueValidator, MaxValueValidator
from django.core.exceptions import ValidationError
from django.utils import timezone
from django.db.models import Avg
import random
import string

# Application models
from dpms.utils.models import BaseModel

User = get_user_model()


class VotingConfiguration(BaseModel):
    """
    Configuration for voting in an edition.
    Allows configuring mixed modes (public + jury) and access control.
    """

    edition = models.OneToOneField(
        "Edition", on_delete=models.CASCADE, related_name="voting_config"
    )

    # Voting mode
    VOTING_MODE_CHOICES = [
        ("public", "Votación Pública 100%"),
        ("jury", "Votación por Jurado 100%"),
        ("mixed", "Modalidad Mixta (Público + Jurado)"),
    ]
    voting_mode = models.CharField(
        max_length=10,
        choices=VOTING_MODE_CHOICES,
        default="public",
        verbose_name="Modalidad de votación",
    )
    public_weight = models.PositiveIntegerField(
        default=100,
        validators=[MinValueValidator(0), MaxValueValidator(100)],
        verbose_name="Peso votación pública (%)",
        help_text="Porcentaje de peso de la votación pública (0-100%)",
    )
    jury_weight = models.PositiveIntegerField(
        default=0,
        validators=[MinValueValidator(0), MaxValueValidator(100)],
        verbose_name="Peso votación jurado (%)",
        help_text="Porcentaje de peso de la votación del jurado (0-100%)",
    )

    # Access control
    ACCESS_MODE_CHOICES = [
        ("open", "Abierta por Tiempo"),
        ("code", "Código de Asistencia"),
        ("manual", "Verificación Manual"),
        ("checkin", "Check-in Físico (QR)"),
    ]
    access_mode = models.CharField(
        max_length=10,
        choices=ACCESS_MODE_CHOICES,
        default="open",
        verbose_name="Modo de acceso",
        help_text="Cómo se controla quién puede votar",
    )

    # Results configuration
    results_published = models.BooleanField(
        default=False, verbose_name="Resultados publicados"
    )
    results_published_at = models.DateTimeField(
        null=True, blank=True, verbose_name="Fecha de publicación"
    )
    show_partial_results = models.BooleanField(
        default=False,
        verbose_name="Mostrar resultados parciales",
        help_text="Permitir ver resultados antes del cierre de votación",
    )

    class Meta:
        verbose_name = "Configuración de Votación"
        verbose_name_plural = "Configuraciones de Votación"

    def __str__(self):
        return f"Votación - {self.edition.title}"

    def clean(self):
        """Validate that weights sum 100% in mixed mode"""
        if self.voting_mode == "mixed":
            if self.public_weight + self.jury_weight != 100:
                raise ValidationError(
                    "Los pesos público y jurado deben sumar 100% en modo mixto"
                )

    def calculate_final_score(self, production):
        """
        Calculate the final score for a production based on voting mode.

        Args:
            production: Production instance

        Returns:
            float: Final calculated score
        """
        public_votes = production.votes.filter(is_jury_vote=False)
        jury_votes = production.votes.filter(is_jury_vote=True)

        public_avg = public_votes.aggregate(Avg("score"))["score__avg"] or 0
        jury_avg = jury_votes.aggregate(Avg("score"))["score__avg"] or 0

        if self.voting_mode == "public":
            return public_avg
        elif self.voting_mode == "jury":
            return jury_avg
        else:  # mixed
            return (public_avg * self.public_weight / 100) + (
                jury_avg * self.jury_weight / 100
            )


class AttendanceCode(BaseModel):
    """
    Unique codes to verify physical attendance at the party.
    Generated in batches and distributed to attendees.
    """

    code = models.CharField(max_length=50, unique=True, verbose_name="Código")
    edition = models.ForeignKey(
        "Edition",
        on_delete=models.CASCADE,
        related_name="attendance_codes",
        verbose_name="Edición",
    )
    is_used = models.BooleanField(default=False, verbose_name="Usado")
    used_by = models.ForeignKey(
        User,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="used_codes",
        verbose_name="Usado por",
    )
    used_at = models.DateTimeField(
        null=True, blank=True, verbose_name="Fecha de uso"
    )
    notes = models.TextField(blank=True, verbose_name="Notas")

    class Meta:
        verbose_name = "Código de Asistencia"
        verbose_name_plural = "Códigos de Asistencia"
        ordering = ["code"]

    def __str__(self):
        status = "Usado" if self.is_used else "Disponible"
        return f"{self.code} - {self.edition.title} ({status})"

    def use_code(self, user):
        """
        Mark code as used by a user.

        Args:
            user: User instance

        Raises:
            ValidationError: If code is already used
        """
        if self.is_used:
            raise ValidationError("Este código ya ha sido utilizado")

        self.is_used = True
        self.used_by = user
        self.used_at = timezone.now()
        self.save()

        # Create attendee verification
        AttendeeVerification.objects.create(
            user=user,
            edition=self.edition,
            is_verified=True,
            verification_method="code",
            notes=f"Código: {self.code}",
        )

    @classmethod
    def generate_codes(cls, edition, quantity, prefix=None):
        """
        Generate a batch of attendance codes.

        Args:
            edition: Edition instance
            quantity: Number of codes to generate
            prefix: Optional prefix (defaults to edition slug)

        Returns:
            list: List of created AttendanceCode instances
        """
        if prefix is None:
            # Use first 4 chars of edition title in uppercase
            prefix = edition.title[:4].upper().replace(" ", "")

        codes = []
        for _ in range(quantity):
            # Generate unique code
            while True:
                random_part1 = "".join(
                    random.choices(string.ascii_uppercase + string.digits, k=4)
                )
                random_part2 = "".join(
                    random.choices(string.ascii_uppercase + string.digits, k=4)
                )
                code_string = f"{prefix}-{random_part1}-{random_part2}"

                # Check if code already exists
                if not cls.objects.filter(code=code_string).exists():
                    break

            codes.append(
                cls(
                    code=code_string,
                    edition=edition,
                    is_used=False,
                )
            )

        # Bulk create for performance
        created_codes = cls.objects.bulk_create(codes)
        return created_codes


class AttendeeVerification(BaseModel):
    """
    Record of verified attendees for an edition.
    Controls who can vote based on configured access mode.
    """

    user = models.ForeignKey(
        User,
        on_delete=models.CASCADE,
        related_name="attendee_verifications",
        verbose_name="Usuario",
    )
    edition = models.ForeignKey(
        "Edition",
        on_delete=models.CASCADE,
        related_name="verified_attendees",
        verbose_name="Edición",
    )
    is_verified = models.BooleanField(default=False, verbose_name="Verificado")
    verified_by = models.ForeignKey(
        User,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="verifications_made",
        verbose_name="Verificado por",
    )
    verified_at = models.DateTimeField(
        null=True, blank=True, verbose_name="Fecha de verificación"
    )

    VERIFICATION_METHOD_CHOICES = [
        ("manual", "Verificación Manual"),
        ("code", "Código de Asistencia"),
        ("checkin", "Check-in QR"),
    ]
    verification_method = models.CharField(
        max_length=20,
        choices=VERIFICATION_METHOD_CHOICES,
        default="manual",
        verbose_name="Método de verificación",
    )
    notes = models.TextField(blank=True, verbose_name="Notas")

    class Meta:
        verbose_name = "Verificación de Asistente"
        verbose_name_plural = "Verificaciones de Asistentes"
        unique_together = ["user", "edition"]

    def __str__(self):
        status = "Verificado" if self.is_verified else "Pendiente"
        return f"{self.user.email} - {self.edition.title} ({status})"

    def can_vote(self):
        """
        Check if attendee can vote.

        Returns:
            bool: True if attendee can vote
        """
        config = self.edition.voting_config

        if config.access_mode == "open":
            # In open mode, all verified attendees can vote during voting period
            return True

        # In other modes, must be verified
        return self.is_verified


class JuryMember(BaseModel):
    """
    Jury member for a specific edition.
    Can vote on specific compos or all compos.
    """

    user = models.ForeignKey(
        User,
        on_delete=models.CASCADE,
        related_name="jury_memberships",
        verbose_name="Usuario",
    )
    edition = models.ForeignKey(
        "Edition",
        on_delete=models.CASCADE,
        related_name="jury_members",
        verbose_name="Edición",
    )
    compos = models.ManyToManyField(
        "Compo",
        blank=True,
        related_name="jury_members",
        verbose_name="Competiciones",
        help_text="Compos en las que puede votar. Vacío = todas las compos",
    )
    notes = models.TextField(
        blank=True,
        verbose_name="Notas",
        help_text="Información adicional sobre el miembro del jurado",
    )

    class Meta:
        unique_together = ["user", "edition"]
        verbose_name = "Miembro del Jurado"
        verbose_name_plural = "Miembros del Jurado"

    def __str__(self):
        return f"{self.user.email} - Jurado {self.edition.title}"

    def can_vote_in_compo(self, compo):
        """
        Check if jury member can vote in a specific compo.

        Args:
            compo: Compo instance

        Returns:
            bool: True if can vote in this compo
        """
        # If no compos assigned, can vote in all
        if not self.compos.exists():
            return True

        # Check if compo is in their list
        return self.compos.filter(id=compo.id).exists()

    def get_voting_progress(self):
        """
        Get jury voting progress.

        Returns:
            dict: Voting statistics
        """
        from .productions import Production

        # Get compos this jury member can vote in
        if self.compos.exists():
            compos = self.compos.all()
        else:
            # Can vote in all compos of the edition
            from .compos import Compo

            compos = Compo.objects.filter(hascompo__edition=self.edition).distinct()

        # Count productions and votes
        total_productions = Production.objects.filter(
            edition=self.edition, compo__in=compos
        ).count()

        votes_cast = Vote.objects.filter(
            user=self.user,
            production__edition=self.edition,
            production__compo__in=compos,
            is_jury_vote=True,
        ).count()

        return {
            "total_productions": total_productions,
            "votes_cast": votes_cast,
            "pending": total_productions - votes_cast,
            "progress_percentage": (votes_cast / total_productions * 100)
            if total_productions > 0
            else 0,
        }


class Vote(BaseModel):
    """
    Votes from users or jury members on productions.
    Supports both public and jury voting.
    """

    user = models.ForeignKey(
        User, on_delete=models.CASCADE, related_name="votes", verbose_name="Usuario"
    )
    production = models.ForeignKey(
        "Production",
        on_delete=models.CASCADE,
        related_name="votes",
        verbose_name="Producción",
    )
    score = models.PositiveIntegerField(
        validators=[MinValueValidator(1), MaxValueValidator(10)],
        verbose_name="Puntuación",
    )
    comment = models.TextField(
        blank=True, max_length=500, verbose_name="Comentario"
    )
    is_jury_vote = models.BooleanField(
        default=False,
        verbose_name="Voto de jurado",
        help_text="Indica si este voto es de un miembro del jurado",
    )

    class Meta:
        verbose_name = "Voto"
        verbose_name_plural = "Votos"
        unique_together = [["user", "production"]]
        ordering = ["-created"]
        indexes = [
            models.Index(fields=["production", "is_jury_vote"]),
        ]

    def __str__(self):
        vote_type = "Jurado" if self.is_jury_vote else "Público"
        return (
            f"{self.user.email} → {self.production.title}: {self.score}/10 ({vote_type})"
        )

    def clean(self):
        """Business validations"""
        edition = self.production.edition

        # Check voting configuration exists
        if not hasattr(edition, "voting_config"):
            raise ValidationError("La edición no tiene configuración de votación")

        config = edition.voting_config

        # Check voting period
        voting_period = VotingPeriod.objects.filter(
            edition=edition, is_active=True
        ).first()

        if not voting_period or not voting_period.is_open():
            raise ValidationError("El período de votación no está abierto")

        # Check voting mode
        if config.voting_mode == "jury" and not self.is_jury_vote:
            raise ValidationError("Esta edición solo acepta votos del jurado")

        # If jury vote, verify user is jury member
        if self.is_jury_vote:
            jury_member = JuryMember.objects.filter(
                user=self.user, edition=edition
            ).first()

            if not jury_member:
                raise ValidationError(
                    "El usuario no es miembro del jurado de esta edición"
                )

            if not jury_member.can_vote_in_compo(self.production.compo):
                raise ValidationError(
                    f"El jurado no está asignado a la compo {self.production.compo.name}"
                )

        # If public vote, verify access based on mode
        if not self.is_jury_vote and config.access_mode != "open":
            verification = AttendeeVerification.objects.filter(
                user=self.user, edition=edition, is_verified=True
            ).first()

            if not verification:
                raise ValidationError("El usuario no está verificado como asistente")

    def save(self, *args, **kwargs):
        """Auto-detect if jury vote"""
        if not self.pk:  # Only on creation
            is_jury = JuryMember.objects.filter(
                user=self.user, edition=self.production.edition
            ).exists()

            if is_jury:
                self.is_jury_vote = True

        super().save(*args, **kwargs)


class VotingPeriod(BaseModel):
    """
    Defines the time period when voting is open for an edition or compo.
    """

    edition = models.ForeignKey(
        "Edition",
        on_delete=models.CASCADE,
        related_name="voting_periods",
        verbose_name="Edición",
    )
    compo = models.ForeignKey(
        "Compo",
        on_delete=models.CASCADE,
        null=True,
        blank=True,
        related_name="voting_periods",
        verbose_name="Competición",
        help_text="Dejar vacío para aplicar a todas las compos",
    )
    start_date = models.DateTimeField(verbose_name="Inicio de votación")
    end_date = models.DateTimeField(verbose_name="Fin de votación")
    is_active = models.BooleanField(default=True)

    class Meta:
        verbose_name = "Período de Votación"
        verbose_name_plural = "Períodos de Votación"
        ordering = ["-start_date"]

    def __str__(self):
        compo_name = self.compo.name if self.compo else "Todas las compos"
        return f"{self.edition.title} - {compo_name}"

    def is_open(self):
        """
        Check if voting is open now.

        Returns:
            bool: True if voting is currently open
        """
        now = timezone.now()
        return self.is_active and self.start_date <= now <= self.end_date

    def clean(self):
        """Validate dates"""
        if self.end_date <= self.start_date:
            raise ValidationError(
                "La fecha de fin debe ser posterior a la fecha de inicio"
            )
