""" User models admin. """

# Django
from django.contrib import admin
from django.contrib.auth.models import Permission
from django.contrib.auth.admin import UserAdmin

# Models
from dpms.users.models import User, Profile


class CustomUserAdmin(UserAdmin):
    """user model admin."""

    fieldsets = (
        *UserAdmin.fieldsets,  # original form fieldsets, expanded
        (  # new fieldset added on to the bottom
            "Extra fields",  # group heading of your choice; set to None for a blank space instead of a header
            {
                # "fields": ("is_verified", "is_evaluator", "allow_concurrence"),
                "fields": ("is_verified", "allow_concurrence"),
            },
        ),
    )
    list_display = (
        "id",
        "email",
        "username",
        "first_name",
        "last_name",
        "is_verified",
        # "is_evaluator",
        "allow_concurrence",
    )

    search_fields = ["username", "email", "id"]
    list_filter = ("created", "modified")
    ordering = ["id"]


@admin.register(Profile)
class ProfileAdmin(admin.ModelAdmin):
    """Profile model admin"""

    list_display = (
        "user",
        "created",
        "modified",
    )
    search_fields = (
        "user__username",
        "user__email",
    )
    list_filter = (
        # "user__is_evaluator",
        "user__email",
        "user__username",
        "user__first_name",
        "user__last_name",
        "nickname",
        "group",
        "visit_listing",
    )


admin.site.register(User, CustomUserAdmin)
admin.site.register(Permission)

# admin.site.register(WorkgroupMembership, WorkgroupMembershipAdmin)
