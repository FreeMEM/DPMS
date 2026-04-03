""" Main URLs module """

import os
import mimetypes
from django.conf import settings
from django.urls import path, include, re_path
from django.conf.urls.static import static
from django.contrib import admin
from django.http import FileResponse, HttpResponse, Http404


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
    public=False,
    permission_classes=[permissions.IsAdminUser],
)

urlpatterns = [
    # Django Admin
    path(settings.ADMIN_URL, admin.site.urls),
    # API Routes
    path("api/", include(("dpms.users.urls", "users"), namespace="users")),
    path("api/", include(("dpms.compos.urls", "compos"), namespace="compos")),
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
]


def serve_media(request, path):
    """Serve media files with HTTP Range request support for video streaming."""
    from django.utils._os import safe_join
    try:
        file_path = safe_join(settings.MEDIA_ROOT, path)
    except ValueError:
        raise Http404
    if not os.path.isfile(file_path):
        raise Http404

    file_size = os.path.getsize(file_path)
    content_type, _ = mimetypes.guess_type(file_path)
    content_type = content_type or 'application/octet-stream'

    range_header = request.META.get('HTTP_RANGE')
    if range_header:
        range_match = range_header.strip().split('=')[-1]
        range_start, range_end = range_match.split('-')
        range_start = int(range_start)
        range_end = int(range_end) if range_end else file_size - 1
        content_length = range_end - range_start + 1

        f = open(file_path, 'rb')
        f.seek(range_start)
        data = f.read(content_length)
        f.close()

        response = HttpResponse(data, status=206, content_type=content_type)
        response['Content-Length'] = content_length
        response['Content-Range'] = f'bytes {range_start}-{range_end}/{file_size}'
    else:
        response = FileResponse(open(file_path, 'rb'), content_type=content_type)

    response['Accept-Ranges'] = 'bytes'
    return response


if settings.DEBUG:
    urlpatterns += [
        re_path(r'^media/(?P<path>.*)$', serve_media),
    ]
