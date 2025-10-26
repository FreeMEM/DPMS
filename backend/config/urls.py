""" Main URLs module """

from django.conf import settings
from django.urls import path, include
from django.conf.urls.static import static
from django.contrib import admin
from django.urls.conf import include


# Yet another Swagger generator
from rest_framework import permissions
from drf_yasg.views import get_schema_view
from drf_yasg import openapi

schema_view = get_schema_view(
    openapi.Info(
        title="DPMS API",
        default_version="v1",
        description="API REST for DPMS",
        terms_of_service="https://www.google.com/policies/terms/",
        contact=openapi.Contact(email="contact@snippets.local"),
        license=openapi.License(name="MIT License"),
    ),
    public=True,
    permission_classes=[permissions.AllowAny],
)

urlpatterns = [
    # Django Admin
    path(settings.ADMIN_URL, admin.site.urls),
    # API Routes
    path("api/", include(("dpms.users.urls", "users"), namespace="users")),
    # path(
    #     "oauth/", include("social_django.urls", namespace="social")
    # ),  # Añadir ruta para OAuth
    # https://dpms.backend.posadasparty.com/oauth/sceneid/callback
    # API Documentation
    path(
        "docs/",
        schema_view.with_ui("swagger", cache_timeout=0),
        name="schema-swagger-ui",
    ),
    # Landing Page (debe ir al final como fallback)
    path("", include(("dpms.website.urls", "website"), namespace="website")),
] + static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
