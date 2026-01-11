"""Development settings."""

from .base import *  # NOQA
from .base import env

# Base
DEBUG = True
LOG_LEVEL = os.environ.get("LOG_LEVEL", "INFO")

# Frontend URL for development (React dev server with /app basename)
FRONTEND_URL = env("FRONTEND_URL", default="http://localhost:3000/app")

# Security
SECRET_KEY = env(
    "DJANGO_SECRET_KEY",
    default="PB3aGvTmCkzaLGRAxDc3aMayKTPTDd5usT8gw4pCmKOk5AlJjh12pTrnNgQyOHCH",
)
ALLOWED_HOSTS = ["localhost", "0.0.0.0", "127.0.0.1", "192.168.1.74"]

# Cache
CACHES = {
    "default": {
        "BACKEND": "django.core.cache.backends.locmem.LocMemCache",
        "LOCATION": "",
    }
}

# Templates
TEMPLATES[0]["OPTIONS"]["debug"] = DEBUG  # NOQA

# Email
EMAIL_BACKEND = env(
    "DJANGO_EMAIL_BACKEND", default="django.core.mail.backends.console.EmailBackend"
)
EMAIL_HOST = "localhost"
EMAIL_PORT = 1025

# django-extensions
INSTALLED_APPS += ["django_extensions"]  # noqa F405

# Users & Authentication
AUTH_USER_MODEL = "users.User"
DEFAULT_AUTO_FIELD = "django.db.models.BigAutoField"

# BACKEND_URL usado para otros propósitos si es necesario
BACKEND_URL = "http://localhost:8000"

LOGGING = {
    "version": 1,
    "disable_existing_loggers": False,
    "formatters": {
        "verbose": {
            "format": "{levelname} {asctime} {module} {message}",
            "style": "{",
        },
        "simple": {
            "format": "{levelname} {message}",
            "style": "{",
        },
        "vverbose": {
            "format": "{asctime} {levelname} {name} {module} {process:d} {thread:d} {message}",
            "style": "{",
        },
    },
    "handlers": {
        "console1": {"class": "logging.StreamHandler", "formatter": "simple"},
        "console2": {"class": "logging.StreamHandler", "formatter": "verbose"},
        "console3": {"class": "logging.StreamHandler", "formatter": "vverbose"},
    },
    "loggers": {
        "dpms": {
            "handlers": ["console2"],
            "level": LOG_LEVEL,
        },
        "django": {
            "handlers": ["console1"],
            "level": "INFO",
        },
    },
}
