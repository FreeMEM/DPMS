"""Attendance serializers — RSVP for an edition."""

from datetime import date

from rest_framework import serializers

from dpms.compos.models import Attendance, Edition


class AttendanceSerializer(serializers.ModelSerializer):
    """CRUD serializer for a user's attendance to an edition.

    Validates that `days` fall within the edition's date range so the frontend
    checkbox set can't be bypassed with a hand-crafted payload.
    """

    class Meta:
        model = Attendance
        fields = [
            "id",
            "user",
            "edition",
            "equipment",
            "sleeps_at",
            "days",
            "created",
            "modified",
        ]
        read_only_fields = ["id", "user", "created", "modified"]

    def validate(self, attrs):
        edition = attrs.get("edition") or (self.instance and self.instance.edition)
        days = attrs.get("days")
        if edition and days:
            start = edition.start_date.date() if edition.start_date else None
            end = (edition.end_date or edition.start_date)
            end = end.date() if end else None
            if start and end:
                out_of_range = [d for d in days if not (start <= d <= end)]
                if out_of_range:
                    raise serializers.ValidationError({
                        "days": (
                            "Todos los días deben estar dentro del rango de la "
                            f"edición ({start.isoformat()} → {end.isoformat()})."
                        )
                    })
        return attrs


class AttendanceAdminSerializer(AttendanceSerializer):
    """Admin list/detail serializer with denormalised user info."""

    user_email = serializers.EmailField(source="user.email", read_only=True)
    user_username = serializers.CharField(source="user.username", read_only=True)
    user_nickname = serializers.SerializerMethodField()

    class Meta(AttendanceSerializer.Meta):
        fields = AttendanceSerializer.Meta.fields + [
            "user_email",
            "user_username",
            "user_nickname",
        ]

    def get_user_nickname(self, obj):
        profile = getattr(obj.user, "profile", None)
        return getattr(profile, "nickname", "") or ""
