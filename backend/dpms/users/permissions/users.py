""" User permissions """

# Django REST Framework

from rest_framework.permissions import BasePermission


class IsAccountOwner(BasePermission):
    """Allow access only to objects owned by the requesting user."""

    def has_object_permission(self, request, view, obj):
        """Check obj and user are the same"""
        return request.user == obj


class IsDPMSAdmin(BasePermission):
    """Allow access only to DPMS Admins group members."""

    def has_permission(self, request, view):
        return (
            request.user.is_authenticated
            and request.user.groups.filter(name="DPMS Admins").exists()
        )
