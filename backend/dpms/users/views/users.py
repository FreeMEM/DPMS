""" Users views."""

# Django Rest framework
from rest_framework.response import Response
from rest_framework import mixins, status, viewsets
from rest_framework.decorators import action
from rest_framework.exceptions import AuthenticationFailed, ValidationError

# Serializers
from dpms.users.serializers import (
    UserLoginSerializer,
    UserModelSerializer,
    UserSignUpSerializer,
    AccountVerificationSerializer,
    ProfileModelSerializer,
    PasswordResetRequestSerializer,
    PasswordResetConfirmSerializer,
)

# Models
from dpms.users.models import User

# Permissions
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.throttling import SimpleRateThrottle
from rest_framework.parsers import MultiPartParser, FormParser, JSONParser
from dpms.users.permissions import IsAccountOwner, IsDPMSAdmin


class AuthRateThrottle(SimpleRateThrottle):
    rate = '5/minute'

    def get_cache_key(self, request, view):
        return self.cache_format % {
            'scope': 'auth',
            'ident': self.get_ident(request),
        }

# Utilities
from django.utils import timezone
from datetime import timedelta
import jwt
import logging

# Django
from django.conf import settings

logger = logging.getLogger(__name__)


class UserViewSet(
    mixins.RetrieveModelMixin, mixins.UpdateModelMixin, viewsets.GenericViewSet
):
    """
    User view set.
    Handle sign up, login and account verification
    """

    queryset = User.objects.filter(is_active=True)
    serializer_class = UserModelSerializer
    parser_classes = [MultiPartParser, FormParser, JSONParser]

    lookup_field = "email"
    lookup_url_kwarg = "email"
    lookup_value_regex = "[\w@.\-_]+"

    def get_permissions(self):
        """Assign permissions based on action"""
        if self.action in ["signup", "login", "verify", "password_reset_request", "password_reset_confirm"]:
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

    @action(
        detail=False,
        methods=["get"],
        url_path="admin-list",
        permission_classes=[IsDPMSAdmin],
    )
    def admin_list(self, request):
        """
        Flat list of active users for admin panels.

        If `?edition=<id>` is provided, each row gets an `attends` boolean
        (whether the user has confirmed attendance for that edition) and the
        response includes `confirmed_count` / `total_count` totals for the
        "X/Y confirmados" header. Admin-only.
        """
        from dpms.compos.models import Attendance

        edition_id = request.query_params.get("edition")
        users = (
            User.objects.filter(is_active=True)
            .select_related("profile")
            .order_by("-date_joined")
        )

        attending_ids = set()
        if edition_id:
            attending_ids = set(
                Attendance.objects.filter(edition_id=edition_id)
                .values_list("user_id", flat=True)
            )

        rows = [
            {
                "id": u.id,
                "email": u.email,
                "username": u.username,
                "first_name": u.first_name,
                "last_name": u.last_name,
                "nickname": getattr(u.profile, "nickname", "") if hasattr(u, "profile") else "",
                "is_verified": u.is_verified,
                "date_joined": u.date_joined,
                "attends": (u.id in attending_ids) if edition_id else None,
            }
            for u in users
        ]

        return Response({
            "total_count": len(rows),
            "confirmed_count": len(attending_ids) if edition_id else None,
            "results": rows,
        })

    @action(detail=False, methods=["get"], permission_classes=[IsDPMSAdmin])
    def search(self, request):
        """Search users by email or nickname. Admin only."""

        q = request.query_params.get("q", "").strip()
        if len(q) < 2:
            return Response([])

        from django.db.models import Q

        users = User.objects.filter(
            Q(email__icontains=q)
            | Q(profile__nickname__icontains=q)
            | Q(first_name__icontains=q)
            | Q(last_name__icontains=q)
        ).filter(is_active=True)[:20]

        data = [
            {
                "id": u.id,
                "email": u.email,
                "nickname": getattr(u.profile, "nickname", "") if hasattr(u, "profile") else "",
                "first_name": u.first_name,
                "last_name": u.last_name,
            }
            for u in users
        ]
        return Response(data)

    """ API Actions """

    @action(detail=False, methods=["post"], throttle_classes=[AuthRateThrottle])
    def login(self, request):
        """User sign in."""

        serializer = UserLoginSerializer(data=request.data)
        try:

            serializer.is_valid(raise_exception=True)

            user, token, jwt_access_token = serializer.save()

            extended_data = UserModelSerializer(user).data
            user_groups = user.groups.values_list("name", flat=True)

            data = {
                "user": extended_data,
                "access_token": token,
                "jwt_access_token": jwt_access_token,
                "groups": user_groups,
            }

            return Response(data, status=status.HTTP_202_ACCEPTED)
        except AuthenticationFailed:

            return Response(
                {"detail": "Invalid credentials"}, status=status.HTTP_401_UNAUTHORIZED
            )
        except ValidationError as e:
            if (
                "non_field_errors" in e.detail
                and e.detail["non_field_errors"][0].code == "invalid"
            ):
                return Response(
                    {"detail": "Invalid credentials"},
                    status=status.HTTP_401_UNAUTHORIZED,
                )

    @action(detail=False, methods=["post"], throttle_classes=[AuthRateThrottle])
    def signup(self, request):
        """User sign up."""
        serializer = UserSignUpSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        user = serializer.save()
        data = UserModelSerializer(user).data
        return Response(data, status=status.HTTP_201_CREATED)

    @action(detail=False, methods=["post"], permission_classes=[AllowAny], throttle_classes=[AuthRateThrottle])
    def verify(self, request):
        """Account verification via POST body (token not exposed in URL/logs)"""
        serializer = AccountVerificationSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        serializer.save()

        data = {"message": "Congratulations and welcome to Posadas Party community"}
        return Response(data, status=status.HTTP_200_OK)

    @action(detail=True, methods=["put", "patch"])
    def profile(self, request, *args, **kwargs):
        """Update user profile data"""
        user = self.get_object()
        profile = user.profile
        partial = request.method == "PATCH"
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

    @action(detail=False, methods=["post"], url_path="password-reset", throttle_classes=[AuthRateThrottle])
    def password_reset_request(self, request):
        """Request a password reset email."""
        serializer = PasswordResetRequestSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        serializer.save()
        return Response(
            {"message": "If an account with that email exists, a reset link has been sent."},
            status=status.HTTP_200_OK,
        )

    @action(detail=False, methods=["post"], url_path="password-reset-confirm", throttle_classes=[AuthRateThrottle])
    def password_reset_confirm(self, request):
        """Confirm password reset with token and new password."""
        serializer = PasswordResetConfirmSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        serializer.save()
        return Response(
            {"message": "Password has been reset successfully."},
            status=status.HTTP_200_OK,
        )
