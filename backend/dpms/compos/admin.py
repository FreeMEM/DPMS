# dpms/compos/admin.py

from django.contrib import admin
from .models import Edition, Compo, HasCompo, Production, File


# Inline admin for HasCompo in Edition
class HasCompoInlineForEdition(admin.TabularInline):
    model = HasCompo
    extra = 1
    fk_name = "edition"


# Inline admin for HasCompo in Compo
class HasCompoInlineForCompo(admin.TabularInline):
    model = HasCompo
    extra = 1
    fk_name = "compo"


# Admin for Edition model
class EditionAdmin(admin.ModelAdmin):
    list_display = (
        "title",
        "uploaded_by",
        "public",
        "open_to_upload",
        "open_to_update",
    )
    inlines = [HasCompoInlineForEdition]
    search_fields = ("title", "description")
    list_filter = ("public", "open_to_upload", "open_to_update")


# Admin for Compo model
class CompoAdmin(admin.ModelAdmin):
    list_display = ("name", "created_by")
    inlines = [HasCompoInlineForCompo]
    search_fields = ("name", "description")
    list_filter = ("created_by",)


# Admin for Production model
class ProductionAdmin(admin.ModelAdmin):
    list_display = ("title", "authors", "uploaded_by", "edition", "compo")
    search_fields = ("title", "authors", "description")
    list_filter = ("edition", "compo", "uploaded_by")


# Admin for File model
class FileAdmin(admin.ModelAdmin):
    list_display = ("title", "uploaded_by", "original_filename", "public", "is_active")
    readonly_fields = ("original_filename",)
    search_fields = ("title", "description", "original_filename")
    list_filter = ("public", "is_active", "uploaded_by")


# Admin for Image model
# class ImageAdmin(admin.ModelAdmin):
#     list_display = ("title", "uploaded_by", "public", "is_active")
#     search_fields = ("title", "description")
#     list_filter = ("public", "is_active", "uploaded_by")


# Register models with their corresponding admin classes
admin.site.register(Edition, EditionAdmin)
admin.site.register(Compo, CompoAdmin)
admin.site.register(HasCompo)
admin.site.register(Production, ProductionAdmin)
admin.site.register(File, FileAdmin)
# admin.site.register(Image, ImageAdmin)
