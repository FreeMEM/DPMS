""" Users serializers """

# Django
from django.core.mail import EmailMultiAlternatives
from django.contrib.auth import authenticate, password_validation
from django.contrib.auth.models import (
    Group,
)  # modelo grupos de autenticación y autorización
from django.contrib.auth.tokens import default_token_generator
from django.template.loader import render_to_string
from django.db import IntegrityError
from django.conf import settings
from django.utils.http import urlsafe_base64_encode, urlsafe_base64_decode
from django.utils.encoding import force_bytes

# Utilities
from django.utils import timezone
from datetime import timedelta
import jwt
import logging

# Serializers
from dpms.users.serializers.profiles import ProfileModelSerializer

# Django REST Framework
from rest_framework.authtoken.models import Token
from rest_framework.validators import UniqueValidator
from rest_framework import serializers

# Models
from dpms.users.models import User, Profile

logger = logging.getLogger(__name__)


class ResumedUserModelSerializer(serializers.ModelSerializer):
    """Resumed User model serializer"""

    class Meta:
        """Meta class"""

        model = User
        fields = ("email", "first_name", "last_name")


class UserModelSerializer(serializers.ModelSerializer):
    """User model serializer"""

    # defining profile with its serializer makes possible to show profile field data into user's field
    profile = ProfileModelSerializer(read_only=True)
    role = ["user"]

    class Meta:
        """Meta class"""

        model = User
        fields = ("first_name", "last_name", "email", "profile", "groups")


class UserSignUpSerializer(serializers.Serializer):
    """
    User Signup serializer
    Handle sign up data validation and user/profile creation
    """

    class Meta:
        model = User
        fields = ["email", "password"]

    # Account
    email = serializers.EmailField(
        validators=[
            UniqueValidator(
                queryset=User.objects.all(),
                message="Registration could not be completed with this data."
            )
        ],
    )
    username = serializers.CharField(
        min_length=2,
        max_length=50,
        validators=[
            UniqueValidator(
                queryset=User.objects.all(),
                message="Registration could not be completed with this data."
            )
        ],
    )

    # Password
    password = serializers.CharField(min_length=5, max_length=64)
    password_confirmation = serializers.CharField(min_length=5, max_length=64)

    # Name
    first_name = serializers.CharField(min_length=2, max_length=50)
    last_name = serializers.CharField(min_length=2, max_length=50)

    # New fields: Nickname and Group
    nickname = serializers.CharField(
        min_length=2, max_length=50, required=False, allow_blank=True
    )
    group = serializers.CharField(
        min_length=2, max_length=50, required=False, allow_blank=True
    )

    def validate(self, data):
        """Verify passwords match"""
        passwd = data["password"]
        passwd_conf = data["password_confirmation"]

        if passwd != passwd_conf:
            raise serializers.ValidationError("Passwords doesn't match.")

        password_validation.validate_password(passwd)
        return data

    def create(self, data):
        """Handle user and profile creation."""
        try:
            data.pop("password_confirmation")
            user_data = {
                "email": data.get("email"),
                "username": data.get("username"),
                "password": data.get("password"),
                "first_name": data.get("first_name"),
                "last_name": data.get("last_name"),
            }
            user = User.objects.create_user(**user_data, is_verified=False)
            # Asigna el usuario al grupo de autenticación y autorización "DPMS Users"
            dpms_group, created = Group.objects.get_or_create(name="DPMS Users")
            user.groups.add(dpms_group)
            Profile.objects.create(
                user=user,
                nickname=data.get("nickname", ""),
                group=data.get("group", ""),
            )
            self.send_confirmation_email(user)
            return user
        except IntegrityError:
            raise serializers.ValidationError("A user with that email already exists.")
        except Exception as e:
            raise serializers.ValidationError(f"An error occurred: {str(e)}")

    def send_confirmation_email(self, user):
        """Send account verification link to given user."""
        verification_token = self.gen_verification_token(user)
        verification_url = (
            f"{settings.FRONTEND_URL}/verify-account/{verification_token}"
        )
        subject = "Bienvenido @{}! Confirma tu cuenta para empezar a participar en PosadasParty".format(
            user.email
        )
        from_email = "Posadas Party <no-reply@freemem.space>"
        content = render_to_string(
            "emails/users/account_verification.html",
            {"token": verification_token, "user": user, "link": verification_url},
        )
        msg = EmailMultiAlternatives(subject, content, from_email, [user.email])
        msg.attach_alternative(content, "text/html")
        msg.send()

    def gen_verification_token(self, user):
        """Create JWT token that the user can use to verify its account."""
        exp_date = timezone.now() + timedelta(days=3)
        payload = {
            "user": user.email,
            "exp": int(exp_date.timestamp()),
            "type": "email_confirmation",
        }
        token = jwt.encode(payload, settings.SECRET_KEY, algorithm="HS256")
        return token


class UserLoginSerializer(serializers.Serializer):
    """User Login serializer.

    Handle the login request data.
    """

    email = serializers.EmailField()
    password = serializers.CharField(min_length=5, max_length=64)

    def validate(self, data):
        """Check credentials."""
        user = authenticate(username=data["email"], password=data["password"])
        if not user or not user.is_verified:
            raise serializers.ValidationError("Invalid credentials")
        self.context["user"] = user

        return data

    def create(self, data):
        """Generate or retrieve a new token"""
        user = self.context["user"]
        try:
            Token.objects.get(user=user).delete()
        except Token.DoesNotExist:
            pass  # Si el token no existe, simplemente pasamos

        token = Token.objects.create(user=user)
        jwt_access_token = self.generate_jwt_token(user)
        user_groups = user.groups.values_list("name", flat=True)

        return user, token.key, jwt_access_token

    def generate_jwt_token(self, user):
        """Create JWT token that the user can use to verify its account."""
        exp_date = timezone.now() + timedelta(days=30)
        payload = {
            "user_id": user.id,
            "iat": int(timezone.now().timestamp()),
            "exp": int(exp_date.timestamp()),
            "type": "expiration date",
        }
        token = jwt.encode(payload, settings.SECRET_KEY, algorithm="HS256")
        return token


class AccountVerificationSerializer(serializers.Serializer):
    """Account verification serializer"""

    token = serializers.CharField()

    def validate_token(self, data):
        """Verify token is valid"""
        try:
            payload = jwt.decode(data, settings.SECRET_KEY, algorithms=["HS256"])
        except jwt.ExpiredSignatureError:
            raise serializers.ValidationError("Verification link has expired.")
        except jwt.PyJWTError:
            raise serializers.ValidationError("Invalid token")

        if payload["type"] != "email_confirmation":
            raise serializers.ValidationError("Invalid token")

        self.context["payload"] = payload
        return data

    def save(self):
        """Update user's verified status."""
        payload = self.context["payload"]
        user = User.objects.get(email=payload["user"])
        if user.is_verified:
            raise serializers.ValidationError("Account is already verified.")
        user.is_verified = True
        user.save()


class PasswordResetRequestSerializer(serializers.Serializer):
    """Handles password reset request - sends email with reset link."""

    email = serializers.EmailField()

    def validate_email(self, value):
        """Find user by email. Don't raise error if not found (prevent enumeration)."""
        try:
            self._user = User.objects.get(email=value, is_active=True)
        except User.DoesNotExist:
            self._user = None
        return value

    def save(self):
        user = getattr(self, "_user", None)
        if not user:
            logger.info("Password reset requested for non-existent email")
            return

        token = default_token_generator.make_token(user)
        uid = urlsafe_base64_encode(force_bytes(user.pk))
        reset_url = f"{settings.FRONTEND_URL}/reset-password/{uid}/{token}"

        subject = "Restablecer contraseña - PosadasParty"
        from_email = settings.DEFAULT_FROM_EMAIL
        content = render_to_string(
            "emails/users/password_reset.html",
            {"user": user, "link": reset_url},
        )
        msg = EmailMultiAlternatives(subject, content, from_email, [user.email])
        msg.attach_alternative(content, "text/html")
        msg.send()
        logger.info("Password reset email sent to %s", user.email)


class PasswordResetConfirmSerializer(serializers.Serializer):
    """Handles password reset confirmation with token and new password."""

    uid = serializers.CharField()
    token = serializers.CharField()
    password = serializers.CharField(min_length=5, max_length=64)
    password_confirmation = serializers.CharField(min_length=5, max_length=64)

    def validate(self, data):
        # Decode uid and find user
        try:
            uid = urlsafe_base64_decode(data["uid"]).decode()
            user = User.objects.get(pk=uid)
        except (TypeError, ValueError, OverflowError, User.DoesNotExist):
            raise serializers.ValidationError("Invalid reset link.")

        # Validate token
        if not default_token_generator.check_token(user, data["token"]):
            raise serializers.ValidationError("Reset link has expired or is invalid.")

        # Validate passwords match
        if data["password"] != data["password_confirmation"]:
            raise serializers.ValidationError("Passwords don't match.")

        password_validation.validate_password(data["password"])

        self._user = user
        return data

    def save(self):
        user = self._user
        user.set_password(self.validated_data["password"])
        user.save()
        # Invalidate existing tokens to force re-login
        Token.objects.filter(user=user).delete()
