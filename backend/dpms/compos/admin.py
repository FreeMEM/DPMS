# dpms/compos/admin.py

from django.contrib import admin
from django.utils.html import format_html
from django.urls import reverse
from django.db.models import Count
from .models import (
    Edition,
    Compo,
    HasCompo,
    Production,
    File,
    VotingConfiguration,
    AttendanceCode,
    AttendeeVerification,
    JuryMember,
    Vote,
    VotingPeriod,
)


class HasCompoInlineForEdition(admin.TabularInline):
    """HasCompo inline for Edition admin"""
    model = HasCompo
    extra = 0
    fk_name = "edition"
    fields = ("compo", "start", "show_authors_on_slide", "open_to_upload", "open_to_update", "created_by")
    autocomplete_fields = ["compo", "created_by"]
    readonly_fields = ("created", "modified")


class HasCompoInlineForCompo(admin.TabularInline):
    """HasCompo inline for Compo admin"""
    model = HasCompo
    extra = 0
    fk_name = "compo"
    fields = ("edition", "start", "show_authors_on_slide", "open_to_upload", "open_to_update", "created_by")
    autocomplete_fields = ["edition", "created_by"]
    readonly_fields = ("created", "modified")


class ProductionInlineForEdition(admin.TabularInline):
    """Production inline for Edition admin"""
    model = Production
    extra = 0
    fields = ("title", "authors", "compo", "uploaded_by")
    readonly_fields = ("title", "authors", "compo", "uploaded_by")
    can_delete = False
    show_change_link = True
    max_num = 10


@admin.register(Edition)
class EditionAdmin(admin.ModelAdmin):
    """Edition model admin with enhanced features"""

    list_display = (
        "id",
        "title",
        "uploaded_by_link",
        "public_badge",
        "upload_badge",
        "update_badge",
        "compos_count",
        "productions_count",
        "created_display",
        "modified_display",
    )

    list_display_links = ("id", "title")

    search_fields = ("title", "description", "uploaded_by__email", "uploaded_by__username")

    list_filter = (
        "public",
        "open_to_upload",
        "open_to_update",
        "uploaded_by",
        "created",
        "modified",
    )

    inlines = [HasCompoInlineForEdition, ProductionInlineForEdition]

    readonly_fields = ("created", "modified", "compos_count", "productions_count")

    fieldsets = (
        ("Basic Information", {
            "fields": ("title", "description", "uploaded_by")
        }),
        ("Status", {
            "fields": ("public", "open_to_upload", "open_to_update")
        }),
        ("Statistics", {
            "fields": ("compos_count", "productions_count"),
            "classes": ("collapse",)
        }),
        ("Timestamps", {
            "fields": ("created", "modified"),
            "classes": ("collapse",)
        }),
    )

    list_per_page = 50

    ordering = ["-created"]

    actions = ["make_public", "make_private", "open_uploads", "close_uploads", "open_updates", "close_updates"]

    def uploaded_by_link(self, obj):
        """Link to user admin page"""
        if obj.uploaded_by:
            url = reverse("admin:users_user_change", args=[obj.uploaded_by.pk])
            return format_html('<a href="{}">{}</a>', url, obj.uploaded_by.email)
        return "-"
    uploaded_by_link.short_description = "Uploaded By"
    uploaded_by_link.admin_order_field = "uploaded_by__email"

    def public_badge(self, obj):
        """Display public status"""
        if obj.public:
            return format_html(
                '<span style="background-color: #28a745; color: white; padding: 3px 10px; border-radius: 3px;">Public</span>'
            )
        return format_html(
            '<span style="background-color: #6c757d; color: white; padding: 3px 10px; border-radius: 3px;">Private</span>'
        )
    public_badge.short_description = "Public"
    public_badge.admin_order_field = "public"

    def upload_badge(self, obj):
        """Display upload status"""
        if obj.open_to_upload:
            return format_html(
                '<span style="background-color: #28a745; color: white; padding: 3px 10px; border-radius: 3px;">Open</span>'
            )
        return format_html(
            '<span style="background-color: #dc3545; color: white; padding: 3px 10px; border-radius: 3px;">Closed</span>'
        )
    upload_badge.short_description = "Uploads"
    upload_badge.admin_order_field = "open_to_upload"

    def update_badge(self, obj):
        """Display update status"""
        if obj.open_to_update:
            return format_html(
                '<span style="background-color: #28a745; color: white; padding: 3px 10px; border-radius: 3px;">Open</span>'
            )
        return format_html(
            '<span style="background-color: #dc3545; color: white; padding: 3px 10px; border-radius: 3px;">Closed</span>'
        )
    update_badge.short_description = "Updates"
    update_badge.admin_order_field = "open_to_update"

    def compos_count(self, obj):
        """Count of compos in edition"""
        count = obj.compos.count()
        if count > 0:
            return format_html('<strong>{}</strong> compos', count)
        return "0"
    compos_count.short_description = "Compos"

    def productions_count(self, obj):
        """Count of productions in edition"""
        count = obj.productions.count()
        if count > 0:
            url = reverse("admin:compos_production_changelist") + f"?edition__id__exact={obj.id}"
            return format_html('<a href="{}">{} productions</a>', url, count)
        return "0"
    productions_count.short_description = "Productions"

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

    def make_public(self, request, queryset):
        """Make selected editions public"""
        updated = queryset.update(public=True)
        self.message_user(request, f"{updated} editions are now public.")
    make_public.short_description = "Make public"

    def make_private(self, request, queryset):
        """Make selected editions private"""
        updated = queryset.update(public=False)
        self.message_user(request, f"{updated} editions are now private.")
    make_private.short_description = "Make private"

    def open_uploads(self, request, queryset):
        """Open uploads for selected editions"""
        updated = queryset.update(open_to_upload=True)
        self.message_user(request, f"{updated} editions are now open for uploads.")
    open_uploads.short_description = "Open uploads"

    def close_uploads(self, request, queryset):
        """Close uploads for selected editions"""
        updated = queryset.update(open_to_upload=False)
        self.message_user(request, f"{updated} editions are now closed for uploads.")
    close_uploads.short_description = "Close uploads"

    def open_updates(self, request, queryset):
        """Open updates for selected editions"""
        updated = queryset.update(open_to_update=True)
        self.message_user(request, f"{updated} editions are now open for updates.")
    open_updates.short_description = "Open updates"

    def close_updates(self, request, queryset):
        """Close updates for selected editions"""
        updated = queryset.update(open_to_update=False)
        self.message_user(request, f"{updated} editions are now closed for updates.")
    close_updates.short_description = "Close updates"


@admin.register(Compo)
class CompoAdmin(admin.ModelAdmin):
    """Compo model admin with enhanced features"""

    list_display = (
        "id",
        "name",
        "created_by_link",
        "editions_count",
        "productions_count",
        "created_display",
        "modified_display",
    )

    list_display_links = ("id", "name")

    search_fields = ("name", "description", "created_by__email", "created_by__username")

    list_filter = (
        "created_by",
        "created",
        "modified",
    )

    inlines = [HasCompoInlineForCompo]

    readonly_fields = ("created", "modified", "editions_count", "productions_count")

    fieldsets = (
        ("Basic Information", {
            "fields": ("name", "description", "created_by")
        }),
        ("Statistics", {
            "fields": ("editions_count", "productions_count"),
            "classes": ("collapse",)
        }),
        ("Timestamps", {
            "fields": ("created", "modified"),
            "classes": ("collapse",)
        }),
    )

    list_per_page = 50

    ordering = ["-created"]

    autocomplete_fields = ["created_by"]

    def created_by_link(self, obj):
        """Link to user admin page"""
        if obj.created_by:
            url = reverse("admin:users_user_change", args=[obj.created_by.pk])
            return format_html('<a href="{}">{}</a>', url, obj.created_by.email)
        return "-"
    created_by_link.short_description = "Created By"
    created_by_link.admin_order_field = "created_by__email"

    def editions_count(self, obj):
        """Count of editions using this compo"""
        count = obj.editions.count()
        if count > 0:
            return format_html('<strong>{}</strong> editions', count)
        return "0"
    editions_count.short_description = "Editions"

    def productions_count(self, obj):
        """Count of productions in this compo"""
        count = obj.productions.count()
        if count > 0:
            url = reverse("admin:compos_production_changelist") + f"?compo__id__exact={obj.id}"
            return format_html('<a href="{}">{} productions</a>', url, count)
        return "0"
    productions_count.short_description = "Productions"

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


@admin.register(HasCompo)
class HasCompoAdmin(admin.ModelAdmin):
    """HasCompo model admin with enhanced features"""

    list_display = (
        "id",
        "edition_link",
        "compo_link",
        "start_display",
        "show_authors_badge",
        "upload_badge",
        "update_badge",
        "created_by_link",
        "created_display",
    )

    list_display_links = ("id", "edition_link")

    search_fields = (
        "edition__title",
        "compo__name",
        "created_by__email",
        "created_by__username",
    )

    list_filter = (
        "show_authors_on_slide",
        "open_to_upload",
        "open_to_update",
        "start",
        "created",
        "modified",
    )

    readonly_fields = ("created", "modified")

    fieldsets = (
        ("Relationship", {
            "fields": ("edition", "compo", "created_by")
        }),
        ("Schedule", {
            "fields": ("start",)
        }),
        ("Settings", {
            "fields": ("show_authors_on_slide", "open_to_upload", "open_to_update")
        }),
        ("Timestamps", {
            "fields": ("created", "modified"),
            "classes": ("collapse",)
        }),
    )

    list_per_page = 50

    ordering = ["-start"]

    autocomplete_fields = ["edition", "compo", "created_by"]

    actions = ["enable_author_display", "disable_author_display", "open_uploads", "close_uploads"]

    def edition_link(self, obj):
        """Link to edition admin page"""
        url = reverse("admin:compos_edition_change", args=[obj.edition.pk])
        return format_html('<a href="{}">{}</a>', url, obj.edition.title)
    edition_link.short_description = "Edition"
    edition_link.admin_order_field = "edition__title"

    def compo_link(self, obj):
        """Link to compo admin page"""
        url = reverse("admin:compos_compo_change", args=[obj.compo.pk])
        return format_html('<a href="{}">{}</a>', url, obj.compo.name)
    compo_link.short_description = "Compo"
    compo_link.admin_order_field = "compo__name"

    def created_by_link(self, obj):
        """Link to user admin page"""
        if obj.created_by:
            url = reverse("admin:users_user_change", args=[obj.created_by.pk])
            return format_html('<a href="{}">{}</a>', url, obj.created_by.email)
        return "-"
    created_by_link.short_description = "Created By"
    created_by_link.admin_order_field = "created_by__email"

    def start_display(self, obj):
        """Format start date"""
        return obj.start.strftime("%Y-%m-%d %H:%M")
    start_display.short_description = "Start Time"
    start_display.admin_order_field = "start"

    def show_authors_badge(self, obj):
        """Display show authors status"""
        if obj.show_authors_on_slide:
            return format_html(
                '<span style="background-color: #28a745; color: white; padding: 3px 10px; border-radius: 3px;">Show</span>'
            )
        return format_html(
            '<span style="background-color: #6c757d; color: white; padding: 3px 10px; border-radius: 3px;">Hide</span>'
        )
    show_authors_badge.short_description = "Authors"
    show_authors_badge.admin_order_field = "show_authors_on_slide"

    def upload_badge(self, obj):
        """Display upload status"""
        if obj.open_to_upload:
            return format_html(
                '<span style="background-color: #28a745; color: white; padding: 3px 10px; border-radius: 3px;">Open</span>'
            )
        return format_html(
            '<span style="background-color: #dc3545; color: white; padding: 3px 10px; border-radius: 3px;">Closed</span>'
        )
    upload_badge.short_description = "Uploads"
    upload_badge.admin_order_field = "open_to_upload"

    def update_badge(self, obj):
        """Display update status"""
        if obj.open_to_update:
            return format_html(
                '<span style="background-color: #28a745; color: white; padding: 3px 10px; border-radius: 3px;">Open</span>'
            )
        return format_html(
            '<span style="background-color: #dc3545; color: white; padding: 3px 10px; border-radius: 3px;">Closed</span>'
        )
    update_badge.short_description = "Updates"
    update_badge.admin_order_field = "open_to_update"

    def created_display(self, obj):
        """Format created date"""
        return obj.created.strftime("%Y-%m-%d %H:%M")
    created_display.short_description = "Created"
    created_display.admin_order_field = "created"

    def enable_author_display(self, request, queryset):
        """Enable author display on slides"""
        updated = queryset.update(show_authors_on_slide=True)
        self.message_user(request, f"{updated} compos will show authors on slides.")
    enable_author_display.short_description = "Show authors on slides"

    def disable_author_display(self, request, queryset):
        """Disable author display on slides"""
        updated = queryset.update(show_authors_on_slide=False)
        self.message_user(request, f"{updated} compos will hide authors on slides.")
    disable_author_display.short_description = "Hide authors on slides"

    def open_uploads(self, request, queryset):
        """Open uploads"""
        updated = queryset.update(open_to_upload=True)
        self.message_user(request, f"{updated} compos are now open for uploads.")
    open_uploads.short_description = "Open uploads"

    def close_uploads(self, request, queryset):
        """Close uploads"""
        updated = queryset.update(open_to_upload=False)
        self.message_user(request, f"{updated} compos are now closed for uploads.")
    close_uploads.short_description = "Close uploads"


class FileInlineForProduction(admin.TabularInline):
    """File inline for Production admin"""
    model = Production.files.through
    extra = 0
    verbose_name = "File"
    verbose_name_plural = "Files"
    readonly_fields = ("file_preview",)

    def file_preview(self, obj):
        """Preview file info"""
        if obj.file:
            return format_html(
                '<strong>{}</strong><br/>Original: {}',
                obj.file.title,
                obj.file.original_filename
            )
        return "-"
    file_preview.short_description = "File Info"


@admin.register(Production)
class ProductionAdmin(admin.ModelAdmin):
    """Production model admin with enhanced features"""

    list_display = (
        "id",
        "title",
        "authors",
        "edition_link",
        "compo_link",
        "uploaded_by_link",
        "files_count",
        "created_display",
        "modified_display",
    )

    list_display_links = ("id", "title")

    search_fields = (
        "title",
        "authors",
        "description",
        "uploaded_by__email",
        "uploaded_by__username",
        "edition__title",
        "compo__name",
    )

    list_filter = (
        "edition",
        "compo",
        "uploaded_by",
        "created",
        "modified",
    )

    inlines = [FileInlineForProduction]

    readonly_fields = ("created", "modified", "files_count")

    fieldsets = (
        ("Basic Information", {
            "fields": ("title", "authors", "description")
        }),
        ("Classification", {
            "fields": ("edition", "compo", "uploaded_by")
        }),
        ("Files", {
            "fields": ("files_count",)
        }),
        ("Timestamps", {
            "fields": ("created", "modified"),
            "classes": ("collapse",)
        }),
    )

    filter_horizontal = ("files",)

    list_per_page = 50

    ordering = ["-created"]

    autocomplete_fields = ["edition", "compo", "uploaded_by"]

    def edition_link(self, obj):
        """Link to edition admin page"""
        url = reverse("admin:compos_edition_change", args=[obj.edition.pk])
        return format_html('<a href="{}">{}</a>', url, obj.edition.title)
    edition_link.short_description = "Edition"
    edition_link.admin_order_field = "edition__title"

    def compo_link(self, obj):
        """Link to compo admin page"""
        url = reverse("admin:compos_compo_change", args=[obj.compo.pk])
        return format_html('<a href="{}">{}</a>', url, obj.compo.name)
    compo_link.short_description = "Compo"
    compo_link.admin_order_field = "compo__name"

    def uploaded_by_link(self, obj):
        """Link to user admin page"""
        if obj.uploaded_by:
            url = reverse("admin:users_user_change", args=[obj.uploaded_by.pk])
            return format_html('<a href="{}">{}</a>', url, obj.uploaded_by.email)
        return "-"
    uploaded_by_link.short_description = "Uploaded By"
    uploaded_by_link.admin_order_field = "uploaded_by__email"

    def files_count(self, obj):
        """Count of files"""
        count = obj.files.count()
        if count > 0:
            return format_html('<strong>{}</strong> files', count)
        return "0"
    files_count.short_description = "Files"

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


@admin.register(File)
class FileAdmin(admin.ModelAdmin):
    """File model admin with enhanced features"""

    list_display = (
        "id",
        "title",
        "original_filename",
        "uploaded_by_link",
        "file_size",
        "public_badge",
        "active_badge",
        "deleted_badge",
        "productions_count",
        "created_display",
    )

    list_display_links = ("id", "title")

    search_fields = (
        "title",
        "description",
        "original_filename",
        "uploaded_by__email",
        "uploaded_by__username",
    )

    list_filter = (
        "public",
        "is_active",
        "is_deleted",
        "uploaded_by",
        "created",
        "modified",
    )

    readonly_fields = (
        "original_filename",
        "created",
        "modified",
        "file_size",
        "file_path",
        "productions_list",
    )

    fieldsets = (
        ("Basic Information", {
            "fields": ("title", "description", "uploaded_by")
        }),
        ("File Information", {
            "fields": ("file", "original_filename", "file_size", "file_path")
        }),
        ("Status", {
            "fields": ("public", "is_active", "is_deleted")
        }),
        ("Related Productions", {
            "fields": ("productions_list",),
            "classes": ("collapse",)
        }),
        ("Timestamps", {
            "fields": ("created", "modified"),
            "classes": ("collapse",)
        }),
    )

    list_per_page = 50

    ordering = ["-created"]

    autocomplete_fields = ["uploaded_by"]

    actions = ["make_public", "make_private", "activate_files", "deactivate_files", "mark_deleted", "unmark_deleted"]

    def uploaded_by_link(self, obj):
        """Link to user admin page"""
        if obj.uploaded_by:
            url = reverse("admin:users_user_change", args=[obj.uploaded_by.pk])
            return format_html('<a href="{}">{}</a>', url, obj.uploaded_by.email)
        return "-"
    uploaded_by_link.short_description = "Uploaded By"
    uploaded_by_link.admin_order_field = "uploaded_by__email"

    def file_size(self, obj):
        """Display file size"""
        try:
            size = obj.file.size
            for unit in ['B', 'KB', 'MB', 'GB']:
                if size < 1024.0:
                    return f"{size:.2f} {unit}"
                size /= 1024.0
            return f"{size:.2f} TB"
        except:
            return "N/A"
    file_size.short_description = "File Size"

    def file_path(self, obj):
        """Display file path"""
        if obj.file:
            return obj.file.name
        return "N/A"
    file_path.short_description = "File Path"

    def public_badge(self, obj):
        """Display public status"""
        if obj.public:
            return format_html(
                '<span style="background-color: #28a745; color: white; padding: 3px 10px; border-radius: 3px;">Public</span>'
            )
        return format_html(
            '<span style="background-color: #6c757d; color: white; padding: 3px 10px; border-radius: 3px;">Private</span>'
        )
    public_badge.short_description = "Public"
    public_badge.admin_order_field = "public"

    def active_badge(self, obj):
        """Display active status"""
        if obj.is_active:
            return format_html(
                '<span style="background-color: #28a745; color: white; padding: 3px 10px; border-radius: 3px;">Active</span>'
            )
        return format_html(
            '<span style="background-color: #6c757d; color: white; padding: 3px 10px; border-radius: 3px;">Inactive</span>'
        )
    active_badge.short_description = "Active"
    active_badge.admin_order_field = "is_active"

    def deleted_badge(self, obj):
        """Display deleted status"""
        if obj.is_deleted:
            return format_html(
                '<span style="background-color: #dc3545; color: white; padding: 3px 10px; border-radius: 3px;">Deleted</span>'
            )
        return format_html(
            '<span style="background-color: #28a745; color: white; padding: 3px 10px; border-radius: 3px;">Available</span>'
        )
    deleted_badge.short_description = "Status"
    deleted_badge.admin_order_field = "is_deleted"

    def productions_count(self, obj):
        """Count of productions using this file"""
        count = obj.productions.count()
        if count > 0:
            return format_html('<strong>{}</strong> productions', count)
        return "0"
    productions_count.short_description = "Productions"

    def productions_list(self, obj):
        """List of productions using this file"""
        productions = obj.productions.all()
        if productions:
            links = []
            for prod in productions:
                url = reverse("admin:compos_production_change", args=[prod.pk])
                links.append(format_html('<a href="{}">{}</a>', url, prod.title))
            return format_html("<br/>".join(links))
        return "No productions using this file"
    productions_list.short_description = "Productions Using This File"

    def created_display(self, obj):
        """Format created date"""
        return obj.created.strftime("%Y-%m-%d %H:%M")
    created_display.short_description = "Created"
    created_display.admin_order_field = "created"

    def make_public(self, request, queryset):
        """Make selected files public"""
        updated = queryset.update(public=True)
        self.message_user(request, f"{updated} files are now public.")
    make_public.short_description = "Make public"

    def make_private(self, request, queryset):
        """Make selected files private"""
        updated = queryset.update(public=False)
        self.message_user(request, f"{updated} files are now private.")
    make_private.short_description = "Make private"

    def activate_files(self, request, queryset):
        """Activate selected files"""
        updated = queryset.update(is_active=True)
        self.message_user(request, f"{updated} files are now active.")
    activate_files.short_description = "Activate files"

    def deactivate_files(self, request, queryset):
        """Deactivate selected files"""
        updated = queryset.update(is_active=False)
        self.message_user(request, f"{updated} files are now inactive.")
    deactivate_files.short_description = "Deactivate files"

    def mark_deleted(self, request, queryset):
        """Mark selected files as deleted"""
        updated = queryset.update(is_deleted=True)
        self.message_user(request, f"{updated} files are marked as deleted.")
    mark_deleted.short_description = "Mark as deleted"

    def unmark_deleted(self, request, queryset):
        """Unmark selected files as deleted"""
        updated = queryset.update(is_deleted=False)
        self.message_user(request, f"{updated} files are unmarked as deleted.")
    unmark_deleted.short_description = "Unmark as deleted"


# ============================================================================
# VOTING SYSTEM ADMIN
# ============================================================================


class VotingPeriodInline(admin.TabularInline):
    """VotingPeriod inline for Edition admin"""
    model = VotingPeriod
    extra = 0
    fields = ("compo", "start_date", "end_date", "is_active")
    autocomplete_fields = ["compo"]


class JuryMemberInline(admin.TabularInline):
    """JuryMember inline for Edition admin"""
    model = JuryMember
    extra = 0
    fields = ("user", "notes")
    autocomplete_fields = ["user"]
    verbose_name = "Jury Member"
    verbose_name_plural = "Jury Members"


@admin.register(VotingConfiguration)
class VotingConfigurationAdmin(admin.ModelAdmin):
    """VotingConfiguration model admin"""

    list_display = (
        "id",
        "edition_link",
        "voting_mode_badge",
        "access_mode_badge",
        "public_weight",
        "jury_weight",
        "results_published_badge",
        "modified_display",
    )

    list_display_links = ("id", "edition_link")

    search_fields = ("edition__title",)

    list_filter = (
        "voting_mode",
        "access_mode",
        "results_published",
        "show_partial_results",
        "modified",
    )

    readonly_fields = ("created", "modified")

    fieldsets = (
        ("Edition", {"fields": ("edition",)}),
        (
            "Voting Mode",
            {
                "fields": ("voting_mode", "public_weight", "jury_weight"),
                "description": "Configure how votes are calculated. In mixed mode, weights must sum 100%.",
            },
        ),
        (
            "Access Control",
            {
                "fields": ("access_mode",),
                "description": "Control who can vote: open (anyone), code (attendance codes), manual (admin verification), checkin (QR scan).",
            },
        ),
        (
            "Results",
            {
                "fields": (
                    "results_published",
                    "results_published_at",
                    "show_partial_results",
                )
            },
        ),
        ("Timestamps", {"fields": ("created", "modified"), "classes": ("collapse",)}),
    )

    list_per_page = 50

    autocomplete_fields = ["edition"]

    def edition_link(self, obj):
        """Link to edition admin page"""
        url = reverse("admin:compos_edition_change", args=[obj.edition.pk])
        return format_html('<a href="{}">{}</a>', url, obj.edition.title)

    edition_link.short_description = "Edition"
    edition_link.admin_order_field = "edition__title"

    def voting_mode_badge(self, obj):
        """Display voting mode"""
        colors = {
            "public": "#17a2b8",  # info blue
            "jury": "#6f42c1",  # purple
            "mixed": "#fd7e14",  # orange
        }
        color = colors.get(obj.voting_mode, "#6c757d")
        return format_html(
            '<span style="background-color: {}; color: white; padding: 3px 10px; border-radius: 3px;">{}</span>',
            color,
            obj.get_voting_mode_display(),
        )

    voting_mode_badge.short_description = "Voting Mode"
    voting_mode_badge.admin_order_field = "voting_mode"

    def access_mode_badge(self, obj):
        """Display access mode"""
        colors = {
            "open": "#28a745",  # green
            "code": "#ffc107",  # yellow
            "manual": "#17a2b8",  # blue
            "checkin": "#6f42c1",  # purple
        }
        color = colors.get(obj.access_mode, "#6c757d")
        return format_html(
            '<span style="background-color: {}; color: white; padding: 3px 10px; border-radius: 3px;">{}</span>',
            color,
            obj.get_access_mode_display(),
        )

    access_mode_badge.short_description = "Access Mode"
    access_mode_badge.admin_order_field = "access_mode"

    def results_published_badge(self, obj):
        """Display published status"""
        if obj.results_published:
            return format_html(
                '<span style="background-color: #28a745; color: white; padding: 3px 10px; border-radius: 3px;">Published</span>'
            )
        return format_html(
            '<span style="background-color: #6c757d; color: white; padding: 3px 10px; border-radius: 3px;">Not Published</span>'
        )

    results_published_badge.short_description = "Results"
    results_published_badge.admin_order_field = "results_published"

    def modified_display(self, obj):
        """Format modified date"""
        return obj.modified.strftime("%Y-%m-%d %H:%M")

    modified_display.short_description = "Modified"
    modified_display.admin_order_field = "modified"


@admin.register(AttendanceCode)
class AttendanceCodeAdmin(admin.ModelAdmin):
    """AttendanceCode model admin"""

    list_display = (
        "id",
        "code",
        "edition_link",
        "used_badge",
        "used_by_link",
        "used_at_display",
        "created_display",
    )

    list_display_links = ("id", "code")

    search_fields = ("code", "edition__title", "used_by__email", "notes")

    list_filter = ("is_used", "edition", "created")

    readonly_fields = ("used_at", "created", "modified")

    fieldsets = (
        ("Code Information", {"fields": ("code", "edition")}),
        ("Usage", {"fields": ("is_used", "used_by", "used_at")}),
        ("Notes", {"fields": ("notes",)}),
        ("Timestamps", {"fields": ("created", "modified"), "classes": ("collapse",)}),
    )

    list_per_page = 100

    autocomplete_fields = ["edition", "used_by"]

    actions = ["invalidate_codes"]

    def edition_link(self, obj):
        """Link to edition admin page"""
        url = reverse("admin:compos_edition_change", args=[obj.edition.pk])
        return format_html('<a href="{}">{}</a>', url, obj.edition.title)

    edition_link.short_description = "Edition"
    edition_link.admin_order_field = "edition__title"

    def used_badge(self, obj):
        """Display used status"""
        if obj.is_used:
            return format_html(
                '<span style="background-color: #6c757d; color: white; padding: 3px 10px; border-radius: 3px;">Used</span>'
            )
        return format_html(
            '<span style="background-color: #28a745; color: white; padding: 3px 10px; border-radius: 3px;">Available</span>'
        )

    used_badge.short_description = "Status"
    used_badge.admin_order_field = "is_used"

    def used_by_link(self, obj):
        """Link to user who used the code"""
        if obj.used_by:
            url = reverse("admin:users_user_change", args=[obj.used_by.pk])
            return format_html('<a href="{}">{}</a>', url, obj.used_by.email)
        return "-"

    used_by_link.short_description = "Used By"
    used_by_link.admin_order_field = "used_by__email"

    def used_at_display(self, obj):
        """Format used date"""
        if obj.used_at:
            return obj.used_at.strftime("%Y-%m-%d %H:%M")
        return "-"

    used_at_display.short_description = "Used At"
    used_at_display.admin_order_field = "used_at"

    def created_display(self, obj):
        """Format created date"""
        return obj.created.strftime("%Y-%m-%d %H:%M")

    created_display.short_description = "Created"
    created_display.admin_order_field = "created"

    def invalidate_codes(self, request, queryset):
        """Invalidate selected codes"""
        queryset = queryset.filter(is_used=False)
        updated = queryset.update(notes="Invalidated by admin")
        queryset.delete()
        self.message_user(request, f"{updated} codes have been invalidated.")

    invalidate_codes.short_description = "Invalidate selected codes"


@admin.register(AttendeeVerification)
class AttendeeVerificationAdmin(admin.ModelAdmin):
    """AttendeeVerification model admin"""

    list_display = (
        "id",
        "user_link",
        "edition_link",
        "verified_badge",
        "verification_method_badge",
        "verified_by_link",
        "verified_at_display",
        "created_display",
    )

    list_display_links = ("id", "user_link")

    search_fields = (
        "user__email",
        "user__username",
        "edition__title",
        "verified_by__email",
        "notes",
    )

    list_filter = ("is_verified", "verification_method", "edition", "created")

    readonly_fields = ("verified_at", "created", "modified")

    fieldsets = (
        ("User & Edition", {"fields": ("user", "edition")}),
        (
            "Verification",
            {"fields": ("is_verified", "verification_method", "verified_by", "verified_at")},
        ),
        ("Notes", {"fields": ("notes",)}),
        ("Timestamps", {"fields": ("created", "modified"), "classes": ("collapse",)}),
    )

    list_per_page = 50

    autocomplete_fields = ["user", "edition", "verified_by"]

    actions = ["verify_attendees", "unverify_attendees"]

    def user_link(self, obj):
        """Link to user admin page"""
        url = reverse("admin:users_user_change", args=[obj.user.pk])
        return format_html('<a href="{}">{}</a>', url, obj.user.email)

    user_link.short_description = "User"
    user_link.admin_order_field = "user__email"

    def edition_link(self, obj):
        """Link to edition admin page"""
        url = reverse("admin:compos_edition_change", args=[obj.edition.pk])
        return format_html('<a href="{}">{}</a>', url, obj.edition.title)

    edition_link.short_description = "Edition"
    edition_link.admin_order_field = "edition__title"

    def verified_badge(self, obj):
        """Display verified status"""
        if obj.is_verified:
            return format_html(
                '<span style="background-color: #28a745; color: white; padding: 3px 10px; border-radius: 3px;">Verified</span>'
            )
        return format_html(
            '<span style="background-color: #ffc107; color: black; padding: 3px 10px; border-radius: 3px;">Pending</span>'
        )

    verified_badge.short_description = "Status"
    verified_badge.admin_order_field = "is_verified"

    def verification_method_badge(self, obj):
        """Display verification method"""
        colors = {
            "manual": "#17a2b8",  # blue
            "code": "#28a745",  # green
            "checkin": "#6f42c1",  # purple
        }
        color = colors.get(obj.verification_method, "#6c757d")
        return format_html(
            '<span style="background-color: {}; color: white; padding: 3px 10px; border-radius: 3px;">{}</span>',
            color,
            obj.get_verification_method_display(),
        )

    verification_method_badge.short_description = "Method"
    verification_method_badge.admin_order_field = "verification_method"

    def verified_by_link(self, obj):
        """Link to verifier"""
        if obj.verified_by:
            url = reverse("admin:users_user_change", args=[obj.verified_by.pk])
            return format_html('<a href="{}">{}</a>', url, obj.verified_by.email)
        return "-"

    verified_by_link.short_description = "Verified By"
    verified_by_link.admin_order_field = "verified_by__email"

    def verified_at_display(self, obj):
        """Format verified date"""
        if obj.verified_at:
            return obj.verified_at.strftime("%Y-%m-%d %H:%M")
        return "-"

    verified_at_display.short_description = "Verified At"
    verified_at_display.admin_order_field = "verified_at"

    def created_display(self, obj):
        """Format created date"""
        return obj.created.strftime("%Y-%m-%d %H:%M")

    created_display.short_description = "Created"
    created_display.admin_order_field = "created"

    def verify_attendees(self, request, queryset):
        """Verify selected attendees"""
        from django.utils import timezone

        updated = queryset.update(
            is_verified=True, verified_by=request.user, verified_at=timezone.now()
        )
        self.message_user(request, f"{updated} attendees have been verified.")

    verify_attendees.short_description = "Verify selected attendees"

    def unverify_attendees(self, request, queryset):
        """Unverify selected attendees"""
        updated = queryset.update(is_verified=False, verified_by=None, verified_at=None)
        self.message_user(request, f"{updated} attendees have been unverified.")

    unverify_attendees.short_description = "Unverify selected attendees"


@admin.register(JuryMember)
class JuryMemberAdmin(admin.ModelAdmin):
    """JuryMember model admin"""

    list_display = (
        "id",
        "user_link",
        "edition_link",
        "compos_list",
        "votes_progress",
        "created_display",
    )

    list_display_links = ("id", "user_link")

    search_fields = ("user__email", "user__username", "edition__title", "notes")

    list_filter = ("edition", "created")

    readonly_fields = ("created", "modified", "voting_progress_detail")

    fieldsets = (
        ("Jury Member", {"fields": ("user", "edition")}),
        (
            "Assigned Compos",
            {
                "fields": ("compos",),
                "description": "Leave empty to allow voting in all compos",
            },
        ),
        ("Voting Progress", {"fields": ("voting_progress_detail",)}),
        ("Notes", {"fields": ("notes",)}),
        ("Timestamps", {"fields": ("created", "modified"), "classes": ("collapse",)}),
    )

    filter_horizontal = ("compos",)

    list_per_page = 50

    autocomplete_fields = ["user", "edition"]

    def user_link(self, obj):
        """Link to user admin page"""
        url = reverse("admin:users_user_change", args=[obj.user.pk])
        return format_html('<a href="{}">{}</a>', url, obj.user.email)

    user_link.short_description = "User"
    user_link.admin_order_field = "user__email"

    def edition_link(self, obj):
        """Link to edition admin page"""
        url = reverse("admin:compos_edition_change", args=[obj.edition.pk])
        return format_html('<a href="{}">{}</a>', url, obj.edition.title)

    edition_link.short_description = "Edition"
    edition_link.admin_order_field = "edition__title"

    def compos_list(self, obj):
        """List of assigned compos"""
        if not obj.compos.exists():
            return "All compos"
        return ", ".join([c.name for c in obj.compos.all()[:3]]) + (
            "..." if obj.compos.count() > 3 else ""
        )

    compos_list.short_description = "Compos"

    def votes_progress(self, obj):
        """Display voting progress"""
        progress = obj.get_voting_progress()
        percentage = progress["progress_percentage"]
        color = (
            "#28a745" if percentage == 100 else "#ffc107" if percentage > 50 else "#dc3545"
        )
        return format_html(
            '<span style="background-color: {}; color: white; padding: 3px 10px; border-radius: 3px;">{}/{} ({:.0f}%)</span>',
            color,
            progress["votes_cast"],
            progress["total_productions"],
            percentage,
        )

    votes_progress.short_description = "Voting Progress"

    def voting_progress_detail(self, obj):
        """Detailed voting progress"""
        if obj.pk:
            progress = obj.get_voting_progress()
            return format_html(
                "<strong>Total Productions:</strong> {}<br/>"
                "<strong>Votes Cast:</strong> {}<br/>"
                "<strong>Pending:</strong> {}<br/>"
                "<strong>Progress:</strong> {:.2f}%",
                progress["total_productions"],
                progress["votes_cast"],
                progress["pending"],
                progress["progress_percentage"],
            )
        return "Save to see progress"

    voting_progress_detail.short_description = "Voting Progress Details"

    def created_display(self, obj):
        """Format created date"""
        return obj.created.strftime("%Y-%m-%d %H:%M")

    created_display.short_description = "Created"
    created_display.admin_order_field = "created"


@admin.register(Vote)
class VoteAdmin(admin.ModelAdmin):
    """Vote model admin"""

    list_display = (
        "id",
        "user_link",
        "production_link",
        "score_badge",
        "vote_type_badge",
        "comment_preview",
        "created_display",
    )

    list_display_links = ("id", "user_link")

    search_fields = (
        "user__email",
        "user__username",
        "production__title",
        "production__authors",
        "comment",
    )

    list_filter = (
        "is_jury_vote",
        "score",
        "production__edition",
        "production__compo",
        "created",
    )

    readonly_fields = ("created", "modified")

    fieldsets = (
        ("Vote", {"fields": ("user", "production")}),
        ("Score & Comment", {"fields": ("score", "comment")}),
        ("Type", {"fields": ("is_jury_vote",)}),
        ("Timestamps", {"fields": ("created", "modified"), "classes": ("collapse",)}),
    )

    list_per_page = 50

    autocomplete_fields = ["user", "production"]

    def user_link(self, obj):
        """Link to user admin page"""
        url = reverse("admin:users_user_change", args=[obj.user.pk])
        return format_html('<a href="{}">{}</a>', url, obj.user.email)

    user_link.short_description = "User"
    user_link.admin_order_field = "user__email"

    def production_link(self, obj):
        """Link to production admin page"""
        url = reverse("admin:compos_production_change", args=[obj.production.pk])
        return format_html('<a href="{}">{}</a>', url, obj.production.title)

    production_link.short_description = "Production"
    production_link.admin_order_field = "production__title"

    def score_badge(self, obj):
        """Display score with color"""
        if obj.score >= 8:
            color = "#28a745"  # green
        elif obj.score >= 5:
            color = "#ffc107"  # yellow
        else:
            color = "#dc3545"  # red
        return format_html(
            '<span style="background-color: {}; color: white; padding: 3px 10px; border-radius: 3px; font-weight: bold;">{}/10</span>',
            color,
            obj.score,
        )

    score_badge.short_description = "Score"
    score_badge.admin_order_field = "score"

    def vote_type_badge(self, obj):
        """Display vote type"""
        if obj.is_jury_vote:
            return format_html(
                '<span style="background-color: #6f42c1; color: white; padding: 3px 10px; border-radius: 3px;">Jury</span>'
            )
        return format_html(
            '<span style="background-color: #17a2b8; color: white; padding: 3px 10px; border-radius: 3px;">Public</span>'
        )

    vote_type_badge.short_description = "Type"
    vote_type_badge.admin_order_field = "is_jury_vote"

    def comment_preview(self, obj):
        """Preview of comment"""
        if obj.comment:
            return obj.comment[:50] + ("..." if len(obj.comment) > 50 else "")
        return "-"

    comment_preview.short_description = "Comment"

    def created_display(self, obj):
        """Format created date"""
        return obj.created.strftime("%Y-%m-%d %H:%M")

    created_display.short_description = "Created"
    created_display.admin_order_field = "created"


@admin.register(VotingPeriod)
class VotingPeriodAdmin(admin.ModelAdmin):
    """VotingPeriod model admin"""

    list_display = (
        "id",
        "edition_link",
        "compo_link",
        "start_display",
        "end_display",
        "active_badge",
        "status_badge",
        "created_display",
    )

    list_display_links = ("id", "edition_link")

    search_fields = ("edition__title", "compo__name")

    list_filter = ("is_active", "edition", "compo", "start_date", "end_date")

    readonly_fields = ("created", "modified", "is_currently_open")

    fieldsets = (
        ("Period", {"fields": ("edition", "compo")}),
        ("Dates", {"fields": ("start_date", "end_date")}),
        ("Status", {"fields": ("is_active", "is_currently_open")}),
        ("Timestamps", {"fields": ("created", "modified"), "classes": ("collapse",)}),
    )

    list_per_page = 50

    autocomplete_fields = ["edition", "compo"]

    actions = ["activate_periods", "deactivate_periods"]

    def edition_link(self, obj):
        """Link to edition admin page"""
        url = reverse("admin:compos_edition_change", args=[obj.edition.pk])
        return format_html('<a href="{}">{}</a>', url, obj.edition.title)

    edition_link.short_description = "Edition"
    edition_link.admin_order_field = "edition__title"

    def compo_link(self, obj):
        """Link to compo admin page"""
        if obj.compo:
            url = reverse("admin:compos_compo_change", args=[obj.compo.pk])
            return format_html('<a href="{}">{}</a>', url, obj.compo.name)
        return "All compos"

    compo_link.short_description = "Compo"
    compo_link.admin_order_field = "compo__name"

    def start_display(self, obj):
        """Format start date"""
        return obj.start_date.strftime("%Y-%m-%d %H:%M")

    start_display.short_description = "Start"
    start_display.admin_order_field = "start_date"

    def end_display(self, obj):
        """Format end date"""
        return obj.end_date.strftime("%Y-%m-%d %H:%M")

    end_display.short_description = "End"
    end_display.admin_order_field = "end_date"

    def active_badge(self, obj):
        """Display active status"""
        if obj.is_active:
            return format_html(
                '<span style="background-color: #28a745; color: white; padding: 3px 10px; border-radius: 3px;">Active</span>'
            )
        return format_html(
            '<span style="background-color: #6c757d; color: white; padding: 3px 10px; border-radius: 3px;">Inactive</span>'
        )

    active_badge.short_description = "Active"
    active_badge.admin_order_field = "is_active"

    def status_badge(self, obj):
        """Display current status"""
        if obj.is_open():
            return format_html(
                '<span style="background-color: #28a745; color: white; padding: 3px 10px; border-radius: 3px;">OPEN NOW</span>'
            )
        from django.utils import timezone

        now = timezone.now()
        if now < obj.start_date:
            return format_html(
                '<span style="background-color: #ffc107; color: black; padding: 3px 10px; border-radius: 3px;">Upcoming</span>'
            )
        return format_html(
            '<span style="background-color: #dc3545; color: white; padding: 3px 10px; border-radius: 3px;">Closed</span>'
        )

    status_badge.short_description = "Status"

    def is_currently_open(self, obj):
        """Check if currently open"""
        if obj.pk:
            return "Yes" if obj.is_open() else "No"
        return "N/A"

    is_currently_open.short_description = "Is Open Now?"

    def created_display(self, obj):
        """Format created date"""
        return obj.created.strftime("%Y-%m-%d %H:%M")

    created_display.short_description = "Created"
    created_display.admin_order_field = "created"

    def activate_periods(self, request, queryset):
        """Activate selected periods"""
        updated = queryset.update(is_active=True)
        self.message_user(request, f"{updated} voting periods have been activated.")

    activate_periods.short_description = "Activate selected periods"

    def deactivate_periods(self, request, queryset):
        """Deactivate selected periods"""
        updated = queryset.update(is_active=False)
        self.message_user(request, f"{updated} voting periods have been deactivated.")

    deactivate_periods.short_description = "Deactivate selected periods"
