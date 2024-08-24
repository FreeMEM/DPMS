""" Users views."""

# Django Rest framework
# from rest_framework.views import APIView

from rest_framework.response import Response
from rest_framework import mixins, status, viewsets
from rest_framework.decorators import action

from pprint import pprint

# Serializers
from dpms.users.serializers import (
    UserLoginSerializer,
    UserModelSerializer,
    UserSignUpSerializer,
    # AccountVerificationSerializer,
    ProfileModelSerializer,
)

# Models
from dpms.users.models import User


# Permissions
from rest_framework.permissions import AllowAny, IsAuthenticated
from dpms.users.permissions import IsAccountOwner

# Utilities
from django.utils import timezone
from datetime import timedelta
import jwt

# Django
from django.conf import settings

# Serializers


class UserViewSet(
    mixins.RetrieveModelMixin, mixins.UpdateModelMixin, viewsets.GenericViewSet
):
    """
    User view set.
    Handle sign up, login and account verification
    """

    # lookup_value_regex = "[0-9.]+"
    queryset = User.objects.filter(is_active=True)
    serializer_class = UserModelSerializer

    lookup_field = "email"
    lookup_url_kwarg = "email"
    lookup_value_regex = "[\w@.-_]+"

    def get_permissions(self):
        """Assign permissions based on action"""
        if self.action in ["signup", "login", "verify"]:
            permissions = [AllowAny]
        elif self.action in [
            "retrieve",
            "update",
            "partial_update",
        ]:
            permissions = [IsAuthenticated, IsAccountOwner]
        else:
            permissions = [IsAuthenticated]

        return [permission() for permission in permissions]

    """ API Actions """

    @action(detail=False, methods=["post"])
    def login(self, request):
        """User sign in."""
        serializer = UserLoginSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        user, token, jwt_access_token = serializer.save()
        extended_data = UserModelSerializer(user).data
        data = {
            "user": extended_data,
            "access_token": token,
            # "jwt_access_token": jwt_access_token,
        }
        return Response(data, status=status.HTTP_202_ACCEPTED)

    @action(detail=False, methods=["post"])
    def signup(self, request):
        """User sign up."""
        serializer = UserSignUpSerializer(data=request.data)

        serializer.is_valid(raise_exception=True)
        user = serializer.save()
        data = UserModelSerializer(user).data
        return Response(data, status=status.HTTP_201_CREATED)

    @action(detail=False, methods=["post"])
    def verify(self, request):
        """Account verification"""

        serializer = AccountVerificationSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        serializer.save()
        data = {"message": "Congratulations and wellcome to Capacitor Party community"}
        return Response(data, status=status.HTTP_200_OK)

    @action(detail=True, methods=["put", "patch"])
    def profile(self, request, *args, **kargs):
        """Update user profile data"""
        user = self.get_object()
        profile = user.profile
        partial = request.method == "PATH"
        serializer = ProfileModelSerializer(profile, data=request.data, partial=partial)
        serializer.is_valid(raise_exception=True)
        serializer.save()
        data = UserModelSerializer(user).data
        return Response(data)

    def retrieve(self, request, *args, **kwargs):
        """Add extra data to the response"""
        response = super(UserViewSet, self).retrieve(request, *args, **kwargs)
        user = self.get_object()
        user_data = UserModelSerializer(user).data
        exp_date = timezone.now() + timedelta(days=30)
        payload = {
            "exp": int(exp_date.timestamp()),
            "type": "expiration date",
            "username": request.user.username,
        }
        token = jwt.encode(payload, settings.SECRET_KEY, algorithm="HS256")

        data = {"user": user_data, "jwt_access_token": token}

        response.data = data

        return response
