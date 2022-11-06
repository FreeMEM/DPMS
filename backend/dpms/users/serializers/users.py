""" Users serializers """

# Django
from django.core.mail import EmailMultiAlternatives
from django.contrib.auth import authenticate, password_validation
from django.template.loader import render_to_string
from django.conf import settings

# Utilities
from django.utils import timezone
from datetime import timedelta
import jwt

# from django.core.validators import RegexValidator

# Serializers
from dpms.users.serializers.profiles import ProfileModelSerializer


# Django REST Framework
from rest_framework.authtoken.models import Token
from rest_framework.validators import UniqueValidator
from rest_framework import serializers

# Models
from dpms.users.models import User, Profile


class ResumedUserModelSerializer(serializers.ModelSerializer):
    """Resumed User model serializer"""

    class Meta:
        """Meta class"""

        model = User
        fields = (
            "username",
            "email",
            "first_name",
            "last_name"
        )


class UserModelSerializer(serializers.ModelSerializer):
    """User model serializer"""

    # defining profile with its serializer makes possible to show profile field data into user's field
    profile = ProfileModelSerializer(read_only=True)
    role = ["user"]

    class Meta:
        """Meta class"""

        model = User
        fields = (
            "username",
            "first_name",
            "last_name",
            "email",
            "profile",
        )


class UserSignUpSerializer(serializers.Serializer):
    """
        User Signup serializer
        Handle sign up data validation and user/profile creation
    """

    # Account
    email = serializers.EmailField(
        validators=[UniqueValidator(queryset=User.objects.all())],  # Valida que sea único dentro del modelo User
    )

    username = serializers.CharField(
        min_length=4,
        max_length=20,
        validators=[UniqueValidator(queryset=User.objects.all())],  # Valida que sea único dentro del modelo User
    )

    # Password
    password = serializers.CharField(min_length=5, max_length=64)
    password_confirmation = serializers.CharField(min_length=5, max_length=64)

    # Name
    first_name = serializers.CharField(min_length=2, max_length=50)
    last_name = serializers.CharField(min_length=2, max_length=50)

    def validate(self, data):
        """Verify passwords match"""
        passwd = data["password"]
        passwd_conf = data["password_confirmation"]
        if passwd != passwd_conf:
            raise serializers.ValidationError("Passwords doesn't match.")
        password_validation.validate_password(passwd)
        return data

    def create(self, data):
        data.pop("password_confirmation")
        user = User.objects.create_user(**data, is_verified=False)
        profile=Profile.objects.create(user=user)
        # self.send_confirmation_email(user)
        return user

    def send_confirmation_email(self, user):
        """Send account verification link to given user."""
        verification_token = self.gen_verification_token(user)
        subject = "Bienvenido @{}! Confirma tu cuenta para empezar a participar en CapacitorParty".format(
            user.username
        )
        from_email = "Capacitor Party <noreply@capacitorparty.com"
        content = render_to_string(
            "emails/users/account_verification.html",
            {"token": verification_token, "user": user},
        )
        # print(content)
        msg = EmailMultiAlternatives(subject, content, from_email, [user.email])
        msg.attach_alternative(content, "text/html")

        # msg.send()

    def gen_verification_token(self, user):
        """Create JWT token that the user can use to verify  its account."""
        exp_date = timezone.now() + timedelta(days=3)
        payload = {
            "user": user.username,
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
        if not user:
            raise serializers.ValidationError("Invalid credentials")
        if not user.is_verified:
            raise serializers.ValidationError("Account is not active yet :-(")
        self.context["user"] = user

        return data

    def create(self, data):
        """Generate or retrieve a new token"""
        jwt_access_token = self.gen_jwt_access_token()
        # token, created = Token.objects.get_or_create(user=self.context["user"])

        if not self.context["user"].allow_concurrence:
            Token.objects.get(user=self.context["user"]).delete()
        token, created = Token.objects.get_or_create(user=self.context["user"])
        return self.context["user"], token.key, jwt_access_token

    def gen_jwt_access_token(self):
        
        """Create JWT token that the user can use to verify  its account."""
        exp_date = timezone.now() + timedelta(days=30)
        payload = {
            "exp": int(exp_date.timestamp()),
            "type": "expiration date",
            "username": self.context["user"].username,
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
        user = User.objects.get(username=payload["user"])
        user.is_verified = True
        user.save()
