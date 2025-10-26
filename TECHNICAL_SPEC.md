# DPMS - Especificación Técnica Completa
## Demo Party Management System

**Versión**: 2.0
**Fecha**: 2025-10-26
**Arquitectura**: Híbrida (Django Landing + React SPA + REST API)

---

## Tabla de Contenidos

1. [Visión General del Proyecto](#1-visión-general-del-proyecto)
2. [Arquitectura del Sistema](#2-arquitectura-del-sistema)
3. [Estado Actual de Implementación](#3-estado-actual-de-implementación)
4. [Nuevas Funcionalidades Requeridas](#4-nuevas-funcionalidades-requeridas)
5. [Modelo de Datos](#5-modelo-de-datos)
6. [Roles y Permisos](#6-roles-y-permisos)
7. [Especificación de APIs](#7-especificación-de-apis)
8. [Frontend - Componentes y Páginas](#8-frontend---componentes-y-páginas)
9. [Plan de Implementación por Fases](#9-plan-de-implementación-por-fases)
10. [Consideraciones Técnicas](#10-consideraciones-técnicas)

---

## 1. Visión General del Proyecto

### 1.1 Descripción

DPMS (Demo Party Management System) es un sistema integral para gestionar fiestas de demoscene (demo parties). Permite la organización de eventos, gestión de competiciones, envío de producciones, votaciones, y difusión de información pública sobre el evento.

### 1.2 Objetivos del Sistema

- **Gestión de eventos**: Crear y administrar ediciones de demo parties
- **Competiciones**: Organizar compos (competiciones) con reglas y plazos configurables
- **Participación**: Permitir a usuarios registrarse, enviar producciones y votar
- **Difusión pública**: Página de landing SEO-friendly con información del evento
- **Administración**: Panel de control para organizadores del evento

### 1.3 Usuarios del Sistema

| Rol | Descripción | Permisos |
|-----|-------------|----------|
| **Visitante Anónimo** | Usuario no registrado | Ver landing page, noticias, galería |
| **Usuario Participante** | Usuario registrado y verificado | Enviar producciones, votar, gestionar perfil |
| **Administrador DPMS** | Organizador del evento | Gestión completa del sistema |

---

## 2. Arquitectura del Sistema

### 2.1 Arquitectura Híbrida

El sistema utiliza una arquitectura híbrida que combina:

```
┌─────────────────────────────────────────────────────────────┐
│                    DPMS System Architecture                  │
└─────────────────────────────────────────────────────────────┘

┌──────────────────────┐         ┌──────────────────────────┐
│   Django Frontend    │         │    React SPA Frontend    │
│   (Landing Page)     │         │   (Application Panel)    │
├──────────────────────┤         ├──────────────────────────┤
│ URL: /               │         │ URL: /app/*              │
│                      │         │                          │
│ - Noticias           │         │ - Login/Signup           │
│ - Próximo evento     │         │ - Dashboard usuario      │
│ - Contador           │         │ - Dashboard admin        │
│ - Galería            │         │ - Gestión de producciones│
│ - Información        │         │ - Votaciones             │
│                      │         │                          │
│ SEO: ✓ Indexable     │         │ SEO: ✗ No indexable      │
│ Render: Server-side  │         │ Render: Client-side      │
└──────────┬───────────┘         └──────────┬───────────────┘
           │                                │
           │                                │
           └────────────┬───────────────────┘
                        │
                        ▼
           ┌────────────────────────┐
           │   Django REST API      │
           │   URL: /api/*          │
           ├────────────────────────┤
           │ - Users API            │
           │ - Editions API         │
           │ - Compos API           │
           │ - Productions API      │
           │ - News API             │
           │ - Gallery API          │
           │ - Votes API            │
           └────────────┬───────────┘
                        │
                        ▼
           ┌────────────────────────┐
           │   PostgreSQL Database  │
           └────────────────────────┘
```

### 2.2 Stack Tecnológico

#### Backend
- **Framework**: Django 5.0.x + Django REST Framework
- **Base de datos**: PostgreSQL 16
- **Autenticación**: DRF Token + JWT
- **Servidor**: Gunicorn + Nginx (producción)
- **Containerización**: Docker + Docker Compose

#### Frontend Landing (Django)
- **Motor de templates**: Django Templates
- **CSS Framework**: Bootstrap 5 o Tailwind CSS
- **JavaScript**: Vanilla JS (mínimo, solo interactividad)

#### Frontend App (React)
- **Framework**: React 18.3
- **UI Library**: Material-UI 6.3
- **Routing**: React Router 6
- **HTTP Client**: Axios 1.7
- **Gestión de estado**: React Context API
- **i18n**: i18next

#### Infraestructura
- **Desarrollo**: Docker Compose (local.yml)
- **Producción**: Docker Compose (production.yml) + Caddy
- **CI/CD**: (Por definir)

### 2.3 Estructura de URLs

```
/                                   → Django landing (SEO)
/static/                           → Archivos estáticos (CSS, JS, imágenes)
/media/                            → Uploads de usuarios

/app/                              → React SPA
/app/login                         → Login de usuarios
/app/signup                        → Registro
/app/verify-account/:token         → Verificación de email
/app/dashboard                     → Dashboard principal
/app/admin/dashboard               → Panel administrativo

/api/                              → REST API
/api/users/                        → Gestión de usuarios
/api/editions/                     → Ediciones/eventos
/api/compos/                       → Competiciones
/api/productions/                  → Producciones enviadas
/api/news/                         → Noticias (nueva)
/api/gallery/                      → Galería de fotos (nueva)
/api/votes/                        → Sistema de votación (nueva)
/api/site-settings/                → Configuración del sitio (nueva)

/admin/                            → Django Admin
/docs/                             → Swagger API docs
```

---

## 3. Estado Actual de Implementación

### 3.1 Backend - Django (COMPLETO ✓)

#### App: Users
**Estado**: Completamente implementado

**Modelos**:
- ✓ `User` - Usuario con email como USERNAME_FIELD
- ✓ `Profile` - Perfil extendido (nickname, grupo, avatar)

**API Endpoints**:
- ✓ `POST /api/users/signup/` - Registro de usuario
- ✓ `POST /api/users/login/` - Login con email/password
- ✓ `GET /api/users/verify/?token=<jwt>` - Verificación de email
- ✓ `GET /api/users/<email>/` - Obtener datos de usuario
- ✓ `PUT/PATCH /api/users/<email>/profile/` - Actualizar perfil

**Características**:
- ✓ Email verification con JWT (3 días de validez)
- ✓ Dual-token authentication (DRF Token + JWT)
- ✓ Control de concurrencia de sesiones
- ✓ Grupos automáticos: "DPMS Admins" y "DPMS Users"
- ✓ Permisos basados en grupos
- ✓ Django Admin configurado

#### App: Compos
**Estado**: Modelos definidos, API NO implementada

**Modelos**:
- ✓ `Edition` - Evento/edición de la party
- ✓ `Compo` - Tipo de competición
- ✓ `HasCompo` - Relación M2M con configuración temporal
- ✓ `Production` - Producción enviada
- ✓ `File` - Archivos subidos (con UUID naming)
- ⚠ `Image` - Modelo stub vacío

**API Endpoints**:
- ✗ No hay serializers
- ✗ No hay viewsets
- ✗ No hay rutas en urls.py

**Django Admin**:
- ✓ Interfaces admin configuradas para todos los modelos

### 3.2 Frontend - React (PARCIAL ⚠)

#### Componentes Implementados
- ✓ `Login` - Formulario de login completo
- ✓ `Signup` - Formulario de registro
- ✓ `VerifyAccount` - Verificación de email
- ✓ `ForgotPassword` - Modal de recuperación (no funcional)
- ✓ `MainBar` - Barra de navegación principal
- ✓ `Content` - Contenedor de páginas (placeholder)
- ✓ `DemoPartyDashboard` - Dashboard usuario (vacío)
- ✓ `AdminDashboard` - Dashboard admin (vacío)
- ✓ `Error404` - Página de error

#### Funcionalidades
- ✓ Sistema de autenticación completo
- ✓ Context API para estado global
- ✓ Rutas privadas/públicas
- ✓ Navegación responsive
- ✓ i18n (español/inglés)
- ✓ Tema oscuro Material-UI

#### NO Implementado
- ✗ Gestión de competiciones
- ✗ Envío de producciones
- ✗ Sistema de votaciones
- ✗ Galería
- ✗ Páginas de información
- ✗ Gestión de usuarios (admin)
- ✗ Perfil de usuario

### 3.3 Frontend - Django Landing
**Estado**: NO implementado

- ✗ No hay templates Django
- ✗ No hay vistas Django para landing
- ✗ No hay modelos para contenido (News, Gallery, etc.)

---

## 4. Nuevas Funcionalidades Requeridas

### 4.1 Landing Page Pública (Django Templates)

#### Requisitos Funcionales

**Página Principal** (`/`)
- **Encabezado/Hero Section**:
  - Logo del evento
  - Nombre y eslogan de la demo party
  - Fechas de la próxima edición
  - Ubicación del evento
  - Contador regresivo hasta el evento
  - Call-to-action: "Regístrate ahora" / "Envía tu producción"

- **Sección de Noticias**:
  - Listado de últimas 5 noticias
  - Imagen destacada por noticia
  - Título, resumen y fecha
  - Enlace a noticia completa
  - Paginación para ver más

- **Próximo Evento**:
  - Información destacada de la próxima edición
  - Fecha y hora
  - Lugar/venue con mapa embebido
  - Competiciones disponibles
  - Plazos de envío

- **Cómo Llegar**:
  - Dirección completa
  - Mapa interactivo (Google Maps/OpenStreetMap)
  - Indicaciones en transporte público
  - Información de parking
  - Alojamientos cercanos

- **Galería de Ediciones Anteriores**:
  - Grid de fotos de eventos pasados
  - Filtrado por edición/año
  - Lightbox para ver fotos en grande
  - Información de la edición en cada foto

- **Footer**:
  - Enlaces a redes sociales
  - Contacto
  - Créditos
  - Enlace a login/registro de la app

#### SEO y Meta Tags
- Title y description dinámicos
- Open Graph tags para redes sociales
- Schema.org markup para eventos
- Sitemap.xml automático
- robots.txt

### 4.2 Sistema de Noticias

**Gestión (Admin)**:
- Crear, editar, eliminar noticias
- Título, contenido (rich text), imagen destacada
- Fecha de publicación, autor
- Estado: borrador/publicado
- Categorías/tags

**Visualización**:
- Lista de noticias en landing
- Página detalle de noticia
- Filtrado por fecha/categoría
- RSS feed

### 4.3 Sistema de Galería

**Gestión (Admin)**:
- Subir múltiples fotos
- Asociar fotos a ediciones específicas
- Título, descripción, fotógrafo
- Orden/destacadas

**Visualización**:
- Grid responsive en landing
- Lightbox/modal para ver fotos
- Filtro por edición
- Slideshow automático

### 4.4 Configuración del Sitio

**Settings editables desde Admin**:
- Información general del evento
- Fechas de próxima edición
- Ubicación/venue
- Enlaces a redes sociales
- Información de contacto
- Banner/anuncios importantes
- Activar/desactivar secciones

### 4.5 Gestión de Competiciones (API + Frontend)

**Backend API** (falta implementar):
- CRUD completo de Editions
- CRUD completo de Compos
- Gestión de HasCompo (configuración temporal)
- Endpoints públicos (solo lectura) para landing
- Endpoints privados (escritura) para admin

**Frontend React**:
- Lista de competiciones disponibles
- Reglas de cada competición
- Plazos de envío
- Formulario de envío de producción
- Lista de mis producciones enviadas

**Frontend Django Landing**:
- Mostrar competiciones del próximo evento
- Información básica y fechas

### 4.6 Sistema de Votación (Nuevo)

**Backend**:
- Modelo Vote
- Restricciones: un voto por usuario por producción
- Cálculo de resultados
- Período de votación configurable

**Frontend React**:
- Interfaz de votación durante el evento
- Ver producciones por competición
- Emitir votos (puntuación)
- Ver mis votos
- Resultados finales

### 4.7 Gestión de Usuarios (Admin)

**Backend**: Ya existe el modelo

**Frontend React - Panel Admin**:
- Lista de usuarios registrados
- Búsqueda y filtros
- Ver perfil de usuario
- Activar/desactivar usuarios
- Asignar roles/grupos
- Ver producciones de un usuario

---

## 5. Modelo de Datos

### 5.1 Modelos Existentes

#### User
```python
class User(BaseModel, AbstractUser):
    email = EmailField(unique=True)  # USERNAME_FIELD
    username = CharField(max_length=150)
    first_name = CharField(max_length=150)
    last_name = CharField(max_length=150)
    is_verified = BooleanField(default=False)
    allow_concurrence = BooleanField(default=False)
    # created, modified (from BaseModel)
```

#### Profile
```python
class Profile(BaseModel):
    user = OneToOneField(User, on_delete=CASCADE)
    extra_information = TextField(max_length=500)
    avatar = ImageField(upload_to='users/pictures/')
    nickname = CharField(max_length=128)
    group = CharField(max_length=128)  # Demoscene group
    visit_listing = BooleanField(default=False)
    # created, modified
```

#### Edition
```python
class Edition(BaseModel):
    title = CharField(max_length=255)
    description = TextField()
    uploaded_by = ForeignKey(User, on_delete=CASCADE)
    public = BooleanField(default=False)
    open_to_upload = BooleanField(default=False)
    open_to_update = BooleanField(default=False)
    compos = ManyToManyField(Compo, through='HasCompo')
    # created, modified
```

#### Compo
```python
class Compo(BaseModel):
    name = CharField(max_length=255)
    description = TextField()
    created_by = ForeignKey(User, on_delete=CASCADE)
    # created, modified
```

#### HasCompo
```python
class HasCompo(BaseModel):
    edition = ForeignKey(Edition, on_delete=CASCADE)
    compo = ForeignKey(Compo, on_delete=CASCADE)
    start = DateTimeField()
    show_authors_on_slide = BooleanField(default=True)
    open_to_upload = BooleanField(default=False)
    open_to_update = BooleanField(default=False)
    created_by = ForeignKey(User, on_delete=CASCADE)
    # created, modified
```

#### Production
```python
class Production(BaseModel):
    title = CharField(max_length=255)
    authors = CharField(max_length=255)
    description = TextField()
    uploaded_by = ForeignKey(User, on_delete=CASCADE)
    edition = ForeignKey(Edition, on_delete=CASCADE)
    compo = ForeignKey(Compo, on_delete=CASCADE)
    files = ManyToManyField(File)
    # created, modified
```

#### File
```python
class File(BaseModel):
    title = CharField(max_length=255)
    description = TextField()
    uploaded_by = ForeignKey(User, on_delete=CASCADE)
    original_filename = CharField(max_length=255, editable=False)
    file = FileField(upload_to=production_file_upload_to)
    public = BooleanField(default=False)
    is_active = BooleanField(default=True)
    is_deleted = BooleanField(default=False)
    # created, modified
```

### 5.2 Nuevos Modelos Requeridos

#### News (Noticias)
```python
class News(BaseModel):
    """Noticias sobre el evento para la landing page"""
    title = CharField(max_length=255, verbose_name="Título")
    slug = SlugField(unique=True, blank=True)
    summary = TextField(max_length=500, verbose_name="Resumen")
    content = TextField(verbose_name="Contenido completo")
    featured_image = ImageField(
        upload_to='news/images/',
        blank=True,
        null=True,
        verbose_name="Imagen destacada"
    )
    author = ForeignKey(User, on_delete=SET_NULL, null=True)
    published_at = DateTimeField(null=True, blank=True)
    is_published = BooleanField(default=False)
    is_featured = BooleanField(default=False)  # Destacar en portada
    views = PositiveIntegerField(default=0)
    category = CharField(
        max_length=50,
        choices=[
            ('general', 'General'),
            ('competition', 'Competición'),
            ('artist', 'Artista'),
            ('venue', 'Venue'),
        ],
        default='general'
    )
    # created, modified (from BaseModel)

    class Meta:
        verbose_name = "Noticia"
        verbose_name_plural = "Noticias"
        ordering = ['-published_at', '-created']

    def __str__(self):
        return self.title

    def save(self, *args, **kwargs):
        if not self.slug:
            self.slug = slugify(self.title)
        if self.is_published and not self.published_at:
            self.published_at = timezone.now()
        super().save(*args, **kwargs)
```

#### GalleryImage (Galería de Fotos)
```python
class GalleryImage(BaseModel):
    """Fotos de ediciones anteriores para mostrar en landing"""
    title = CharField(max_length=255, verbose_name="Título")
    description = TextField(blank=True, verbose_name="Descripción")
    image = ImageField(
        upload_to='gallery/images/%Y/',
        verbose_name="Imagen"
    )
    thumbnail = ImageField(
        upload_to='gallery/thumbnails/%Y/',
        blank=True,
        null=True,
        editable=False,
        verbose_name="Miniatura"
    )
    edition = ForeignKey(
        Edition,
        on_delete=CASCADE,
        related_name='gallery_images',
        verbose_name="Edición"
    )
    photographer = CharField(
        max_length=255,
        blank=True,
        verbose_name="Fotógrafo"
    )
    uploaded_by = ForeignKey(User, on_delete=SET_NULL, null=True)
    is_featured = BooleanField(default=False)  # Destacar en portada
    display_order = PositiveIntegerField(default=0)
    # created, modified

    class Meta:
        verbose_name = "Foto de Galería"
        verbose_name_plural = "Galería de Fotos"
        ordering = ['edition', 'display_order', '-created']

    def __str__(self):
        return f"{self.title} - {self.edition}"

    def save(self, *args, **kwargs):
        super().save(*args, **kwargs)
        # TODO: Generar thumbnail automático
```

#### SiteSettings (Configuración del Sitio)
```python
class SiteSettings(models.Model):
    """Configuración única del sitio (Singleton pattern)"""

    # Información general
    site_title = CharField(
        max_length=255,
        default="Demo Party Management System",
        verbose_name="Título del sitio"
    )
    site_description = TextField(
        default="Sistema de gestión de demo parties",
        verbose_name="Descripción"
    )
    site_logo = ImageField(
        upload_to='site/',
        blank=True,
        null=True,
        verbose_name="Logo"
    )

    # Próximo evento
    next_edition = ForeignKey(
        Edition,
        on_delete=SET_NULL,
        null=True,
        blank=True,
        related_name='as_next_edition',
        verbose_name="Próxima edición"
    )
    event_date_start = DateTimeField(
        null=True,
        blank=True,
        verbose_name="Fecha inicio evento"
    )
    event_date_end = DateTimeField(
        null=True,
        blank=True,
        verbose_name="Fecha fin evento"
    )

    # Ubicación
    venue_name = CharField(max_length=255, blank=True, verbose_name="Nombre del venue")
    venue_address = TextField(blank=True, verbose_name="Dirección completa")
    venue_city = CharField(max_length=100, blank=True, verbose_name="Ciudad")
    venue_country = CharField(max_length=100, blank=True, verbose_name="País")
    venue_map_embed = TextField(
        blank=True,
        verbose_name="Código embed del mapa",
        help_text="Código iframe de Google Maps u otro"
    )
    venue_latitude = DecimalField(
        max_digits=9,
        decimal_places=6,
        null=True,
        blank=True
    )
    venue_longitude = DecimalField(
        max_digits=9,
        decimal_places=6,
        null=True,
        blank=True
    )

    # Información de cómo llegar
    transport_info = TextField(
        blank=True,
        verbose_name="Información de transporte"
    )
    parking_info = TextField(
        blank=True,
        verbose_name="Información de parking"
    )
    accommodation_info = TextField(
        blank=True,
        verbose_name="Información de alojamiento"
    )

    # Redes sociales
    facebook_url = URLField(blank=True)
    twitter_url = URLField(blank=True)
    instagram_url = URLField(blank=True)
    youtube_url = URLField(blank=True)
    discord_url = URLField(blank=True)

    # Contacto
    contact_email = EmailField(blank=True, verbose_name="Email de contacto")
    contact_phone = CharField(max_length=50, blank=True, verbose_name="Teléfono")

    # Banner/anuncio
    announcement_enabled = BooleanField(default=False)
    announcement_text = TextField(blank=True, verbose_name="Texto del anuncio")
    announcement_type = CharField(
        max_length=20,
        choices=[
            ('info', 'Información'),
            ('warning', 'Advertencia'),
            ('success', 'Éxito'),
            ('danger', 'Peligro'),
        ],
        default='info'
    )

    # Secciones visibles
    show_news = BooleanField(default=True, verbose_name="Mostrar noticias")
    show_gallery = BooleanField(default=True, verbose_name="Mostrar galería")
    show_countdown = BooleanField(default=True, verbose_name="Mostrar contador")

    # Timestamps
    updated_at = DateTimeField(auto_now=True)
    updated_by = ForeignKey(
        User,
        on_delete=SET_NULL,
        null=True,
        blank=True
    )

    class Meta:
        verbose_name = "Configuración del Sitio"
        verbose_name_plural = "Configuración del Sitio"

    def __str__(self):
        return "Configuración del Sitio"

    def save(self, *args, **kwargs):
        # Singleton pattern - solo una instancia
        self.pk = 1
        super().save(*args, **kwargs)

    @classmethod
    def load(cls):
        """Obtener o crear la única instancia"""
        obj, created = cls.objects.get_or_create(pk=1)
        return obj
```

#### Vote (Sistema de Votación)
```python
class Vote(BaseModel):
    """Votos de usuarios en producciones"""
    user = ForeignKey(
        User,
        on_delete=CASCADE,
        related_name='votes',
        verbose_name="Usuario"
    )
    production = ForeignKey(
        Production,
        on_delete=CASCADE,
        related_name='votes',
        verbose_name="Producción"
    )
    score = PositiveIntegerField(
        validators=[MinValueValidator(1), MaxValueValidator(10)],
        verbose_name="Puntuación"
    )
    comment = TextField(
        blank=True,
        max_length=500,
        verbose_name="Comentario"
    )
    # created, modified

    class Meta:
        verbose_name = "Voto"
        verbose_name_plural = "Votos"
        unique_together = [['user', 'production']]
        ordering = ['-created']

    def __str__(self):
        return f"{self.user.email} → {self.production.title}: {self.score}/10"

    def clean(self):
        # Validar que la votación esté abierta
        edition = self.production.edition
        # TODO: Validar período de votación
        pass
```

#### VotingPeriod (Período de Votación)
```python
class VotingPeriod(BaseModel):
    """Define cuándo se puede votar para una edición"""
    edition = ForeignKey(
        Edition,
        on_delete=CASCADE,
        related_name='voting_periods',
        verbose_name="Edición"
    )
    compo = ForeignKey(
        Compo,
        on_delete=CASCADE,
        null=True,
        blank=True,
        related_name='voting_periods',
        verbose_name="Competición",
        help_text="Dejar vacío para aplicar a todas las compos"
    )
    start_date = DateTimeField(verbose_name="Inicio de votación")
    end_date = DateTimeField(verbose_name="Fin de votación")
    is_active = BooleanField(default=True)
    # created, modified

    class Meta:
        verbose_name = "Período de Votación"
        verbose_name_plural = "Períodos de Votación"
        ordering = ['-start_date']

    def __str__(self):
        compo_name = self.compo.name if self.compo else "Todas las compos"
        return f"{self.edition.title} - {compo_name}"

    def is_open(self):
        """Verifica si la votación está abierta ahora"""
        now = timezone.now()
        return self.is_active and self.start_date <= now <= self.end_date
```

### 5.3 Modificaciones a Modelos Existentes

#### Edition (añadir campos)
```python
class Edition(BaseModel):
    # ... campos existentes ...

    # NUEVOS CAMPOS para landing page
    logo = ImageField(
        upload_to='editions/logos/',
        blank=True,
        null=True,
        verbose_name="Logo de la edición"
    )
    banner_image = ImageField(
        upload_to='editions/banners/',
        blank=True,
        null=True,
        verbose_name="Imagen de banner"
    )
    start_date = DateTimeField(
        null=True,
        blank=True,
        verbose_name="Fecha de inicio"
    )
    end_date = DateTimeField(
        null=True,
        blank=True,
        verbose_name="Fecha de fin"
    )
    location = CharField(
        max_length=255,
        blank=True,
        verbose_name="Ubicación"
    )
    is_featured = BooleanField(
        default=False,
        verbose_name="Edición destacada"
    )
    slug = SlugField(unique=True, blank=True)
```

#### Compo (añadir campos)
```python
class Compo(BaseModel):
    # ... campos existentes ...

    # NUEVOS CAMPOS
    rules = TextField(
        blank=True,
        verbose_name="Reglas de la competición"
    )
    icon = CharField(
        max_length=50,
        blank=True,
        help_text="Nombre del icono Material-UI"
    )
    display_order = PositiveIntegerField(default=0)
```

---

## 6. Roles y Permisos

### 6.1 Visitante Anónimo

**Puede hacer**:
- Ver landing page completa
- Leer noticias
- Ver galería de fotos
- Ver información de la próxima edición
- Ver competiciones y reglas
- Ver producciones públicas (si están configuradas)
- Acceder a login/registro

**NO puede hacer**:
- Enviar producciones
- Votar
- Acceder a la aplicación React
- Ver datos privados

### 6.2 Usuario Participante (DPMS Users)

**Puede hacer**:
- Todo lo de Visitante Anónimo
- Acceder a `/app/*` (React SPA)
- Ver su dashboard personal
- Gestionar su perfil
- Enviar producciones a competiciones abiertas
- Editar/eliminar sus propias producciones
- Votar en producciones (durante período de votación)
- Ver resultados de votaciones
- Subir archivos asociados a sus producciones
- Ver historial de sus participaciones

**NO puede hacer**:
- Crear/editar ediciones
- Crear/editar competiciones
- Gestionar otros usuarios
- Ver votos de otros usuarios
- Modificar producciones de otros
- Acceder al panel de administración
- Publicar noticias
- Gestionar galería

### 6.3 Administrador DPMS (DPMS Admins)

**Puede hacer**:
- Todo lo de Usuario Participante
- Acceder a `/app/admin/*`
- **Gestión de Ediciones**:
  - Crear, editar, eliminar ediciones
  - Configurar fechas y ubicación
  - Activar/desactivar ediciones
  - Configurar períodos de envío
- **Gestión de Competiciones**:
  - Crear, editar, eliminar compos
  - Configurar reglas y restricciones
  - Asociar compos a ediciones (HasCompo)
  - Configurar plazos de envío por compo
  - Configurar visibilidad de autores
- **Gestión de Producciones**:
  - Ver todas las producciones
  - Editar cualquier producción
  - Eliminar producciones
  - Aprobar/rechazar producciones
  - Gestionar archivos asociados
- **Gestión de Usuarios**:
  - Ver lista de usuarios
  - Buscar y filtrar usuarios
  - Ver perfiles completos
  - Activar/desactivar usuarios
  - Asignar roles y grupos
  - Ver producciones de cada usuario
  - Ver votos de cada usuario
- **Gestión de Contenido (Landing)**:
  - Crear, editar, eliminar noticias
  - Publicar/despublicar noticias
  - Gestionar galería de fotos
  - Subir múltiples fotos
  - Asociar fotos a ediciones
  - Configurar fotos destacadas
- **Configuración del Sitio**:
  - Editar configuración general
  - Configurar próxima edición
  - Gestionar información de venue
  - Configurar redes sociales
  - Activar/desactivar secciones
  - Configurar anuncios/banners
- **Gestión de Votaciones**:
  - Configurar períodos de votación
  - Ver resultados en tiempo real
  - Exportar resultados
  - Validar votos
  - Ver estadísticas
- **Acceso al Django Admin**:
  - Acceso completo a `/admin/`
  - Gestión directa de la base de datos

**Permisos específicos en Django**:
```python
# Group: DPMS Admins
permissions = [
    'add_edition', 'change_edition', 'delete_edition', 'view_edition',
    'add_compo', 'change_compo', 'delete_compo', 'view_compo',
    'add_hascompo', 'change_hascompo', 'delete_hascompo', 'view_hascompo',
    'add_production', 'change_production', 'delete_production', 'view_production',
    'add_file', 'change_file', 'delete_file', 'view_file',
    'add_news', 'change_news', 'delete_news', 'view_news',
    'add_galleryimage', 'change_galleryimage', 'delete_galleryimage', 'view_galleryimage',
    'add_vote', 'change_vote', 'delete_vote', 'view_vote',
    'change_sitesettings', 'view_sitesettings',
    'view_user', 'change_user',
    'view_profile', 'change_profile',
]
```

---

## 7. Especificación de APIs

### 7.1 APIs Existentes (Implementadas)

#### Users API

**POST** `/api/users/signup/`
- **Permisos**: AllowAny
- **Body**:
  ```json
  {
    "email": "user@example.com",
    "username": "username",
    "password": "securepass123",
    "password_confirmation": "securepass123",
    "first_name": "John",
    "last_name": "Doe",
    "nickname": "JD",
    "group": "DemoGroup"
  }
  ```
- **Response**: `201 Created`
  ```json
  {
    "email": "user@example.com",
    "first_name": "John",
    "last_name": "Doe",
    "profile": {
      "nickname": "JD",
      "group": "DemoGroup",
      "extra_information": "",
      "avatar": null,
      "visit_listing": false
    },
    "groups": ["DPMS Users"]
  }
  ```

**POST** `/api/users/login/`
- **Permisos**: AllowAny
- **Body**:
  ```json
  {
    "email": "user@example.com",
    "password": "securepass123"
  }
  ```
- **Response**: `202 Accepted`
  ```json
  {
    "user": { ... },
    "access_token": "drf_token_here",
    "jwt_access_token": "jwt_token_here",
    "groups": ["DPMS Users"]
  }
  ```

**GET** `/api/users/verify/?token=<jwt>`
- **Permisos**: AllowAny
- **Response**: `200 OK`

**GET** `/api/users/<email>/`
- **Permisos**: IsAuthenticated + IsAccountOwner
- **Response**: `200 OK` + user data + fresh JWT

**PUT/PATCH** `/api/users/<email>/profile/`
- **Permisos**: IsAuthenticated + IsAccountOwner
- **Body**: Campos de Profile
- **Response**: `200 OK` + updated user data

### 7.2 APIs a Implementar

#### Editions API

**GET** `/api/editions/`
- **Permisos**: AllowAny (solo públicas), IsAuthenticated (todas)
- **Query params**:
  - `public=true` - Solo ediciones públicas
  - `upcoming=true` - Solo próximas ediciones
  - `past=true` - Solo ediciones pasadas
- **Response**: Lista de ediciones

**GET** `/api/editions/<id>/`
- **Permisos**: AllowAny (si pública), IsAuthenticated
- **Response**: Detalle de edición + compos asociadas

**POST** `/api/editions/`
- **Permisos**: IsAdminUser
- **Body**: Campos de Edition
- **Response**: `201 Created`

**PUT/PATCH** `/api/editions/<id>/`
- **Permisos**: IsAdminUser
- **Response**: `200 OK`

**DELETE** `/api/editions/<id>/`
- **Permisos**: IsAdminUser
- **Response**: `204 No Content`

**GET** `/api/editions/<id>/compos/`
- **Permisos**: AllowAny
- **Response**: Lista de compos de la edición

**GET** `/api/editions/<id>/productions/`
- **Permisos**: AllowAny (si públicas), IsAuthenticated
- **Response**: Lista de producciones de la edición

**GET** `/api/editions/<id>/results/`
- **Permisos**: AllowAny (si votación cerrada)
- **Response**: Resultados de votación por compo

#### Compos API

**GET** `/api/compos/`
- **Permisos**: AllowAny
- **Response**: Lista de tipos de competiciones

**GET** `/api/compos/<id>/`
- **Permisos**: AllowAny
- **Response**: Detalle de compo + reglas

**POST** `/api/compos/`
- **Permisos**: IsAdminUser
- **Body**: Campos de Compo
- **Response**: `201 Created`

**PUT/PATCH** `/api/compos/<id>/`
- **Permisos**: IsAdminUser
- **Response**: `200 OK`

**DELETE** `/api/compos/<id>/`
- **Permisos**: IsAdminUser
- **Response**: `204 No Content`

#### Productions API

**GET** `/api/productions/`
- **Permisos**: IsAuthenticated
- **Query params**:
  - `edition=<id>`
  - `compo=<id>`
  - `my_productions=true` - Solo del usuario actual
- **Response**: Lista de producciones

**GET** `/api/productions/<id>/`
- **Permisos**: IsAuthenticated
- **Response**: Detalle de producción + archivos

**POST** `/api/productions/`
- **Permisos**: IsAuthenticated
- **Body**:
  ```json
  {
    "title": "My Demo",
    "authors": "DemoGroup",
    "description": "Description here",
    "edition": 1,
    "compo": 2,
    "files": [1, 2]  // IDs de archivos ya subidos
  }
  ```
- **Response**: `201 Created`

**PUT/PATCH** `/api/productions/<id>/`
- **Permisos**: IsOwner OR IsAdminUser
- **Response**: `200 OK`

**DELETE** `/api/productions/<id>/`
- **Permisos**: IsOwner OR IsAdminUser
- **Response**: `204 No Content`

#### Files API

**POST** `/api/files/upload/`
- **Permisos**: IsAuthenticated
- **Body**: `multipart/form-data` con archivo
- **Response**: `201 Created`
  ```json
  {
    "id": 1,
    "title": "demo.zip",
    "original_filename": "demo.zip",
    "file": "/media/files/edition/compo/demo_uuid.zip",
    "uploaded_by": "user@example.com"
  }
  ```

**GET** `/api/files/<id>/download/`
- **Permisos**: IsAuthenticated (si privado), AllowAny (si público)
- **Response**: File download

**DELETE** `/api/files/<id>/`
- **Permisos**: IsOwner OR IsAdminUser
- **Response**: `204 No Content`

#### News API

**GET** `/api/news/`
- **Permisos**: AllowAny
- **Query params**:
  - `is_published=true`
  - `is_featured=true`
  - `category=<category>`
  - `page=<number>`
  - `page_size=<number>`
- **Response**: Lista paginada de noticias

**GET** `/api/news/<slug>/`
- **Permisos**: AllowAny
- **Response**: Detalle de noticia
- **Side effect**: Incrementa views

**POST** `/api/news/`
- **Permisos**: IsAdminUser
- **Body**: Campos de News
- **Response**: `201 Created`

**PUT/PATCH** `/api/news/<slug>/`
- **Permisos**: IsAdminUser
- **Response**: `200 OK`

**DELETE** `/api/news/<slug>/`
- **Permisos**: IsAdminUser
- **Response**: `204 No Content`

#### Gallery API

**GET** `/api/gallery/`
- **Permisos**: AllowAny
- **Query params**:
  - `edition=<id>`
  - `is_featured=true`
- **Response**: Lista de imágenes

**POST** `/api/gallery/upload/`
- **Permisos**: IsAdminUser
- **Body**: `multipart/form-data` con imagen(es)
- **Response**: `201 Created`

**PUT/PATCH** `/api/gallery/<id>/`
- **Permisos**: IsAdminUser
- **Response**: `200 OK`

**DELETE** `/api/gallery/<id>/`
- **Permisos**: IsAdminUser
- **Response**: `204 No Content`

#### Votes API

**GET** `/api/votes/`
- **Permisos**: IsAuthenticated
- **Query params**:
  - `my_votes=true` - Solo votos del usuario
  - `production=<id>`
- **Response**: Lista de votos (solo propios si no es admin)

**POST** `/api/votes/`
- **Permisos**: IsAuthenticated
- **Body**:
  ```json
  {
    "production": 1,
    "score": 8,
    "comment": "Great work!"
  }
  ```
- **Validations**:
  - Verificar que votación esté abierta
  - Verificar que no haya votado ya
  - Verificar que score esté entre 1-10
- **Response**: `201 Created`

**PUT/PATCH** `/api/votes/<id>/`
- **Permisos**: IsOwner (si votación aún abierta)
- **Response**: `200 OK`

**DELETE** `/api/votes/<id>/`
- **Permisos**: IsOwner (si votación aún abierta)
- **Response**: `204 No Content`

**GET** `/api/votes/results/<edition_id>/`
- **Permisos**: AllowAny (si votación cerrada)
- **Response**: Resultados agrupados por compo
  ```json
  {
    "edition": "Posadas Party 2025",
    "compos": [
      {
        "compo": "Demo",
        "productions": [
          {
            "position": 1,
            "production": "Best Demo",
            "authors": "DemoGroup",
            "score": 9.2,
            "votes_count": 45
          }
        ]
      }
    ]
  }
  ```

#### Site Settings API

**GET** `/api/site-settings/`
- **Permisos**: AllowAny
- **Response**: Configuración completa del sitio

**PUT/PATCH** `/api/site-settings/`
- **Permisos**: IsAdminUser
- **Body**: Campos de SiteSettings
- **Response**: `200 OK`

---

## 8. Frontend - Componentes y Páginas

### 8.1 Landing Page (Django Templates)

#### Estructura de Archivos
```
backend/dpms/landing/
├── templates/
│   ├── landing/
│   │   ├── base.html                 # Base template con SEO
│   │   ├── index.html                # Página principal
│   │   ├── news_list.html            # Lista de noticias
│   │   ├── news_detail.html          # Detalle de noticia
│   │   ├── gallery.html              # Galería completa
│   │   └── partials/
│   │       ├── header.html
│   │       ├── hero.html
│   │       ├── news_section.html
│   │       ├── gallery_section.html
│   │       ├── countdown.html
│   │       └── footer.html
├── static/
│   ├── landing/
│   │   ├── css/
│   │   │   ├── main.css
│   │   │   └── responsive.css
│   │   ├── js/
│   │   │   ├── countdown.js
│   │   │   ├── gallery.js
│   │   │   └── main.js
│   │   └── images/
│   │       └── (logos, backgrounds, etc.)
├── views.py
├── urls.py
└── context_processors.py
```

#### Vistas Django Requeridas
```python
# views.py
from django.views.generic import TemplateView, ListView, DetailView
from .models import News, GalleryImage, Edition, SiteSettings

class LandingPageView(TemplateView):
    template_name = 'landing/index.html'

    def get_context_data(self, **kwargs):
        context = super().get_context_data(**kwargs)
        settings = SiteSettings.load()

        context.update({
            'settings': settings,
            'latest_news': News.objects.filter(
                is_published=True
            ).order_by('-published_at')[:5],
            'featured_images': GalleryImage.objects.filter(
                is_featured=True
            )[:6],
            'next_edition': settings.next_edition,
        })
        return context

class NewsListView(ListView):
    model = News
    template_name = 'landing/news_list.html'
    context_object_name = 'news_list'
    paginate_by = 10
    queryset = News.objects.filter(is_published=True)

class NewsDetailView(DetailView):
    model = News
    template_name = 'landing/news_detail.html'
    context_object_name = 'news'
    slug_field = 'slug'

    def get_queryset(self):
        return News.objects.filter(is_published=True)

    def get_object(self, queryset=None):
        obj = super().get_object(queryset)
        # Incrementar vistas
        obj.views += 1
        obj.save(update_fields=['views'])
        return obj

class GalleryView(ListView):
    model = GalleryImage
    template_name = 'landing/gallery.html'
    context_object_name = 'images'

    def get_queryset(self):
        qs = GalleryImage.objects.all()
        edition_id = self.request.GET.get('edition')
        if edition_id:
            qs = qs.filter(edition_id=edition_id)
        return qs
```

#### Templates Principales

**base.html** - Template base con SEO
```django
<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">

    {% block seo %}
    <title>{% block title %}{{ settings.site_title }}{% endblock %}</title>
    <meta name="description" content="{% block description %}{{ settings.site_description }}{% endblock %}">

    <!-- Open Graph -->
    <meta property="og:title" content="{% block og_title %}{{ settings.site_title }}{% endblock %}">
    <meta property="og:description" content="{% block og_description %}{{ settings.site_description }}{% endblock %}">
    <meta property="og:image" content="{% block og_image %}{{ settings.site_logo.url }}{% endblock %}">
    <meta property="og:type" content="website">
    <meta property="og:url" content="{{ request.build_absolute_uri }}">

    <!-- Twitter Card -->
    <meta name="twitter:card" content="summary_large_image">
    <meta name="twitter:title" content="{% block twitter_title %}{{ settings.site_title }}{% endblock %}">
    <meta name="twitter:description" content="{% block twitter_description %}{{ settings.site_description }}{% endblock %}">
    <meta name="twitter:image" content="{% block twitter_image %}{{ settings.site_logo.url }}{% endblock %}">

    <!-- Schema.org markup for Google -->
    {% block schema %}
    <script type="application/ld+json">
    {
      "@context": "https://schema.org",
      "@type": "Event",
      "name": "{{ settings.site_title }}",
      "description": "{{ settings.site_description }}",
      "startDate": "{{ settings.event_date_start|date:'c' }}",
      "endDate": "{{ settings.event_date_end|date:'c' }}",
      "location": {
        "@type": "Place",
        "name": "{{ settings.venue_name }}",
        "address": {
          "@type": "PostalAddress",
          "streetAddress": "{{ settings.venue_address }}",
          "addressLocality": "{{ settings.venue_city }}",
          "addressCountry": "{{ settings.venue_country }}"
        }
      }
    }
    </script>
    {% endblock %}
    {% endblock seo %}

    <!-- CSS -->
    <link rel="stylesheet" href="{% static 'landing/css/main.css' %}">
    {% block extra_css %}{% endblock %}
</head>
<body>
    {% include 'landing/partials/header.html' %}

    {% if settings.announcement_enabled %}
    <div class="announcement announcement-{{ settings.announcement_type }}">
        {{ settings.announcement_text }}
    </div>
    {% endif %}

    <main>
        {% block content %}{% endblock %}
    </main>

    {% include 'landing/partials/footer.html' %}

    <!-- JS -->
    <script src="{% static 'landing/js/main.js' %}"></script>
    {% block extra_js %}{% endblock %}
</body>
</html>
```

**index.html** - Página principal
```django
{% extends 'landing/base.html' %}
{% load static %}

{% block content %}
<!-- Hero Section -->
{% include 'landing/partials/hero.html' %}

<!-- Countdown -->
{% if settings.show_countdown and settings.event_date_start %}
{% include 'landing/partials/countdown.html' %}
{% endif %}

<!-- News Section -->
{% if settings.show_news %}
{% include 'landing/partials/news_section.html' %}
{% endif %}

<!-- Next Edition Info -->
{% if next_edition %}
<section class="next-edition">
    <div class="container">
        <h2>Próxima Edición</h2>
        <div class="edition-info">
            <h3>{{ next_edition.title }}</h3>
            <p>{{ next_edition.description }}</p>
            <div class="edition-details">
                <div class="detail">
                    <strong>Fecha:</strong>
                    {{ settings.event_date_start|date:"d/m/Y" }} -
                    {{ settings.event_date_end|date:"d/m/Y" }}
                </div>
                <div class="detail">
                    <strong>Lugar:</strong>
                    {{ settings.venue_name }}, {{ settings.venue_city }}
                </div>
            </div>

            <!-- Compos disponibles -->
            <h4>Competiciones</h4>
            <div class="compos-grid">
                {% for hascompo in next_edition.hascompo_set.all %}
                <div class="compo-card">
                    <h5>{{ hascompo.compo.name }}</h5>
                    <p>{{ hascompo.compo.description|truncatewords:20 }}</p>
                </div>
                {% endfor %}
            </div>

            <a href="/app/signup" class="btn btn-primary">¡Participa ahora!</a>
        </div>
    </div>
</section>
{% endif %}

<!-- Como Llegar -->
<section class="venue-info">
    <div class="container">
        <h2>¿Cómo llegar?</h2>
        <div class="venue-grid">
            <div class="map">
                {{ settings.venue_map_embed|safe }}
            </div>
            <div class="info">
                <div class="info-block">
                    <h4>Dirección</h4>
                    <p>{{ settings.venue_address }}</p>
                </div>
                {% if settings.transport_info %}
                <div class="info-block">
                    <h4>Transporte Público</h4>
                    {{ settings.transport_info|linebreaks }}
                </div>
                {% endif %}
                {% if settings.parking_info %}
                <div class="info-block">
                    <h4>Parking</h4>
                    {{ settings.parking_info|linebreaks }}
                </div>
                {% endif %}
                {% if settings.accommodation_info %}
                <div class="info-block">
                    <h4>Alojamiento</h4>
                    {{ settings.accommodation_info|linebreaks }}
                </div>
                {% endif %}
            </div>
        </div>
    </div>
</section>

<!-- Gallery Section -->
{% if settings.show_gallery %}
{% include 'landing/partials/gallery_section.html' %}
{% endif %}

{% endblock %}

{% block extra_js %}
<script src="{% static 'landing/js/countdown.js' %}"></script>
<script>
    // Inicializar countdown
    initCountdown('{{ settings.event_date_start|date:"c" }}');
</script>
{% endblock %}
```

**partials/countdown.html**
```django
<section class="countdown-section">
    <div class="container">
        <h2>Cuenta Atrás</h2>
        <div id="countdown" class="countdown">
            <div class="countdown-item">
                <span class="countdown-value" id="days">0</span>
                <span class="countdown-label">Días</span>
            </div>
            <div class="countdown-item">
                <span class="countdown-value" id="hours">0</span>
                <span class="countdown-label">Horas</span>
            </div>
            <div class="countdown-item">
                <span class="countdown-value" id="minutes">0</span>
                <span class="countdown-label">Minutos</span>
            </div>
            <div class="countdown-item">
                <span class="countdown-value" id="seconds">0</span>
                <span class="countdown-label">Segundos</span>
            </div>
        </div>
    </div>
</section>
```

**static/landing/js/countdown.js**
```javascript
function initCountdown(targetDateISO) {
    const targetDate = new Date(targetDateISO);

    function updateCountdown() {
        const now = new Date();
        const diff = targetDate - now;

        if (diff <= 0) {
            document.getElementById('countdown').innerHTML =
                '<p class="countdown-ended">¡El evento ha comenzado!</p>';
            return;
        }

        const days = Math.floor(diff / (1000 * 60 * 60 * 24));
        const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((diff % (1000 * 60)) / 1000);

        document.getElementById('days').textContent = days;
        document.getElementById('hours').textContent = hours.toString().padStart(2, '0');
        document.getElementById('minutes').textContent = minutes.toString().padStart(2, '0');
        document.getElementById('seconds').textContent = seconds.toString().padStart(2, '0');
    }

    updateCountdown();
    setInterval(updateCountdown, 1000);
}
```

### 8.2 React SPA - Nuevos Componentes

#### Estructura de Directorios
```
frontend/src/
├── components/
│   ├── user/                          # (Ya existe)
│   │   ├── Login.js
│   │   ├── Signup.js
│   │   └── VerifyAccount.js
│   ├── admin/                         # NUEVO
│   │   ├── UsersManagement.js
│   │   ├── EditionsManagement.js
│   │   ├── ComposManagement.js
│   │   ├── ProductionsManagement.js
│   │   ├── NewsManagement.js
│   │   ├── GalleryManagement.js
│   │   ├── SiteSettingsManagement.js
│   │   └── VotingResults.js
│   ├── productions/                   # NUEVO
│   │   ├── ProductionsList.js
│   │   ├── ProductionDetail.js
│   │   ├── ProductionForm.js
│   │   ├── MyProductions.js
│   │   └── FileUpload.js
│   ├── voting/                        # NUEVO
│   │   ├── VotingPanel.js
│   │   ├── CompoVoting.js
│   │   ├── ProductionVoteCard.js
│   │   └── VotingResults.js
│   ├── profile/                       # NUEVO
│   │   ├── UserProfile.js
│   │   ├── EditProfile.js
│   │   └── MyVotes.js
│   └── common/                        # NUEVO
│       ├── DataTable.js
│       ├── ConfirmDialog.js
│       ├── FileUploader.js
│       └── ImageGallery.js
└── pages/                             # NUEVO
    ├── user/
    │   ├── DashboardPage.js
    │   ├── ProfilePage.js
    │   └── MyProductionsPage.js
    ├── admin/
    │   ├── AdminDashboardPage.js
    │   ├── UsersPage.js
    │   ├── EditionsPage.js
    │   ├── ComposPage.js
    │   ├── NewsPage.js
    │   ├── GalleryPage.js
    │   └── SettingsPage.js
    └── voting/
        ├── VotingPage.js
        └── ResultsPage.js
```

#### Nuevas Rutas
```javascript
// routes.js
const routes = [
  // Existentes
  { path: '/app/login', component: Login, isPrivate: false },
  { path: '/app/signup', component: Signup, isPrivate: false },
  { path: '/app/verify-account/:token', component: VerifyAccount, isPrivate: false },

  // Usuario
  { path: '/app/dashboard', component: DashboardPage, isPrivate: true },
  { path: '/app/profile', component: ProfilePage, isPrivate: true },
  { path: '/app/my-productions', component: MyProductionsPage, isPrivate: true },
  { path: '/app/productions', component: ProductionsListPage, isPrivate: true },
  { path: '/app/productions/:id', component: ProductionDetailPage, isPrivate: true },
  { path: '/app/productions/new', component: ProductionFormPage, isPrivate: true },

  // Votación
  { path: '/app/voting', component: VotingPage, isPrivate: true },
  { path: '/app/voting/:editionId', component: VotingPage, isPrivate: true },
  { path: '/app/results/:editionId', component: ResultsPage, isPrivate: true },

  // Admin
  { path: '/app/admin/dashboard', component: AdminDashboardPage, isPrivate: true, adminOnly: true },
  { path: '/app/admin/users', component: UsersPage, isPrivate: true, adminOnly: true },
  { path: '/app/admin/editions', component: EditionsPage, isPrivate: true, adminOnly: true },
  { path: '/app/admin/compos', component: ComposPage, isPrivate: true, adminOnly: true },
  { path: '/app/admin/news', component: NewsPage, isPrivate: true, adminOnly: true },
  { path: '/app/admin/gallery', component: GalleryPage, isPrivate: true, adminOnly: true },
  { path: '/app/admin/settings', component: SettingsPage, isPrivate: true, adminOnly: true },

  // Redirect
  { path: '/app', redirect: '/app/dashboard' },
  { path: '*', component: Error404 }
];
```

#### Componente AdminRoute
```javascript
// AdminRoute.js
import { Navigate } from 'react-router-dom';
import { useAuth } from './AuthContext';

const AdminRoute = ({ children }) => {
  const { isAuthenticated, groups, loading } = useAuth();

  if (loading) {
    return <div>Loading...</div>;
  }

  if (!isAuthenticated) {
    return <Navigate to="/app/login" replace />;
  }

  if (!groups.includes('DPMS Admins')) {
    return <Navigate to="/app/dashboard" replace />;
  }

  return children;
};

export default AdminRoute;
```

#### Ejemplo: ProductionForm.js
```javascript
import React, { useState, useEffect } from 'react';
import {
  Box,
  TextField,
  Button,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Typography,
  Alert,
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import axios from '../utils/AxiosWrapper';
import FileUpload from './FileUpload';

const ProductionForm = ({ productionId = null }) => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    title: '',
    authors: '',
    description: '',
    edition: '',
    compo: '',
    files: [],
  });
  const [editions, setEditions] = useState([]);
  const [compos, setCompos] = useState([]);
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchEditions();
  }, []);

  useEffect(() => {
    if (formData.edition) {
      fetchCompos(formData.edition);
    }
  }, [formData.edition]);

  useEffect(() => {
    if (productionId) {
      fetchProduction(productionId);
    }
  }, [productionId]);

  const fetchEditions = async () => {
    try {
      const response = await axios.get('/api/editions/?open_to_upload=true');
      setEditions(response.data.results || response.data);
    } catch (error) {
      console.error('Error fetching editions:', error);
    }
  };

  const fetchCompos = async (editionId) => {
    try {
      const response = await axios.get(`/api/editions/${editionId}/compos/`);
      setCompos(response.data);
    } catch (error) {
      console.error('Error fetching compos:', error);
    }
  };

  const fetchProduction = async (id) => {
    try {
      const response = await axios.get(`/api/productions/${id}/`);
      setFormData(response.data);
    } catch (error) {
      console.error('Error fetching production:', error);
    }
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleFilesUploaded = (fileIds) => {
    setFormData({
      ...formData,
      files: fileIds,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErrors({});

    try {
      if (productionId) {
        await axios.put(`/api/productions/${productionId}/`, formData);
      } else {
        await axios.post('/api/productions/', formData);
      }
      navigate('/app/my-productions');
    } catch (error) {
      if (error.response?.data) {
        setErrors(error.response.data);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box component="form" onSubmit={handleSubmit} sx={{ maxWidth: 800, mx: 'auto', p: 3 }}>
      <Typography variant="h4" gutterBottom>
        {productionId ? 'Editar Producción' : 'Enviar Producción'}
      </Typography>

      {errors.non_field_errors && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {errors.non_field_errors}
        </Alert>
      )}

      <FormControl fullWidth margin="normal">
        <InputLabel>Edición</InputLabel>
        <Select
          name="edition"
          value={formData.edition}
          onChange={handleChange}
          required
        >
          {editions.map((edition) => (
            <MenuItem key={edition.id} value={edition.id}>
              {edition.title}
            </MenuItem>
          ))}
        </Select>
      </FormControl>

      <FormControl fullWidth margin="normal">
        <InputLabel>Competición</InputLabel>
        <Select
          name="compo"
          value={formData.compo}
          onChange={handleChange}
          disabled={!formData.edition}
          required
        >
          {compos.map((compo) => (
            <MenuItem key={compo.id} value={compo.id}>
              {compo.name}
            </MenuItem>
          ))}
        </Select>
      </FormControl>

      <TextField
        fullWidth
        margin="normal"
        name="title"
        label="Título"
        value={formData.title}
        onChange={handleChange}
        error={!!errors.title}
        helperText={errors.title}
        required
      />

      <TextField
        fullWidth
        margin="normal"
        name="authors"
        label="Autores / Grupo"
        value={formData.authors}
        onChange={handleChange}
        error={!!errors.authors}
        helperText={errors.authors}
        required
      />

      <TextField
        fullWidth
        margin="normal"
        name="description"
        label="Descripción"
        value={formData.description}
        onChange={handleChange}
        multiline
        rows={4}
        error={!!errors.description}
        helperText={errors.description}
      />

      <Box sx={{ mt: 3 }}>
        <Typography variant="h6" gutterBottom>
          Archivos
        </Typography>
        <FileUpload
          onFilesUploaded={handleFilesUploaded}
          initialFiles={formData.files}
        />
      </Box>

      <Box sx={{ mt: 3, display: 'flex', gap: 2 }}>
        <Button
          type="submit"
          variant="contained"
          color="primary"
          disabled={loading}
        >
          {loading ? 'Guardando...' : 'Guardar'}
        </Button>
        <Button
          variant="outlined"
          onClick={() => navigate('/app/my-productions')}
        >
          Cancelar
        </Button>
      </Box>
    </Box>
  );
};

export default ProductionForm;
```

---

## 9. Plan de Implementación por Fases

### Fase 1: Landing Page y Contenido (SEO)
**Duración estimada**: 2-3 semanas

**Backend**:
- [x] Crear app Django `landing`
- [x] Implementar modelos: `News`, `GalleryImage`, `SiteSettings`
- [x] Modificar modelo `Edition` (añadir campos para landing)
- [x] Crear serializers para API pública (News, Gallery, Settings)
- [x] Implementar ViewSets con permisos adecuados
- [x] Crear vistas Django para templates
- [x] Configurar URLs
- [x] Añadir permisos a grupos
- [x] Configurar Django Admin para nuevos modelos

**Frontend Django**:
- [x] Crear templates base con SEO
- [x] Implementar página principal (index)
- [x] Sección de noticias
- [x] Sección de galería
- [x] Contador regresivo
- [x] Información de venue
- [x] Footer con redes sociales
- [x] CSS responsive
- [x] JavaScript para interactividad (countdown, lightbox)

**Testing**:
- [ ] Verificar renderizado server-side
- [ ] Probar SEO con herramientas (Google Search Console)
- [ ] Validar meta tags
- [ ] Probar responsividad

### Fase 2: API de Competiciones y Producciones
**Duración estimada**: 2-3 semanas

**Backend**:
- [x] Crear serializers para `Edition`, `Compo`, `HasCompo`, `Production`, `File`
- [x] Implementar ViewSets completos (CRUD)
- [x] Añadir endpoints específicos:
  - `/api/editions/<id>/compos/`
  - `/api/editions/<id>/productions/`
  - `/api/files/upload/`
  - `/api/files/<id>/download/`
- [x] Implementar permisos personalizados (IsOwner)
- [x] Validaciones de negocio:
  - Verificar plazos de envío
  - Verificar edición abierta
  - Limitar archivos por tamaño
- [x] Configurar URLs

**Testing**:
- [ ] Tests unitarios de serializers
- [ ] Tests de endpoints (pytest)
- [ ] Tests de permisos
- [ ] Tests de validaciones

### Fase 3: Frontend React - Gestión de Producciones
**Duración estimada**: 2-3 semanas

**Frontend**:
- [x] Implementar `ProductionsList.js`
- [x] Implementar `ProductionForm.js` (crear/editar)
- [x] Implementar `MyProductions.js`
- [x] Implementar `FileUpload.js` (componente reutilizable)
- [x] Implementar `ProductionDetail.js`
- [x] Añadir rutas
- [x] Actualizar navegación
- [x] Integrar con API

**Testing**:
- [ ] Tests de componentes (Jest + RTL)
- [ ] Tests de integración con API (mock)
- [ ] Tests E2E (Cypress o Playwright)

### Fase 4: Sistema de Votación
**Duración estimada**: 2-3 semanas

**Backend**:
- [x] Crear modelos `Vote`, `VotingPeriod`
- [x] Crear serializers
- [x] Implementar ViewSet de votos con validaciones:
  - Un voto por usuario por producción
  - Verificar período de votación abierto
  - Score entre 1-10
- [x] Endpoint de resultados con agregación
- [x] Configurar permisos

**Frontend**:
- [x] Implementar `VotingPanel.js`
- [x] Implementar `CompoVoting.js` (listar producciones por compo)
- [x] Implementar `ProductionVoteCard.js` (tarjeta con slider de voto)
- [x] Implementar `VotingResults.js` (resultados finales)
- [x] Añadir rutas y navegación

**Testing**:
- [ ] Tests de validaciones de voto
- [ ] Tests de cálculo de resultados
- [ ] Tests de UI de votación

### Fase 5: Panel de Administración
**Duración estimada**: 3-4 semanas

**Frontend Admin**:
- [x] Implementar `UsersManagement.js`:
  - Tabla con búsqueda y filtros
  - Ver detalle de usuario
  - Activar/desactivar usuarios
  - Asignar grupos
- [x] Implementar `EditionsManagement.js`:
  - CRUD completo de ediciones
  - Configurar compos asociadas
  - Configurar plazos
- [x] Implementar `ComposManagement.js`:
  - CRUD de tipos de competiciones
  - Editar reglas
- [x] Implementar `ProductionsManagement.js`:
  - Ver todas las producciones
  - Filtrar por edición/compo
  - Aprobar/rechazar (si se implementa moderación)
- [x] Implementar `NewsManagement.js`:
  - CRUD de noticias
  - Editor rich text (TinyMCE o similar)
  - Vista previa
- [x] Implementar `GalleryManagement.js`:
  - Upload masivo de fotos
  - Arrastrar y soltar orden
  - Asociar a ediciones
- [x] Implementar `SiteSettingsManagement.js`:
  - Formulario de configuración general
  - Vista previa de landing
- [x] Implementar `VotingResults.js`:
  - Dashboard de resultados en tiempo real
  - Gráficos (Chart.js o similar)
  - Exportar a CSV/PDF

**Componentes Reutilizables**:
- [x] `DataTable.js` (tabla genérica con paginación, ordenación, filtros)
- [x] `ConfirmDialog.js` (diálogo de confirmación)
- [x] `ImageGallery.js` (gestión de galería de imágenes)
- [x] `RichTextEditor.js` (editor WYSIWYG)

**Testing**:
- [ ] Tests de cada página admin
- [ ] Tests de permisos (solo admin puede acceder)

### Fase 6: Perfil de Usuario
**Duración estimada**: 1 semana

**Frontend**:
- [x] Implementar `UserProfile.js` (vista del perfil)
- [x] Implementar `EditProfile.js` (editar perfil, avatar, etc.)
- [x] Implementar `MyVotes.js` (historial de votos)
- [x] Añadir rutas y navegación

**Testing**:
- [ ] Tests de actualización de perfil
- [ ] Tests de subida de avatar

### Fase 7: Optimización y Pulido
**Duración estimada**: 1-2 semanas

- [ ] Optimización de queries (select_related, prefetch_related)
- [ ] Añadir caché (Redis) para landing page
- [ ] Optimizar imágenes (thumbnails automáticos)
- [ ] Añadir paginación donde falte
- [ ] Mejorar mensajes de error
- [ ] Añadir loading states
- [ ] Añadir animaciones
- [ ] Revisar accesibilidad (a11y)
- [ ] Auditoría de seguridad
- [ ] Documentación API (Swagger completo)
- [ ] README actualizado

### Fase 8: Testing Final y Deployment
**Duración estimada**: 1-2 semanas

- [ ] Tests de integración completos
- [ ] Tests E2E de flujos críticos:
  - Registro → Verificación → Login → Enviar producción → Votar
  - Admin: Crear edición → Configurar compos → Gestionar producciones
- [ ] Performance testing
- [ ] Security testing (OWASP Top 10)
- [ ] Configurar CI/CD
- [ ] Preparar producción:
  - Configurar Caddy
  - Configurar backups automáticos
  - Monitoreo (Sentry, logs)
- [ ] Deploy a producción
- [ ] Smoke tests en producción

**Total estimado**: 15-20 semanas (~4-5 meses)

---

## 10. Consideraciones Técnicas

### 10.1 SEO y Performance

**Landing Page**:
- HTML semántico correcto
- Meta tags completos (title, description, OG, Twitter Card)
- Schema.org markup para eventos
- Sitemap.xml automático
- Robots.txt
- Lazy loading de imágenes
- Minificación de CSS/JS
- Caché de páginas estáticas (Redis/Varnish)

**Imágenes**:
- Generar thumbnails automáticamente (Pillow)
- Formatos optimizados (WebP con fallback)
- Lazy loading
- CDN para media files (opcional)

### 10.2 Seguridad

**Autenticación**:
- HTTPS obligatorio en producción
- Tokens con expiración
- Rate limiting en endpoints de login
- CORS configurado correctamente
- CSRF protection habilitado

**Uploads**:
- Validación de tipo de archivo
- Límite de tamaño por archivo
- Sanitización de nombres de archivo
- Escaneo de virus (opcional - ClamAV)
- Almacenamiento fuera de webroot o con permisos restringidos

**API**:
- Permisos granulares
- Validación de entrada en serializers
- Protección contra SQL injection (ORM Django)
- Protección contra XSS (React)
- Rate limiting (Django Ratelimit)

### 10.3 Escalabilidad

**Base de datos**:
- Índices en campos de búsqueda frecuente
- Paginación en todos los listados
- select_related / prefetch_related para optimizar queries
- Connection pooling (PgBouncer)

**Media Files**:
- Considerar S3 o similar para uploads en producción
- CDN para servir archivos estáticos

**Caché**:
- Redis para caché de landing page
- Caché de resultados de votación
- Caché de queries pesadas

**Background Tasks**:
- Celery para tareas asíncronas:
  - Envío de emails
  - Generación de thumbnails
  - Cálculo de resultados
  - Exportación de datos

### 10.4 Monitoreo y Logs

**Logging**:
- Logs estructurados (JSON)
- Niveles adecuados (DEBUG en dev, INFO/ERROR en prod)
- Rotación de logs
- Centralización (ELK, Graylog, o similar)

**Monitoreo**:
- Sentry para errores
- Métricas de performance (Django Debug Toolbar en dev)
- Uptime monitoring
- Alertas automáticas

**Analytics**:
- Google Analytics en landing
- Tracking de conversiones (registro, envíos, votos)
- Heatmaps (opcional - Hotjar)

### 10.5 Backup y Recuperación

**Base de datos**:
- Backups automáticos diarios (PostgreSQL dump)
- Retención de 30 días
- Backups offsite
- Procedimiento de restore documentado

**Media files**:
- Backup sincronizado con BD
- Versionado (opcional)

**Configuración**:
- Variables de entorno en .env (no en repo)
- Secrets management (Docker secrets, Vault, etc.)

### 10.6 Internacionalización

**Backend**:
- Django i18n configurado
- Traducciones en español (primario) e inglés

**Frontend**:
- i18next ya configurado
- Completar traducciones faltantes
- Selector de idioma visible

**Landing**:
- Contenido en español por defecto
- Considerar versión en inglés (subdominio o /en/)

### 10.7 Accesibilidad

- Cumplir WCAG 2.1 AA
- Navegación por teclado
- Screen reader friendly
- Contraste de colores adecuado
- Alt text en imágenes
- ARIA labels donde sea necesario

### 10.8 Testing

**Backend**:
- Coverage mínimo: 80%
- Tests de modelos, serializers, views, permisos
- Fixtures para datos de prueba
- pytest + pytest-django

**Frontend**:
- Tests de componentes (Jest + RTL)
- Tests de integración con API mock
- Tests E2E de flujos críticos (Cypress/Playwright)
- Coverage mínimo: 70%

### 10.9 Documentación

**API**:
- Swagger/OpenAPI completo
- Ejemplos de requests/responses
- Códigos de error documentados

**Código**:
- Docstrings en funciones complejas
- Comentarios donde sea necesario
- Type hints en Python (opcional)

**Proyecto**:
- README actualizado
- Guía de instalación
- Guía de despliegue
- Arquitectura documentada (este documento)
- Changelog

---

## Resumen Ejecutivo

### Estado Actual
- ✅ Sistema de autenticación completo
- ✅ Modelos de competiciones definidos
- ✅ Frontend React básico funcional
- ⚠ API de competiciones NO implementada
- ❌ Landing page NO implementada
- ❌ Sistema de votación NO implementado
- ❌ Panel de administración NO implementado

### Trabajo Pendiente
1. **Fase 1 (Crítica)**: Landing page Django con SEO
2. **Fase 2-3**: API y frontend de competiciones/producciones
3. **Fase 4**: Sistema de votación
4. **Fase 5**: Panel de administración completo
5. **Fases 6-8**: Perfil, optimización, testing, deployment

### Estimación Total
- **Tiempo**: 15-20 semanas (~4-5 meses)
- **Complejidad**: Media-Alta
- **Riesgo técnico**: Bajo (tecnologías probadas)

### Prioridades
1. Landing page (SEO y difusión pública)
2. API de competiciones y producciones (funcionalidad core)
3. Sistema de votación (diferenciador clave)
4. Panel de administración (operatividad)

---

**Fin del documento técnico**
