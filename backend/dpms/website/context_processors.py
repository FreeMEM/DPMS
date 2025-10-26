from django.conf import settings


def frontend_url(request):
    """
    Context processor para hacer disponible la URL del frontend en todos los templates.
    En desarrollo apunta a localhost:3000 (React dev server).
    En producción apunta a /app (mismo dominio).
    """
    return {
        'FRONTEND_URL': getattr(settings, 'FRONTEND_URL', '/app'),
    }
