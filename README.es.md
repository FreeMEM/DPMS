# DPMS - Demo Party Management System

*[English](README.md) | Castellano*

Una aplicacion web moderna y segura para gestionar fiestas de la demoscene, competiciones, producciones, sistemas de votacion y presentacion en directo (StageRunner).

## Acerca de

DPMS esta diseñado como una alternativa mas segura y preparada para internet a los sistemas de gestion de partys existentes como wuhu. Mientras que las soluciones PMS tradicionales funcionan bien como aplicaciones de intranet durante los eventos, DPMS se centra en la seguridad, la gestion de usuarios y la capacidad de funcionar online antes, durante y despues de la party.

### Historia

Apasionado de la informatica desde 1984. Organice la [RadyKal Party](https://www.youtube.com/watch?v=p66lT8mlqkk) en [Granada, España en 1998](https://www.youtube.com/watch?v=A3jAjhgOorI) ([mas videos](https://www.youtube.com/watch?v=4ILiIh-O4Vk)) y visito cada año otras Amiga Parties por España. Los ultimos años he colaborado con Posadas Party y Capacitor Party. Comence a desarrollar una aplicacion web para gestionar la siguiente Capacitor Amiga Party pero la pandemia cancelo el proyecto. El verano pasado (2022), Posadas Party celebro una nueva edicion y necesitabamos una herramienta para que la gente votara las competiciones. Usamos wuhu, un conocido Party Management System (PMS) escrito en PHP. Me gustaron sus funciones y como gestiona los datos de las competiciones y su sistema de "beamer". Pero su sistema de registro es demasiado simple e inseguro. Wuhu esta pensado mas como una aplicacion de intranet usada solo el dia del evento. Pero yo queria algo mas seguro para mantener online en internet.

## Caracteristicas

- **Gestion de usuarios**: Sistema seguro de registro y autenticacion con verificacion por email
- **Gestion de ediciones**: Crear ediciones de party con logo, cartel y efectos glow configurables
- **Gestion de competiciones (Compos)**: Crear y gestionar diferentes categorias de competicion
- **Envio de producciones**: Permitir a los sceners enviar sus producciones (demos, musica, graficos, etc.)
- **Sistema de votacion**: Permitir a los asistentes votar las entradas de las competiciones
- **StageRunner**: Sistema de presentacion a pantalla completa para mostrar producciones en proyector/pantalla grande durante eventos
- **Control de acceso por roles**: Diferentes permisos para Admins, Organizadores y Sceners
- **Soporte multi-idioma**: Desarrollado con soporte i18n (actualmente castellano/ingles)
- **Fondos 3D animados**: Multiples efectos WebGL (Hyperspace, Wave, Energy Grid, TRON Grid) con rotacion automatica
- **Branding dinamico**: Logo de edicion con efecto glow configurable en login, signup y aplicacion principal
- **Landing Page SEO-friendly**: Pagina publica con informacion del evento, cuenta atras y fondos animados
- **Panel de administracion**: Panel completo para gestionar ediciones, competiciones, producciones y usuarios
- **API REST**: API completa con documentacion Swagger

## Stack Tecnologico

- **Backend**: Django 4.x + Django REST Framework + PostgreSQL
- **Frontend**: React 18 + Material-UI + React Router v6
- **Graficos 3D**: Three.js para efectos de fondo WebGL
- **Contenedores**: Docker & Docker Compose
- **Autenticacion**: Autenticacion basada en tokens (DRF Token + JWT)

## Requisitos Previos

- Docker y Docker Compose
- Node.js 18+ y Yarn (para desarrollo frontend)
- Python 3.9+ (para desarrollo backend sin Docker)

## Inicio Rapido

### 1. Clonar el repositorio

```bash
git clone https://github.com/yourusername/DPMS.git
cd DPMS
```

### 2. Configurar variables de entorno

Crear los archivos de entorno en el directorio `.envs/`:

**.envs/.django**
```env
# Django
DJANGO_SECRET_KEY=tu-clave-secreta-cambiar-en-produccion

# SceneID OAuth (opcional, para login con SceneID)
SCENE_CLIENT_ID=tu-sceneid-client-id
SCENEID_CLIENT_SECRET=tu-sceneid-client-secret
```

**.envs/.postgres**
```env
POSTGRES_HOST=postgres
POSTGRES_PORT=5432
POSTGRES_DB=dpms
POSTGRES_USER=dpms_user
POSTGRES_PASSWORD=dpms_password
```

**frontend/.env** (opcional, para desarrollo)
```env
REACT_APP_BACKEND_ADDRESS=http://localhost:8000
```

### 3. Iniciar el backend con Docker Compose

```bash
docker compose -f local.yml up -d
```

Esto iniciara:
- Base de datos PostgreSQL
- API backend Django en http://localhost:8000

### 4. Instalar dependencias del frontend e iniciar servidor de desarrollo

```bash
cd frontend
yarn install
yarn start
```

El frontend estara disponible en http://localhost:3000

### 5. Crear un superusuario (opcional)

```bash
docker compose -f local.yml exec backend_party python manage.py createsuperuser
```

## Desarrollo

### Desarrollo Backend

**Acceder al panel de administracion Django:**
```
http://localhost:8000/admin/
```

**Ver documentacion de la API (Swagger):**
```
http://localhost:8000/docs/
```

**Ejecutar migraciones:**
```bash
docker compose -f local.yml exec backend_party python manage.py migrate
```

**Crear nuevas migraciones:**
```bash
docker compose -f local.yml exec backend_party python manage.py makemigrations
```

**Ejecutar tests del backend:**
```bash
docker compose -f local.yml exec backend_party pytest
```

**Acceder al shell de Django:**
```bash
docker compose -f local.yml exec backend_party python manage.py shell
```

### Desarrollo Frontend

**Ejecutar tests:**
```bash
cd frontend
yarn test
```

**Compilar para produccion:**
```bash
cd frontend
yarn build
```

**Configurar URL del backend:**

Crear un archivo `.env` en el directorio `frontend/`:
```env
REACT_APP_BACKEND_ADDRESS=http://localhost:8000
```

### Detener la aplicacion

**Detener todos los servicios:**
```bash
docker compose -f local.yml down
```

**Detener el frontend:**
Pulsar `Ctrl+C` en el terminal donde se ejecuta `yarn start`

## Despliegue en Produccion

Para el despliegue en produccion, usar el archivo Docker Compose de produccion:

```bash
docker compose -f production.yml up -d
```

**Consideraciones de seguridad importantes:**
- Cambiar `DJANGO_SECRET_KEY` por un valor aleatorio fuerte
- Establecer `DJANGO_DEBUG=False`
- Configurar `DJANGO_ALLOWED_HOSTS` correctamente
- Usar contraseñas de base de datos fuertes
- Configurar certificados HTTPS/SSL
- Configurar los ajustes de CORS correctamente

**Variables de entorno adicionales para produccion (.envs/.django):**
```env
# Configuracion de email (necesario para verificacion de usuarios)
EMAIL_HOST=smtp.tu-proveedor.com
EMAIL_HOST_USER=tu-email@dominio.com
EMAIL_HOST_PASSWORD=tu-contraseña-email
EMAIL_PORT=587

# URL del frontend (para enlaces en emails)
FRONTEND_URL=https://tu-dominio.com/app
```

## Estructura del Proyecto

```
DPMS/
├── backend/              # API REST Django
│   ├── config/          # Configuracion Django y URLs principales
│   ├── dpms/            # Apps principales de Django
│   │   ├── users/       # Autenticacion y gestion de usuarios
│   │   ├── compos/      # Competiciones y producciones
│   │   ├── website/     # Landing page (SSR)
│   │   └── utils/       # Utilidades compartidas
│   └── requirements/    # Dependencias Python
├── frontend/            # Aplicacion React (SPA)
│   ├── src/
│   │   ├── @dpms-freemem/      # Componentes UI principales (MainBar, Content)
│   │   ├── components/         # Componentes React
│   │   │   ├── admin/          # Componentes del panel de administracion
│   │   │   │   └── common/     # Componentes admin compartidos (LoadingSpinner, StatusChip, etc.)
│   │   │   ├── common/         # Componentes compartidos (ThreeBackground, backgroundEffects)
│   │   │   ├── user/           # Componentes de autenticacion (Login, Signup)
│   │   │   └── productions/    # Gestion de producciones
│   │   ├── pages/              # Componentes de pagina
│   │   │   └── admin/          # Paginas de administracion (Editions, Compos, Productions)
│   │   ├── effects/            # Efectos visuales (ParticleEffects)
│   │   ├── utils/              # Utilidades frontend (AxiosWrapper, dateFormatting)
│   │   └── routes.js           # Enrutamiento de la aplicacion
│   └── package.json
├── stagerunner/         # App de presentacion StageRunner (app React separada)
│   ├── src/
│   │   ├── components/  # Componentes de presentacion
│   │   ├── screens/     # Pantallas de visualizacion
│   │   ├── services/    # Cliente API con cache
│   │   └── hooks/       # Hooks personalizados (teclado, slideshow)
│   └── package.json
├── docker/              # Configuraciones Docker
├── .envs/              # Variables de entorno (en gitignore)
├── local.yml           # Docker Compose para desarrollo local
├── production.yml      # Docker Compose para produccion
├── TECHNICAL_SPEC.md   # Especificacion tecnica completa
├── STAGERUNNER_SPEC.md # Especificacion detallada de StageRunner
└── CLAUDE.md           # Directrices de desarrollo
```

## URLs de la Aplicacion

- **Landing Page**: `http://localhost:8000/` (Django SSR)
- **Aplicacion de usuario**: `http://localhost:3000/app/` (React SPA - desarrollo)
- **Panel de administracion**: `http://localhost:8000/admin/` (Django admin)
- **Documentacion API**: `http://localhost:8000/docs/` (Swagger)
- **StageRunner**: `http://localhost:3001/` (React - cuando este implementado)

## Endpoints de la API

Endpoints principales de la API:

- `POST /api/users/signup/` - Registro de usuario
- `POST /api/users/login/` - Autenticacion de usuario
- `GET /api/users/verify?token=<token>` - Verificacion de email
- `GET /api/editions/` - Listar ediciones
- `GET /api/compos/` - Listar competiciones
- `GET /api/productions/` - Listar producciones
- `GET /api/productions/my_productions/` - Producciones del usuario (autenticado)
- `GET /api/files/` - Listar archivos
- `POST /api/files/` - Subir archivo (multipart, autenticado)
- `GET /api/files/{id}/download/` - Descargar archivo
- `GET /docs/` - Documentacion Swagger completa

## Contribuir

Las contribuciones son bienvenidas. No dudes en enviar un Pull Request.

## Licencia

Este proyecto esta licenciado bajo la Licencia MIT - consulta el archivo [LICENSE](LICENSE) para mas detalles.

## Autor

FreeMem - Entusiasta de la demoscene y organizador de partys desde 1984

## Agradecimientos

- **Equipo de Wuhu**: Agradecimiento especial al equipo de desarrollo del Party Management System wuhu por su excelente trabajo. Wuhu ha sido una inspiracion y una referencia para este proyecto, mostrandome lo que un sistema de gestion de partys deberia ser. Espero contribuir a la demoscene con nuevas tecnologias construyendo sobre la solida base que ellos establecieron.
- Hecho con cariño para la comunidad de la demoscene
- Agradecimiento especial a los organizadores de Posadas Party y Capacitor Party por su apoyo y feedback
