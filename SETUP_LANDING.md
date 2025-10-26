# Configuración de Arquitectura Híbrida - Landing Page + React SPA

## Cambios Realizados

Se ha implementado una arquitectura híbrida que combina:
- **Django Templates** para la landing page (SEO-friendly)
- **React SPA** para la aplicación web (bajo `/app`)
- **Django REST API** para el backend

---

## Estructura de URLs

### Desarrollo (localhost)

```
http://localhost:8000/                → Landing page (Django templates)
http://localhost:8000/api/users/*     → API REST (Django)
http://localhost:8000/admin/          → Django Admin
http://localhost:8000/docs/           → Swagger API docs

http://localhost:3000/                → React dev server (desarrollo)
```

### Producción

```
yourdomain.com/                       → Landing page (Django templates)
yourdomain.com/app/*                  → React SPA (archivos estáticos)
yourdomain.com/api/*                  → API REST
yourdomain.com/admin/                 → Django Admin
```

---

## Cambios en el Backend

### 1. Nueva App: `dpms.website`

**Ubicación**: `backend/dpms/website/`

**Estructura**:
```
dpms/website/
├── __init__.py
├── apps.py
├── views.py
├── urls.py
├── templates/
│   └── website/
│       ├── base.html          # Template base con SEO
│       └── index.html         # Página principal
└── static/
    └── website/
        ├── css/
        │   └── main.css       # Estilos de la landing
        └── js/
            └── main.js        # JavaScript básico
```

**Características**:
- Template base con meta tags completos (SEO, Open Graph, Twitter Card)
- Diseño responsive con tema oscuro (consistente con React)
- Hero section con call-to-action
- Secciones placeholder para Fase 1

### 2. URLs Reorganizadas

**Archivo**: `backend/config/urls.py`

```python
urlpatterns = [
    path(settings.ADMIN_URL, admin.site.urls),
    path("api/", include(("dpms.users.urls", "users"), namespace="users")),  # ← CAMBIO
    path("docs/", schema_view.with_ui("swagger", cache_timeout=0), name="schema-swagger-ui"),
    path("", include(("dpms.website.urls", "website"), namespace="website")),  # ← NUEVO
] + static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
```

**Cambios clave**:
- Users API movida de `/` a `/api/`
- Landing page añadida en `/`
- La landing debe ir **al final** como fallback

### 3. Settings Actualizados

**Archivo**: `backend/config/settings/base.py`

```python
LOCAL_APPS = [
    "dpms.users.apps.UsersAppConfig",
    "dpms.compos.apps.ComposAppConfig",
    "dpms.website.apps.WebsiteConfig",  # ← NUEVO
]
```

---

## Cambios en el Frontend (React)

### 1. React Router con Basename

**Archivo**: `frontend/src/routes.js`

```javascript
const AppRoutes = () => {
  return (
    <Router basename="/app">  {/* ← CAMBIO */}
      <Routes>
        {/* ... todas las rutas ... */}
      </Routes>
    </Router>
  );
};
```

**Resultado**: Todas las rutas de React ahora usan `/app` como prefijo:
- `/login` → `/app/login`
- `/signup` → `/app/signup`
- `/dashboard` → `/app/dashboard`
- etc.

### 2. Package.json Actualizado

**Archivo**: `frontend/package.json`

```json
{
  "name": "frontend",
  "version": "0.1.0",
  "private": true,
  "homepage": "/app",  // ← NUEVO (para build de producción)
  "dependencies": {
    // ...
  }
}
```

### 3. API Calls Actualizadas

**Archivo**: `frontend/src/AuthContext.js`

Todas las llamadas a la API ahora usan el prefijo `/api/`:

```javascript
// Antes: "/users/login/"
// Ahora:  "/api/users/login/"

await client.post("/api/users/login/", { email, password });
await client.post("/api/users/signup/", { ... });
await client.get(`/api/users/verify?token=${token}`);
```

---

## Testing en Desarrollo

### Backend

1. **Verificar que Django está corriendo**:
   ```bash
   docker compose -f local.yml ps backend_party
   ```

2. **Probar landing page**:
   ```bash
   curl http://localhost:8000/
   ```
   Deberías ver HTML con la landing page.

3. **Probar API**:
   ```bash
   curl http://localhost:8000/api/users/signup/ -X POST \
     -H "Content-Type: application/json" \
     -d '{"email":"test@test.com","username":"test","password":"test123","password_confirmation":"test123","first_name":"Test","last_name":"User"}'
   ```

4. **Ver URLs registradas**:
   ```bash
   docker compose -f local.yml exec backend_party python manage.py show_urls | grep -E "^/(api|admin|$)"
   ```

### Frontend

1. **Instalar dependencias** (si no lo has hecho):
   ```bash
   cd frontend
   yarn install
   ```

2. **Iniciar dev server**:
   ```bash
   yarn start
   ```
   Se abrirá en `http://localhost:3000`

3. **Verificar rutas**:
   - `http://localhost:3000/` → Debería redirigir a `/app/dashboard`
   - `http://localhost:3000/app/login` → Formulario de login
   - `http://localhost:3000/app/signup` → Formulario de registro

4. **Verificar API calls**:
   - Abre DevTools → Network
   - Intenta hacer login
   - Verifica que las peticiones van a `http://localhost:8000/api/users/login/`

---

## Despliegue en Producción (LXC con nginx)

### 1. Configuración de nginx

**Archivo**: `/etc/nginx/sites-available/dpms`

```nginx
server {
    listen 80;
    server_name yourdomain.com;

    # Static files de Django
    location /static/ {
        alias /path/to/dpms/backend/staticfiles/;
    }

    # Media files de Django
    location /media/ {
        alias /path/to/dpms/backend/media/;
    }

    # React SPA (build estático)
    location /app/ {
        alias /path/to/dpms/frontend/build/;
        try_files $uri $uri/ /app/index.html;
    }

    # API REST (Django)
    location /api/ {
        uwsgi_pass unix:///path/to/dpms.sock;
        include uwsgi_params;
    }

    # Django Admin
    location /admin/ {
        uwsgi_pass unix:///path/to/dpms.sock;
        include uwsgi_params;
    }

    # Django docs
    location /docs/ {
        uwsgi_pass unix:///path/to/dpms.sock;
        include uwsgi_params;
    }

    # Landing (Django templates) - debe ir al final como fallback
    location / {
        uwsgi_pass unix:///path/to/dpms.sock;
        include uwsgi_params;
    }
}
```

### 2. Build del Frontend

```bash
cd /path/to/dpms/frontend
yarn install
yarn build

# El build se genera en frontend/build/
# nginx lo sirve directamente desde ahí
```

### 3. Script de Deploy Automático

```bash
#!/bin/bash
# deploy.sh

cd /path/to/dpms

# Backend
echo "Deploying backend..."
cd backend
source venv/bin/activate
pip install -r requirements/production.txt
python manage.py migrate
python manage.py collectstatic --noinput
systemctl restart uwsgi

# Frontend
echo "Building frontend..."
cd ../frontend
yarn install
yarn build

echo "Reloading nginx..."
systemctl reload nginx

echo "Deploy complete!"
```

---

## Próximos Pasos (Fase 1)

Cuando llegue el momento de implementar la Fase 1 (Landing completa), necesitarás:

1. **Nuevos modelos en Django**:
   - `News` (noticias)
   - `GalleryImage` (fotos de galería)
   - `SiteSettings` (configuración del sitio)
   - Modificar `Edition` (añadir campos para landing)

2. **API Endpoints**:
   - `GET /api/news/` - Lista de noticias
   - `GET /api/news/<slug>/` - Detalle de noticia
   - `GET /api/gallery/` - Galería de fotos
   - `GET /api/site-settings/` - Configuración del sitio

3. **Templates Django ampliados**:
   - Contador regresivo con JavaScript
   - Grid de fotos con lightbox
   - Mapa embebido
   - Sección de noticias dinámica

4. **Django Admin**:
   - Interfaces para gestionar noticias
   - Interfaces para gestionar galería
   - Interfaz para configuración del sitio

Todo está documentado en detalle en [TECHNICAL_SPEC.md](TECHNICAL_SPEC.md).

---

## Troubleshooting

### Landing page no se ve correctamente

**Problema**: Los estilos no cargan.

**Solución**:
```bash
docker compose -f local.yml exec backend_party python manage.py collectstatic
```

### API devuelve 404

**Problema**: Las rutas `/api/users/*` devuelven 404.

**Solución**: Verifica que las URLs están correctamente configuradas:
```bash
docker compose -f local.yml exec backend_party python manage.py show_urls | grep api
```

### React no puede conectarse a la API

**Problema**: CORS errors en el navegador.

**Solución**: Verifica `CORS_ALLOWED_ORIGINS` en `backend/config/settings/local.py`:
```python
CORS_ALLOWED_ORIGINS = [
    "http://localhost:3000",
]
```

### Rutas de React no funcionan en producción

**Problema**: Al recargar `/app/dashboard` devuelve 404.

**Solución**: Asegúrate de que nginx tiene `try_files $uri $uri/ /app/index.html;` en la location `/app/`.

---

## Resumen de Archivos Modificados

### Backend
- ✅ `backend/config/settings/base.py` - Añadida app website
- ✅ `backend/config/urls.py` - Reorganizadas URLs
- ✅ `backend/dpms/website/` - **Nueva app completa**

### Frontend
- ✅ `frontend/src/routes.js` - Añadido `basename="/app"`
- ✅ `frontend/package.json` - Añadido `homepage: "/app"`
- ✅ `frontend/src/AuthContext.js` - API calls con prefijo `/api/`

### Documentación
- ✅ `TECHNICAL_SPEC.md` - Especificación técnica completa
- ✅ `SETUP_LANDING.md` - Este documento

---

## Conclusión

La arquitectura híbrida está **completamente funcional**:

- ✅ Landing page SEO-friendly en `/`
- ✅ React SPA en `/app/*`
- ✅ API REST en `/api/*`
- ✅ Todo funciona en desarrollo
- ✅ Listo para producción (solo falta configurar nginx)

Puedes seguir desarrollando la aplicación React normalmente, y cuando llegue el momento de la Fase 1, solo tienes que expandir la landing page con más contenido.
