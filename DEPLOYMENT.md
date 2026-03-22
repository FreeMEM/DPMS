# Despliegue en Produccion - DPMS

Guia completa para desplegar DPMS (Demo Party Management System) en un servidor de produccion con Nginx, SSL y ModSecurity.

## Arquitectura

```
Internet
    |
    v
Nginx (owasp/modsecurity-crs)
    |--- puerto 80  -> redirige a HTTPS
    |--- puerto 443 -> HTTPS con Let's Encrypt
    |
    |--- /app/*        -> Frontend (React build estatico)
    |--- /admin/*      -> Django Admin
    |--- /docs/*       -> Swagger API
    |--- /static/*     -> Django static files
    |--- /media/*      -> Uploads de producciones
    |--- /*            -> Django REST API
    |
    v
+-----------+     +-----------+
|  Frontend |     |  Backend  |
|  (nginx)  |     | (Gunicorn)|
|  :80 int  |     |  :8000    |
+-----------+     +-----------+
                       |
                       v
                  +-----------+
                  | PostgreSQL|
                  |   :5432   |
                  +-----------+
```

## Requisitos previos

- Docker y Docker Compose instalados
- Dominio apuntando al servidor (dpms.freemem.space)
- Puertos 80 y 443 abiertos en el firewall

## Estructura de archivos

```
DPMS/
├── production.yml                  # Docker Compose de produccion
├── init-ssl.yml                    # Compose temporal para obtener certificado SSL
├── local.yml                       # Docker Compose de desarrollo
├── docker/
│   ├── backend/
│   │   ├── production.Dockerfile   # Imagen Django (python:3.10-slim + Gunicorn)
│   │   └── wsgi-entrypoint-prod.sh # Entrypoint: migrations + collectstatic + gunicorn
│   ├── frontend/
│   │   └── production.Dockerfile   # Multi-stage: build React + sirve con nginx
│   └── postgres/
│       └── Dockerfile              # PostgreSQL 16 con scripts de backup/restore
├── nginx/
│   ├── site.conf                   # Config Nginx produccion (HTTPS + rate limiting)
│   ├── init-ssl.conf               # Config temporal para challenge ACME
│   └── modsecurity/
│       ├── REQUEST-900-EXCLUSION-RULES-BEFORE-CRS.conf
│       └── RESPONSE-999-EXCLUSION-RULES-AFTER-CRS.conf
├── certbot/
│   ├── www/                        # Webroot para challenge ACME
│   └── conf/                       # Certificados Let's Encrypt
└── .envs/
    └── .production/
        ├── .django                 # Variables de entorno Django
        └── .postgres               # Variables de entorno PostgreSQL
```

## Paso 1: Configurar variables de entorno

Copiar los templates y editarlos con valores reales:

```bash
cp .envs/.production/.django.example .envs/.production/.django
cp .envs/.production/.postgres.example .envs/.production/.postgres
```

### Variables Django (`.envs/.production/.django`)

| Variable | Descripcion | Ejemplo |
|---|---|---|
| `DJANGO_SETTINGS_MODULE` | Modulo de settings | `config.settings.production` |
| `DJANGO_SECRET_KEY` | Clave secreta (generar una unica) | `k8s$f2j...` |
| `DJANGO_ALLOWED_HOSTS` | Hosts permitidos | `dpms.freemem.space` |
| `EMAIL_HOST` | Servidor SMTP | `smtp.gmail.com` |
| `EMAIL_HOST_USER` | Usuario SMTP | `noreply@example.com` |
| `EMAIL_HOST_PASSWORD` | Password SMTP | `app-password` |
| `EMAIL_PORT` | Puerto SMTP | `587` |
| `EMAIL_USE_TLS` | Usar TLS | `True` |
| `SCENE_CLIENT_ID` | Client ID de SceneID OAuth | `...` |
| `SCENEID_CLIENT_SECRET` | Client Secret de SceneID OAuth | `...` |

Para generar un `DJANGO_SECRET_KEY` seguro:

```bash
python3 -c "import secrets; print(secrets.token_urlsafe(50))"
```

### Variables PostgreSQL (`.envs/.production/.postgres`)

| Variable | Descripcion | Ejemplo |
|---|---|---|
| `POSTGRES_HOST` | Host de la base de datos | `postgres` |
| `POSTGRES_PORT` | Puerto | `5432` |
| `POSTGRES_DB` | Nombre de la base de datos | `dpms_production` |
| `POSTGRES_USER` | Usuario | `dpms` |
| `POSTGRES_PASSWORD` | Password (generar una segura) | `s3cur3P@ss...` |

## Paso 2: Obtener certificado SSL

La primera vez es necesario obtener el certificado de Let's Encrypt. Se usa un compose temporal que levanta solo un nginx basico para responder al challenge ACME.

```bash
# Levantar nginx temporal
docker compose -f init-ssl.yml up -d

# Solicitar certificado
docker compose -f init-ssl.yml run --rm certbot certonly \
  --webroot \
  --webroot-path=/var/www/certbot \
  -d dpms.freemem.space \
  --email admin@freemem.space \
  --agree-tos \
  --non-interactive

# Parar nginx temporal
docker compose -f init-ssl.yml down
```

Verificar que los certificados se generaron:

```bash
ls certbot/conf/live/dpms.freemem.space/
# Debe mostrar: cert.pem  chain.pem  fullchain.pem  privkey.pem
```

## Paso 3: Construir y levantar

```bash
# Construir imagenes y levantar todos los servicios
docker compose -f production.yml up -d --build
```

Verificar que todos los contenedores estan corriendo:

```bash
docker compose -f production.yml ps
```

Debe mostrar 5 servicios: `backend_party`, `frontend`, `nginx`, `certbot`, `postgres`.

Ver logs de cada servicio:

```bash
# Backend
docker compose -f production.yml logs -f backend_party

# Frontend
docker compose -f production.yml logs -f frontend

# Nginx
docker compose -f production.yml logs -f nginx
```

## Paso 4: Crear superusuario

```bash
docker compose -f production.yml exec backend_party python manage.py createsuperuser
```

## Servicios y puertos

| Servicio | Imagen | Puerto externo | Puerto interno | Funcion |
|---|---|---|---|---|
| `nginx` | `owasp/modsecurity-crs:nginx-alpine` | 80, 443 | 80, 443 | Reverse proxy, SSL, WAF |
| `backend_party` | `dpms_production_django` | - | 8000 | API REST (Gunicorn) |
| `frontend` | `dpms_production_frontend` | - | 80 | React build estatico |
| `postgres` | `dpms_production_postgres` | - | 5432 | Base de datos |
| `certbot` | `certbot/certbot` | - | - | Renovacion SSL automatica |

Solo nginx expone puertos al exterior. El resto de servicios se comunican por la red interna `backend`.

## Seguridad

### Nginx

- **TLS 1.2 y 1.3** con ciphers modernos
- **HSTS** con `max-age=31536000` (1 ano) e `includeSubDomains`
- **HTTP/2** habilitado
- **Headers de seguridad**:
  - `X-Frame-Options: SAMEORIGIN`
  - `X-Content-Type-Options: nosniff`
  - `X-XSS-Protection: 1; mode=block`
  - `Referrer-Policy: strict-origin-when-cross-origin`
  - `Permissions-Policy: geolocation=(), microphone=(), camera=()`
- **Bloqueos**: archivos ocultos, scripts en uploads

### Rate Limiting

| Zona | Rate | Burst | Endpoints |
|---|---|---|---|
| `api_login` | 1 req/s | 5 | `/users/login/`, `/users/signup/` |
| `admin` | 10 req/s | 20 | `/admin/`, `/docs/` |
| `api_general` | 30 req/s | 50 | Resto de endpoints API |

### ModSecurity (WAF)

- Imagen `owasp/modsecurity-crs:nginx-alpine` con OWASP Core Rule Set
- `BLOCKING_PARANOIA=1` (nivel basico, menos falsos positivos)
- Exclusiones configuradas para:
  - API REST (`/users/`, `/compos/`) - evita falsos positivos con JSON
  - Upload de producciones (`/productions/`) - permite subida de archivos
  - Django Admin (`/admin/`) - formularios con contenido variado
  - StageRunner (`/stagerunner/`) - contenido HTML/CSS en slides
  - Swagger docs (`/docs/`)
- Logs en volumen `modsec_logs`

### Let's Encrypt

- Certificados en `certbot/conf/`
- Renovacion automatica cada 12 horas via contenedor `certbot`
- Sin necesidad de reiniciar nginx para la renovacion

### Django

- `SECURE_SSL_REDIRECT=True` - redirige HTTP a HTTPS
- `SESSION_COOKIE_SECURE=True` - cookies solo por HTTPS
- `CSRF_COOKIE_SECURE=True` - CSRF cookie solo por HTTPS
- `SECURE_PROXY_SSL_HEADER` configurado para confiar en `X-Forwarded-Proto`

## Operaciones comunes

### Actualizar la aplicacion

```bash
git pull
docker compose -f production.yml up -d --build
```

El entrypoint del backend ejecuta automaticamente `migrate` y `collectstatic` en cada inicio.

### Reiniciar un servicio

```bash
docker compose -f production.yml restart backend_party
docker compose -f production.yml restart nginx
```

### Ver logs de ModSecurity

```bash
# Logs en tiempo real
docker compose -f production.yml exec nginx tail -f /var/log/modsecurity/audit.log

# O acceder al volumen
docker volume inspect dpms_modsec_logs
```

### Backup de base de datos

```bash
# Crear backup
docker compose -f production.yml exec postgres backup

# Listar backups
docker compose -f production.yml exec postgres backups

# Restaurar backup
docker compose -f production.yml exec postgres restore nombre_del_backup.sql.gz
```

### Renovar certificado SSL manualmente

```bash
docker compose -f production.yml exec certbot certbot renew --force-renewal
docker compose -f production.yml restart nginx
```

### Escalar Gunicorn

Editar `docker/backend/wsgi-entrypoint-prod.sh` y ajustar:

```bash
gunicorn config.wsgi:application \
    --bind 0.0.0.0:8000 \
    --workers 4 \          # Regla general: (2 * CPU cores) + 1
    --threads 4 \
    --worker-class gthread \
    --worker-tmp-dir /dev/shm
```

Luego reconstruir:

```bash
docker compose -f production.yml up -d --build backend_party
```

### Django shell en produccion

```bash
docker compose -f production.yml exec backend_party python manage.py shell
```

## Cambiar dominio

Si se cambia el dominio (por ejemplo a `dpms.capacitorparty.com`):

1. Actualizar `nginx/site.conf`: cambiar `server_name` y rutas de certificados
2. Actualizar `nginx/init-ssl.conf`: cambiar `server_name`
3. Actualizar `.envs/.production/.django`: cambiar `DJANGO_ALLOWED_HOSTS`
4. Actualizar `production.yml`: cambiar `REACT_APP_BACKEND_ADDRESS` en build args del frontend
5. Actualizar `backend/config/settings/production.py`: cambiar `FRONTEND_URL`, `BACKEND_URL` y `ALLOWED_HOSTS`
6. Obtener nuevo certificado SSL con `init-ssl.yml`
7. Reconstruir: `docker compose -f production.yml up -d --build`

## Troubleshooting

### El backend no arranca

```bash
docker compose -f production.yml logs backend_party
```

Causas comunes:
- PostgreSQL aun no esta listo (el entrypoint reintenta automaticamente)
- Variables de entorno faltantes en `.envs/.production/.django`
- Error en migraciones

### Nginx devuelve 502

El backend no esta respondiendo. Verificar:

```bash
docker compose -f production.yml ps
docker compose -f production.yml logs backend_party
```

### Certificado SSL expirado

```bash
docker compose -f production.yml exec certbot certbot renew --force-renewal
docker compose -f production.yml restart nginx
```

### ModSecurity bloquea peticiones legitimas

Revisar el log de audit:

```bash
docker compose -f production.yml exec nginx tail -100 /var/log/modsecurity/audit.log
```

Identificar la regla que bloquea y anadir exclusion en:
- `nginx/modsecurity/REQUEST-900-EXCLUSION-RULES-BEFORE-CRS.conf` (para requests)
- `nginx/modsecurity/RESPONSE-999-EXCLUSION-RULES-AFTER-CRS.conf` (para responses)

Reiniciar nginx despues de cambiar reglas:

```bash
docker compose -f production.yml restart nginx
```

### Limpiar todo y empezar de cero

```bash
docker compose -f production.yml down -v
rm -rf certbot/conf certbot/www
# Repetir desde el Paso 2
```
