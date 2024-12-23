"""Production settings."""

from .base import *  # NOQA
from .base import env
from django.core.exceptions import ImproperlyConfigured

SECRET_KEY = env("DJANGO_SECRET_KEY")

ALLOWED_HOSTS = env.list(
    "DJANGO_ALLOWED_HOSTS",
    default=[
        "localhost",
        "12.0.0.1",
        "api.dpms.freemem.space",
        "dpms.capacitorparty.com",
        "dpms.freemem.space",
        "capacitorparty.com",
        "freemem.space",
    ],
)

# # Databases
# # DATABASES["default"] = env.db("DATABASE_URL")  # NOQA
# DATABASES = {
#     "default": {
#         "ENGINE": "django.db.backends.postgresql",
#         "NAME": env("POSTGRES_DB"),
#         "USER": env("POSTGRES_USER"),
#         "PASSWORD": env("POSTGRES_PASSWORD"),
#         "HOST": env("POSTGRES_HOST"),
#         "PORT": env("POSTGRES_PORT"),
#     },
# }

# DATABASES["default"]["ATOMIC_REQUESTS"] = True  # NOQA
# DATABASES["default"]["CONN_MAX_AGE"] = env.int("CONN_MAX_AGE", default=60)  # NOQA

# Cache
# CACHES = {
#     "default": {
#         "BACKEND": "django_redis.cache.RedisCache",
#         "LOCATION": env("REDIS_URL"),
#         "OPTIONS": {
#             "CLIENT_CLASS": "django_redis.client.DefaultClient",
#             "IGNORE_EXCEPTIONS": True,
#         },
#     }
# }

# Security
SECURE_PROXY_SSL_HEADER = ("HTTP_X_FORWARDED_PROTO", "https")
SECURE_SSL_REDIRECT = env.bool("DJANGO_SECURE_SSL_REDIRECT", default=True)
SESSION_COOKIE_SECURE = True
CSRF_COOKIE_SECURE = True
SECURE_HSTS_SECONDS = 60
SECURE_HSTS_INCLUDE_SUBDOMAINS = env.bool(
    "DJANGO_SECURE_HSTS_INCLUDE_SUBDOMAINS", default=True
)
SECURE_HSTS_PRELOAD = env.bool("DJANGO_SECURE_HSTS_PRELOAD", default=True)
SECURE_CONTENT_TYPE_NOSNIFF = env.bool(
    "DJANGO_SECURE_CONTENT_TYPE_NOSNIFF", default=True
)

# Storages
# INSTALLED_APPS += ["storages"]  # noqa F405
# AWS_ACCESS_KEY_ID = env("DJANGO_AWS_ACCESS_KEY_ID")
# AWS_SECRET_ACCESS_KEY = env("DJANGO_AWS_SECRET_ACCESS_KEY")
# AWS_STORAGE_BUCKET_NAME = env("DJANGO_AWS_STORAGE_BUCKET_NAME")
# AWS_QUERYSTRING_AUTH = False
# _AWS_EXPIRY = 60 * 60 * 24 * 7
# AWS_S3_OBJECT_PARAMETERS = {
#     "CacheControl": f"max-age={_AWS_EXPIRY}, s-maxage={_AWS_EXPIRY}, must-revalidate",
# }

# Static  files
# STATICFILES_STORAGE = "whitenoise.storage.CompressedManifestStaticFilesStorage"

# Media
# DEFAULT_FILE_STORAGE = "storages.backends.s3boto3.S3Boto3Storage"
# MEDIA_URL = f"https://{AWS_STORAGE_BUCKET_NAME}.s3.amazonaws.com/"

# Templates
# TEMPLATES[0]["OPTIONS"]["loaders"] = [  # noqa F405
#    (
#         "django.template.loaders.cached.Loader",
#         [
#             "django.template.loaders.filesystem.Loader",
#             "django.template.loaders.app_directories.Loader",
#         ],
#     ),
# ]

# # Email
# DEFAULT_FROM_EMAIL = env(
#     "DJANGO_DEFAULT_FROM_EMAIL", default="Comparte Ride <noreply@comparteride.com>"
# )
# SERVER_EMAIL = env("DJANGO_SERVER_EMAIL", default=DEFAULT_FROM_EMAIL)
# EMAIL_SUBJECT_PREFIX = env("DJANGO_EMAIL_SUBJECT_PREFIX", default="[Comparte Ride]")

EMAIL_HOST = env("EMAIL_HOST")
EMAIL_HOST_USER = env("EMAIL_HOST_USER")
EMAIL_HOST_PASSWORD = env("EMAIL_HOST_PASSWORD")
EMAIL_PORT = env("EMAIL_PORT")
EMAIL_USE_TLS = env("EMAIL_USE_TLS")
EMAIL_SSL_CONTEXT = ssl_context


FRONTEND_URL = "https://dpms.freemem.space"
BACKEND_URL = "https://api.dpms.freemem.space"

# Admin
# ADMIN_URL = env("DJANGO_ADMIN_URL")

# # Anymail (Mailgun)
# INSTALLED_APPS += ["anymail"]  # noqa F405
# EMAIL_BACKEND = "anymail.backends.mailgun.EmailBackend"
# ANYMAIL = {
#     "MAILGUN_API_KEY": env("MAILGUN_API_KEY"),
#     "MAILGUN_SENDER_DOMAIN": env("MAILGUN_DOMAIN"),
# }

# # Gunicorn
# INSTALLED_APPS += ["gunicorn"]  # noqa F405

# # WhiteNoise
# MIDDLEWARE.insert(1, "whitenoise.middleware.WhiteNoiseMiddleware")  # noqa F405

# INSTALLED_APPS += ["social_django"]
# Claves de SceneID (obtenidas desde el portal de desarrolladores de SceneID)
SOCIAL_AUTH_SCENEID_KEY = env("SCENE_CLIENT_ID")
SOCIAL_AUTH_SCENEID_SECRET = env("SCENEID_CLIENT_SECRET")
SOCIAL_AUTH_SCENEID_SCOPE = ["profile", "email"]  # Define el alcance que necesitas
SOCIAL_AUTH_SCENEID_REDIRECT_URI = (
    "https://api.dpms.freemem.space/auth/sceneid/callback/"  # URL de callback
)

# Logging
# A sample logging configuration. The only tangible logging
# performed by this configuration is to send an email to
# the site admins on every HTTP 500 error when DEBUG=False.
# See https://docs.djangoproject.com/en/dev/topics/logging for
# more details on how to customize your logging configuration.
# LOGGING = {
#     "version": 1,
#     "disable_existing_loggers": False,
#     "filters": {"require_debug_false": {"()": "django.utils.log.RequireDebugFalse"}},
#     "formatters": {
#         "verbose": {
#             "format": "%(levelname)s %(asctime)s %(module)s "
#             "%(process)d %(thread)d %(message)s"
#         },
#     },
#     "handlers": {
#         "mail_admins": {
#             "level": "ERROR",
#             "filters": ["require_debug_false"],
#             "class": "django.utils.log.AdminEmailHandler",
#         },
#         "console": {
#             "level": "DEBUG",
#             "class": "logging.StreamHandler",
#             "formatter": "verbose",
#         },
#     },
#     "loggers": {
#         "django.request": {
#             "handlers": ["mail_admins"],
#             "level": "ERROR",
#             "propagate": True,
#         },
#         "django.security.DisallowedHost": {
#             "level": "ERROR",
#             "handlers": ["console", "mail_admins"],
#             "propagate": True,
#         },
#     },
# }

if DEBUG:
    INSTALLED_APPS += ["django_extensions"]

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
