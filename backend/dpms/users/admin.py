""" User models admin. """

# Django
from django.contrib import admin
from django.contrib.auth.models import Permission, Group
from django.contrib.auth.admin import UserAdmin
from django.utils.html import format_html
from django.urls import reverse
from django.utils.safestring import mark_safe

# Models
from dpms.users.models import User, Profile


class ProfileInline(admin.StackedInline):
    """Profile inline for User admin"""
    model = Profile
    can_delete = False
    verbose_name_plural = "Profile"
    fk_name = "user"
    fields = ("nickname", "group", "avatar", "extra_information", "visit_listing")
    readonly_fields = ("created", "modified")


class CustomUserAdmin(UserAdmin):
    """User model admin with enhanced features"""

    inlines = (ProfileInline,)

    fieldsets = (
        *UserAdmin.fieldsets,
        (
            "Extra fields",
            {
                "fields": ("is_verified", "allow_concurrence"),
            },
        ),
    )

    list_display = (
        "id",
        "email",
        "username",
        "full_name_display",
        "is_verified_badge",
        "is_staff_badge",
        "is_active_badge",
        "allow_concurrence",
        "groups_display",
        "productions_count",
        "date_joined_display",
        "last_login_display",
    )

    list_display_links = ("id", "email", "username")

    search_fields = ["username", "email", "id", "first_name", "last_name"]

    list_filter = (
        "is_verified",
        "is_staff",
        "is_active",
        "is_superuser",
        "allow_concurrence",
        "groups",
        "date_joined",
        "last_login",
        "created",
        "modified",
    )

    ordering = ["-date_joined"]

    readonly_fields = ("date_joined", "last_login", "created", "modified")

    list_per_page = 50

    actions = ["verify_users", "unverify_users", "allow_concurrence_action", "disallow_concurrence_action"]

    def full_name_display(self, obj):
        """Display full name or dash if empty"""
        full_name = obj.get_full_name()
        return full_name if full_name else "-"
    full_name_display.short_description = "Full Name"

    def is_verified_badge(self, obj):
        """Display verified status with colored badge"""
        if obj.is_verified:
            return format_html(
                '<span style="background-color: #28a745; color: white; padding: 3px 10px; border-radius: 3px;">✓ Verified</span>'
            )
        return format_html(
            '<span style="background-color: #dc3545; color: white; padding: 3px 10px; border-radius: 3px;">✗ Not Verified</span>'
        )
    is_verified_badge.short_description = "Verified"
    is_verified_badge.admin_order_field = "is_verified"

    def is_staff_badge(self, obj):
        """Display staff status with badge"""
        if obj.is_staff:
            return format_html(
                '<span style="background-color: #007bff; color: white; padding: 3px 10px; border-radius: 3px;">Staff</span>'
            )
        return "-"
    is_staff_badge.short_description = "Staff"
    is_staff_badge.admin_order_field = "is_staff"

    def is_active_badge(self, obj):
        """Display active status with badge"""
        if obj.is_active:
            return format_html(
                '<span style="background-color: #28a745; color: white; padding: 3px 10px; border-radius: 3px;">Active</span>'
            )
        return format_html(
            '<span style="background-color: #6c757d; color: white; padding: 3px 10px; border-radius: 3px;">Inactive</span>'
        )
    is_active_badge.short_description = "Active"
    is_active_badge.admin_order_field = "is_active"

    def groups_display(self, obj):
        """Display user groups"""
        groups = obj.groups.all()
        if groups:
            return ", ".join([group.name for group in groups])
        return "-"
    groups_display.short_description = "Groups"

    def productions_count(self, obj):
        """Count of productions uploaded by user"""
        count = obj.productions.count()
        if count > 0:
            url = reverse("admin:compos_production_changelist") + f"?uploaded_by__id__exact={obj.id}"
            return format_html('<a href="{}">{} productions</a>', url, count)
        return "0"
    productions_count.short_description = "Productions"

    def date_joined_display(self, obj):
        """Format date joined"""
        return obj.date_joined.strftime("%Y-%m-%d %H:%M")
    date_joined_display.short_description = "Date Joined"
    date_joined_display.admin_order_field = "date_joined"

    def last_login_display(self, obj):
        """Format last login"""
        if obj.last_login:
            return obj.last_login.strftime("%Y-%m-%d %H:%M")
        return "Never"
    last_login_display.short_description = "Last Login"
    last_login_display.admin_order_field = "last_login"

    def verify_users(self, request, queryset):
        """Bulk verify users"""
        updated = queryset.update(is_verified=True)
        self.message_user(request, f"{updated} users were successfully verified.")
    verify_users.short_description = "Verify selected users"

    def unverify_users(self, request, queryset):
        """Bulk unverify users"""
        updated = queryset.update(is_verified=False)
        self.message_user(request, f"{updated} users were unverified.")
    unverify_users.short_description = "Unverify selected users"

    def allow_concurrence_action(self, request, queryset):
        """Allow concurrence for selected users"""
        updated = queryset.update(allow_concurrence=True)
        self.message_user(request, f"{updated} users can now login from multiple devices.")
    allow_concurrence_action.short_description = "Allow concurrent logins"

    def disallow_concurrence_action(self, request, queryset):
        """Disallow concurrence for selected users"""
        updated = queryset.update(allow_concurrence=False)
        self.message_user(request, f"{updated} users can only login from one device.")
    disallow_concurrence_action.short_description = "Disallow concurrent logins"


@admin.register(Profile)
class ProfileAdmin(admin.ModelAdmin):
    """Profile model admin with enhanced features"""

    list_display = (
        "id",
        "user_link",
        "nickname",
        "group",
        "avatar_preview",
        "visit_listing_badge",
        "user_verified",
        "user_email",
        "created_display",
        "modified_display",
    )

    list_display_links = ("id", "user_link")

    search_fields = (
        "user__username",
        "user__email",
        "user__first_name",
        "user__last_name",
        "nickname",
        "group",
    )

    list_filter = (
        "visit_listing",
        "user__is_verified",
        "user__is_active",
        "user__is_staff",
        "created",
        "modified",
    )

    readonly_fields = ("created", "modified", "avatar_preview_large")

    fieldsets = (
        ("User Information", {
            "fields": ("user",)
        }),
        ("Demoscene Profile", {
            "fields": ("nickname", "group", "avatar", "avatar_preview_large", "extra_information")
        }),
        ("Settings", {
            "fields": ("visit_listing",)
        }),
        ("Timestamps", {
            "fields": ("created", "modified"),
            "classes": ("collapse",)
        }),
    )

    list_per_page = 50

    ordering = ["-created"]

    def user_link(self, obj):
        """Link to user admin page"""
        if obj.user:
            url = reverse("admin:users_user_change", args=[obj.user.pk])
            return format_html('<a href="{}">{}</a>', url, obj.user.username)
        return "-"
    user_link.short_description = "User"
    user_link.admin_order_field = "user__username"

    def user_email(self, obj):
        """Display user email"""
        return obj.user.email if obj.user else "-"
    user_email.short_description = "Email"
    user_email.admin_order_field = "user__email"

    def user_verified(self, obj):
        """Display user verification status"""
        if obj.user and obj.user.is_verified:
            return format_html(
                '<span style="color: green;">✓</span>'
            )
        return format_html(
            '<span style="color: red;">✗</span>'
        )
    user_verified.short_description = "Verified"
    user_verified.admin_order_field = "user__is_verified"

    def avatar_preview(self, obj):
        """Small avatar preview for list view"""
        if obj.avatar:
            return format_html(
                '<img src="{}" style="width: 40px; height: 40px; border-radius: 50%; object-fit: cover;" />',
                obj.avatar.url
            )
        return "-"
    avatar_preview.short_description = "Avatar"

    def avatar_preview_large(self, obj):
        """Large avatar preview for detail view"""
        if obj.avatar:
            return format_html(
                '<img src="{}" style="width: 200px; height: 200px; border-radius: 10px; object-fit: cover;" />',
                obj.avatar.url
            )
        return "No avatar"
    avatar_preview_large.short_description = "Avatar Preview"

    def visit_listing_badge(self, obj):
        """Display visit listing status"""
        if obj.visit_listing:
            return format_html(
                '<span style="background-color: #28a745; color: white; padding: 3px 10px; border-radius: 3px;">Listed</span>'
            )
        return format_html(
            '<span style="background-color: #6c757d; color: white; padding: 3px 10px; border-radius: 3px;">Hidden</span>'
        )
    visit_listing_badge.short_description = "Visitor Listing"
    visit_listing_badge.admin_order_field = "visit_listing"

    def created_display(self, obj):
        """Format created date"""
        return obj.created.strftime("%Y-%m-%d %H:%M")
    created_display.short_description = "Created"
    created_display.admin_order_field = "created"

    def modified_display(self, obj):
        """Format modified date"""
        return obj.modified.strftime("%Y-%m-%d %H:%M")
    modified_display.short_description = "Modified"
    modified_display.admin_order_field = "modified"


admin.site.register(User, CustomUserAdmin)
admin.site.register(Permission)

# admin.site.register(WorkgroupMembership, WorkgroupMembershipAdmin)
