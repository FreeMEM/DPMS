"""Attendance ViewSet — RSVP management."""

from rest_framework import status, viewsets
from rest_framework.decorators import action
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response

from dpms.compos.models import Attendance, Edition
from dpms.compos.permissions import IsAdminUser
from dpms.compos.serializers import AttendanceAdminSerializer, AttendanceSerializer


class AttendanceViewSet(viewsets.ModelViewSet):
    """
    Attendance confirmations.

    - list: admin sees all (filterable by ?edition=), users see only their own.
    - create: upserts the current user's attendance for the given edition.
    - retrieve/update/destroy: owner or admin.
    - me: return the current user's attendance for ?edition=<id>.
    - count: public count for an edition, gated by Edition.attendance_count_public.
    """

    queryset = Attendance.objects.select_related("user", "edition", "user__profile")

    def get_serializer_class(self):
        if self._user_is_admin():
            return AttendanceAdminSerializer
        return AttendanceSerializer

    def get_permissions(self):
        if self.action == "count":
            return [AllowAny()]
        return [IsAuthenticated()]

    def get_queryset(self):
        qs = super().get_queryset()
        edition_id = self.request.query_params.get("edition")
        if edition_id:
            qs = qs.filter(edition_id=edition_id)
        if self._user_is_admin():
            return qs
        return qs.filter(user=self.request.user)

    def create(self, request, *args, **kwargs):
        """Idempotent upsert: one attendance per (user, edition)."""
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        edition = serializer.validated_data["edition"]

        instance, _ = Attendance.objects.update_or_create(
            user=request.user,
            edition=edition,
            defaults={
                "equipment": serializer.validated_data.get("equipment", ""),
                "sleeps_at": serializer.validated_data.get(
                    "sleeps_at", Attendance.SLEEPS_AT_VENUE
                ),
                "days": serializer.validated_data.get("days", []),
            },
        )
        out = self.get_serializer(instance)
        return Response(out.data, status=status.HTTP_200_OK)

    def update(self, request, *args, **kwargs):
        self._check_ownership(self.get_object())
        return super().update(request, *args, **kwargs)

    def partial_update(self, request, *args, **kwargs):
        self._check_ownership(self.get_object())
        return super().partial_update(request, *args, **kwargs)

    def destroy(self, request, *args, **kwargs):
        self._check_ownership(self.get_object())
        return super().destroy(request, *args, **kwargs)

    @action(detail=False, methods=["get"])
    def me(self, request):
        """Return the current user's attendance for ?edition=<id>."""
        edition_id = request.query_params.get("edition")
        if not edition_id:
            return Response(
                {"error": "edition parameter is required"},
                status=status.HTTP_400_BAD_REQUEST,
            )
        try:
            instance = Attendance.objects.get(
                user=request.user, edition_id=edition_id
            )
        except Attendance.DoesNotExist:
            return Response(status=status.HTTP_204_NO_CONTENT)
        return Response(AttendanceSerializer(instance).data)

    @action(detail=False, methods=["get"], permission_classes=[AllowAny])
    def count(self, request):
        """
        Public counter. Returns {count, total_users} when the edition allows it,
        403 otherwise.
        """
        edition_id = request.query_params.get("edition")
        if not edition_id:
            return Response(
                {"error": "edition parameter is required"},
                status=status.HTTP_400_BAD_REQUEST,
            )
        try:
            edition = Edition.objects.get(pk=edition_id)
        except Edition.DoesNotExist:
            return Response(status=status.HTTP_404_NOT_FOUND)

        if not edition.attendance_count_public:
            return Response(
                {"error": "Counter not public for this edition"},
                status=status.HTTP_403_FORBIDDEN,
            )

        return Response(
            {"count": Attendance.objects.filter(edition=edition).count()}
        )

    def _user_is_admin(self):
        user = getattr(self.request, "user", None)
        return bool(
            user
            and user.is_authenticated
            and user.groups.filter(name="DPMS Admins").exists()
        )

    def _check_ownership(self, obj):
        if self._user_is_admin() or obj.user_id == self.request.user.id:
            return
        from rest_framework.exceptions import PermissionDenied

        raise PermissionDenied("You can only modify your own attendance.")
