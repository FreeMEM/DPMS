# ✅ Landing Page + React SPA - Configuración Completa

## Estado: FUNCIONANDO

La arquitectura híbrida está completamente configurada y funcionando correctamente.

---

## URLs Configuradas

### Desarrollo

**Backend Django** (`localhost:8000`):
```
http://localhost:8000/              → Landing page (Django templates)
http://localhost:8000/api/users/*   → API REST
http://localhost:8000/admin/        → Django Admin
http://localhost:8000/docs/         → Swagger API docs
```

**Frontend React** (`localhost:3000`):
```
http://localhost:3000/              → Redirect a /app/dashboard
http://localhost:3000/app/login     → Login
http://localhost:3000/app/signup    → Registro
http://localhost:3000/app/dashboard → Dashboard
```

### Enlaces Entre Ambos

✅ **La landing page apunta automáticamente al React dev server**

Desde `http://localhost:8000/` (Django):
- Click en "Acceder" → Redirige a `http://localhost:3000/app/login`
- Click en "Registrarse" → Redirige a `http://localhost:3000/app/signup`

---

## Cómo Funciona

### Context Processor

Se creó un context processor que detecta el entorno y configura las URLs correctamente:

**Archivo**: `backend/dpms/website/context_processors.py`

```python
def frontend_url(request):
    return {
        'FRONTEND_URL': getattr(settings, 'FRONTEND_URL', '/app'),
    }
```

### Settings

**Desarrollo** (`local.py`):
```python
FRONTEND_URL = "http://localhost:3000/app"
```

**Producción** (`production.py`):
```python
FRONTEND_URL = "/app"
```

### Templates

Todos los enlaces en los templates usan la variable `{{ FRONTEND_URL }}`:

```django
<a href="{{ FRONTEND_URL }}/login">Acceder</a>
<a href="{{ FRONTEND_URL }}/signup">Registrarse</a>
```

---

## Probar en Desarrollo

### 1. Iniciar todos los servicios

```bash
docker compose -f local.yml up -d
```

Esto inicia PostgreSQL, Django (backend) y React (frontend).

Verifica que está corriendo:
```bash
curl http://localhost:8000/
curl http://localhost:3000/
```

### 2. Flujo Completo

1. **Abre** `http://localhost:8000/` (landing Django)
2. **Click** en "Acceder" o "Registrarse"
3. **Redirige automáticamente** a `http://localhost:3000/app/login` o `/signup`
4. **Completa** el formulario
5. **Login exitoso** → Dashboard en React

---

## Producción

En producción, todo funciona desde el mismo dominio:

### Configuración nginx

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

    # API REST
    location /api/ {
        uwsgi_pass unix:///path/to/dpms.sock;
        include uwsgi_params;
    }

    # Django Admin
    location /admin/ {
        uwsgi_pass unix:///path/to/dpms.sock;
        include uwsgi_params;
    }

    # Landing (Django templates) - DEBE IR AL FINAL
    location / {
        uwsgi_pass unix:///path/to/dpms.sock;
        include uwsgi_params;
    }
}
```

### Build del Frontend

El build de producción se genera dentro del contenedor Docker (ver `docker/frontend/production.Dockerfile`).

### Flujo en Producción

1. Usuario visita `yourdomain.com/` → Landing (Django)
2. Click en "Acceder" → Redirige a `yourdomain.com/app/login` (React)
3. Login exitoso → Dashboard en `yourdomain.com/app/dashboard`

Todo funciona desde el mismo dominio sin problemas de CORS.

---

## Archivos Modificados

### Backend

1. ✅ `backend/config/settings/base.py`
   - Añadido context processor

2. ✅ `backend/config/settings/local.py`
   - Añadido `FRONTEND_URL = "http://localhost:3000/app"`

3. ✅ `backend/config/settings/production.py`
   - Añadido `FRONTEND_URL = "/app"`

4. ✅ `backend/dpms/website/context_processors.py`
   - **Nuevo archivo**: Context processor para FRONTEND_URL

5. ✅ `backend/dpms/website/templates/website/base.html`
   - Enlaces actualizados para usar `{{ FRONTEND_URL }}`

6. ✅ `backend/dpms/website/templates/website/index.html`
   - Botones CTAs actualizados para usar `{{ FRONTEND_URL }}`

### Frontend

Sin cambios adicionales. Ya estaba configurado en el paso anterior con:
- `basename="/app"` en React Router
- `homepage: "/app"` en package.json
- API calls con prefijo `/api/`

---

## Troubleshooting

### Los enlaces siguen apuntando a /app/ en desarrollo

**Problema**: La landing en localhost:8000 muestra enlaces a `/app/login` en lugar de `http://localhost:3000/app/login`.

**Solución**:
1. Verifica que Django se reinició:
   ```bash
   docker compose -f local.yml restart backend_party
   ```

2. Verifica el context processor en settings:
   ```bash
   docker compose -f local.yml exec backend_party python manage.py shell
   >>> from django.conf import settings
   >>> settings.FRONTEND_URL
   'http://localhost:3000'
   ```

3. Verifica que el template usa la variable:
   ```bash
   curl http://localhost:8000/ | grep "localhost:3000"
   ```

### React no carga en localhost:3000

**Problema**: El frontend no carga.

**Solución**:
```bash
docker compose -f local.yml logs -f frontend
docker compose -f local.yml restart frontend
```

### CORS errors al hacer login

**Problema**: Error de CORS en la consola del navegador.

**Solución**: Verifica que `localhost:3000` está en CORS_ALLOWED_ORIGINS:

```bash
# backend/config/settings/local.py
CORS_ALLOWED_ORIGINS = [
    "http://localhost:3000",
]
```

---

## Siguiente Paso

Ahora que la arquitectura está completamente funcional, puedes elegir:

1. **Fase 2-3**: Implementar API de competiciones y producciones
2. **Fase 1**: Expandir landing con noticias, galería, configuración
3. **Fase 4**: Sistema de votación

Todo está documentado en [TECHNICAL_SPEC.md](TECHNICAL_SPEC.md).

---

## Resumen

✅ **Landing Django** en localhost:8000
✅ **React SPA** en localhost:3000
✅ **API REST** en localhost:8000/api/
✅ **Enlaces funcionan** entre ambos
✅ **Listo para producción** con nginx

¡La arquitectura híbrida está completamente operativa! 🎉
