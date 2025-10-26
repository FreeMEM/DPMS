# dpms/compos/admin.py

from django.contrib import admin
from django.utils.html import format_html
from django.urls import reverse
from django.db.models import Count
from .models import Edition, Compo, HasCompo, Production, File


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
