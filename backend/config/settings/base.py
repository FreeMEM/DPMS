"""Base settings to build other settings files upon."""

import environ, os
from pathlib import Path

import ssl

ROOT_DIR = environ.Path(__file__) - 3
APPS_DIR = ROOT_DIR.path("dpms")
env = environ.Env()
environ.Env.read_env()  # reading .env file
# Base
DEBUG = env.bool("DJANGO_DEBUG", False)
LOG_LEVEL = os.environ.get("LOG_LEVEL", "INFO")
# SECRET_KEY must be set in local.py or production.py
# If it reaches this point without being set, Django will raise ImproperlyConfigured

# Language and timezone
TIME_ZONE = "Europe/Madrid"
LANGUAGE_CODE = "es"
LANGUAGES = [
    ("es", "Español"),
    ("en", "English"),
    ("fr", "Français"),
    ("pt", "Português"),
    ("de", "Deutsch"),
    ("fi", "Suomi"),
]
MODELTRANSLATION_DEFAULT_LANGUAGE = "es"
MODELTRANSLATION_FALLBACK_LANGUAGES = ("es", "en")
SITE_ID = 1
USE_I18N = True
USE_L10N = True
USE_TZ = True
BASE_DIR = Path(__file__).resolve().parent.parent
LOCALE_PATHS = [
    str(ROOT_DIR.path("locale")),
]

ALLOWED_HOSTS = env.list(
    "DJANGO_ALLOWED_HOSTS",
    default=[
        "api.dpms.freemem.space",
        "dpms.capacitorparty.com",
        "dpms.freemem.space",
        "capacitorparty.com",
        "freemem.space",
    ],
)

# # DATABASES
# DATABASES = {
#     "default": env.db("DATABASE_URL"),
# }
# DATABASES["default"]["ATOMIC_REQUESTS"] = True
# DATABASES["default"]["ENGINE"] = "django.db.backends.postgresql"

# Databases
# DATABASES["default"] = env.db("DATABASE_URL")  # NOQA
DATABASES = {
    "default": {
        "ENGINE": "django.db.backends.postgresql",
        "NAME": env("POSTGRES_DB"),
        "USER": env("POSTGRES_USER"),
        "PASSWORD": env("POSTGRES_PASSWORD"),
        "HOST": env("POSTGRES_HOST"),
        "PORT": env("POSTGRES_PORT"),
    },
}

DATABASES["default"]["ATOMIC_REQUESTS"] = True  # NOQA
DATABASES["default"]["CONN_MAX_AGE"] = env.int("CONN_MAX_AGE", default=60)  # NOQA


# URLs
ROOT_URLCONF = "config.urls"

# WSGI
WSGI_APPLICATION = "config.wsgi.application"

# Users & Authentication
AUTH_USER_MODEL = "users.User"
DEFAULT_AUTO_FIELD = "django.db.models.BigAutoField"

# Apps
DJANGO_APPS = [
    "modeltranslation",
    "django.contrib.auth",
    "django.contrib.contenttypes",
    "django.contrib.sessions",
    "django.contrib.messages",
    "django.contrib.staticfiles",
    "django.contrib.admin",
]

THIRD_PARTY_APPS = [
    "rest_framework",
    "rest_framework.authtoken",
    "drf_yasg",
    "corsheaders",
    # "social_django",
]
LOCAL_APPS = [
    "dpms.users.apps.UsersAppConfig",
    "dpms.compos.apps.ComposAppConfig",
    "dpms.website.apps.WebsiteConfig",
    # "dpms.users"
]
INSTALLED_APPS = DJANGO_APPS + THIRD_PARTY_APPS + LOCAL_APPS

# Passwords
PASSWORD_HASHERS = [
    "django.contrib.auth.hashers.Argon2PasswordHasher",
    "django.contrib.auth.hashers.PBKDF2PasswordHasher",
    "django.contrib.auth.hashers.PBKDF2SHA1PasswordHasher",
    "django.contrib.auth.hashers.BCryptSHA256PasswordHasher",
    "django.contrib.auth.hashers.BCryptPasswordHasher",
]
AUTH_PASSWORD_VALIDATORS = [
    {
        "NAME": "django.contrib.auth.password_validation.UserAttributeSimilarityValidator",
    },
    {
        "NAME": "django.contrib.auth.password_validation.MinimumLengthValidator",
    },
    {
        "NAME": "django.contrib.auth.password_validation.CommonPasswordValidator",
    },
    {
        "NAME": "django.contrib.auth.password_validation.NumericPasswordValidator",
    },
]

# Middlewares
MIDDLEWARE = [
    "django.middleware.security.SecurityMiddleware",
    "corsheaders.middleware.CorsMiddleware",
    "django.contrib.sessions.middleware.SessionMiddleware",
    "django.middleware.locale.LocaleMiddleware",
    "django.middleware.common.CommonMiddleware",
    "django.middleware.csrf.CsrfViewMiddleware",
    "django.contrib.auth.middleware.AuthenticationMiddleware",
    "django.contrib.messages.middleware.MessageMiddleware",
    "django.middleware.clickjacking.XFrameOptionsMiddleware",
    # "social_django.middleware.SocialAuthExceptionMiddleware",
]

# AUTHENTICATION_BACKENDS = (
#     # "dpms.users.oauth.sceneid.SceneIDOAuth2",  # Añade el backend de SceneID
#     "social_core.backends.sceneid.SceneIDOAuth2",  # SceneID backend
#     "django.contrib.auth.backends.ModelBackend",
# )

# Claves de SceneID (obtenidas desde el portal de desarrolladores de SceneID)
# SOCIAL_AUTH_SCENEID_KEY = env("SCENE_CLIENT_ID")
# SOCIAL_AUTH_SCENEID_SECRET = env("SCENEID_CLIENT_SECRET")

# Configura las URLs
LOGIN_REDIRECT_URL = "/"
LOGOUT_REDIRECT_URL = "/logout/"
# SOCIAL_AUTH_SCENEID_SCOPE = ["openid", "profile", "email"]

# Otros ajustes relacionados con la autenti/ión
SOCIAL_AUTH_JSONFIELD_ENABLED = True


CORS_ALLOWED_ORIGINS = [
    "https://api.dpms.freemem.space",
    "https://dpms.capacitorparty.com",
    "https://dpms.freemem.space",
]
# Static files
# STATIC_ROOT = str(ROOT_DIR("staticfiles"))
STATIC_ROOT = BASE_DIR / "../staticfiles/static"
STATIC_URL = "/static/"
# STATICFILES_DIRS = [
#     str(APPS_DIR.path('static')),
# ]
STATICFILES_FINDERS = [
    "django.contrib.staticfiles.finders.FileSystemFinder",
    "django.contrib.staticfiles.finders.AppDirectoriesFinder",
]

# Media
# MEDIA_ROOT = str(APPS_DIR("media"))
MEDIA_ROOT = BASE_DIR / "../staticfiles/media"

MEDIA_URL = "/media/"

# File uploads - allow large video files (up to 500MB)
DATA_UPLOAD_MAX_MEMORY_SIZE = 104857600  # 100MB (matches file upload limit)
FILE_UPLOAD_MAX_MEMORY_SIZE = 10485760   # 10MB (files larger than this use temp disk)

# Templates
TEMPLATES = [
    {
        "BACKEND": "django.template.backends.django.DjangoTemplates",
        "DIRS": [
            str(APPS_DIR.path("templates")),
        ],
        "OPTIONS": {
            "debug": DEBUG,
            "loaders": [
                "django.template.loaders.filesystem.Loader",
                "django.template.loaders.app_directories.Loader",
            ],
            "context_processors": [
                "django.template.context_processors.debug",
                "django.template.context_processors.request",
                "django.contrib.auth.context_processors.auth",
                "django.template.context_processors.i18n",
                "django.template.context_processors.media",
                "django.template.context_processors.static",
                "django.template.context_processors.tz",
                "django.contrib.messages.context_processors.messages",
                "dpms.website.context_processors.frontend_url",
            ],
        },
    },
]

# Security
SESSION_COOKIE_HTTPONLY = True
SESSION_COOKIE_SAMESITE = "Lax"
CSRF_COOKIE_HTTPONLY = True
CSRF_COOKIE_SAMESITE = "Lax"
SECURE_BROWSER_XSS_FILTER = True
X_FRAME_OPTIONS = "DENY"

# Email
EMAIL_BACKEND = env(
    "DJANGO_EMAIL_BACKEND", default="django.core.mail.backends.smtp.EmailBackend"
)


# Admin
ADMIN_URL = "admin/"
ADMINS = [
    ("""Francisco A. Tapias""", "freemem@freemem.space"),
]
MANAGERS = ADMINS

# Django REST Framework
REST_FRAMEWORK = {
    'DEFAULT_AUTHENTICATION_CLASSES': [
        'rest_framework.authentication.TokenAuthentication',
        'rest_framework.authentication.SessionAuthentication',
    ],
    'DEFAULT_PERMISSION_CLASSES': [
        'rest_framework.permissions.IsAuthenticatedOrReadOnly',
    ],
    'DEFAULT_THROTTLE_CLASSES': [
        'rest_framework.throttling.AnonRateThrottle',
        'rest_framework.throttling.UserRateThrottle',
    ],
    'DEFAULT_THROTTLE_RATES': {
        'anon': '30/minute',
        'user': '120/minute',
    },
}
