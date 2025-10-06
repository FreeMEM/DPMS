# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

DPMS (Demo Party Management System) is a web application for managing demoscene parties. It's designed to handle user registration, competitions (compos), productions, and voting systems more securely than existing solutions like wuhu.

**Tech Stack:**
- Backend: Django REST Framework with PostgreSQL
- Frontend: React 18 with Material-UI (MUI)
- Containerization: Docker Compose
- Authentication: Token-based with OAuth support (in development)

## Architecture

### Monorepo Structure

The project is organized as a monorepo with separate frontend and backend:

```
DPMS/
├── backend/          # Django REST API
├── frontend/         # React SPA
├── docker/           # Docker configurations
├── compose/          # Docker Compose configs
├── local.yml         # Local development docker-compose
└── production.yml    # Production docker-compose
```

### Backend Architecture

**Location:** `backend/`

Django project using the two-scoops layout pattern:

- **Settings:** `backend/config/settings/` - Split settings (base.py, local.py, production.py, test.py)
- **Main apps:**
  - `dpms/users/` - Custom user model, authentication, permissions, OAuth
  - `dpms/compos/` - Competition management (compos, editions, productions, files)
- **Entry point:** `backend/manage.py` with default settings module `config.settings.local`
- **Custom user model:** `AUTH_USER_MODEL = "users.User"`

**Key models:**
- Users: Custom user with groups (Admin, Organizer, Scener)
- Compos: Competition definitions with editions
- Productions: Entries submitted to compos
- Files: Media files attached to productions

### Frontend Architecture

**Location:** `frontend/`

React SPA built with Create React App:

- **Authentication:** Context-based (`AuthContext.js`) with localStorage persistence
- **API Communication:** Centralized axios wrapper (`utils/AxiosWrapper.js`) with retry logic
- **Routing:** React Router v6 with private route protection
- **UI:** Material-UI components with custom theme (`theme.js`)
- **Internationalization:** i18next with language detection
- **Custom components:** `@dpms-freemem/` package (MainBar, Content)

**Key routes:**
- `/login`, `/signup` - Public authentication
- `/demo-party/dashboard` - Main scener dashboard (protected)
- `/admin/dashboard` - Admin interface (protected)
- `/verify-account/:token` - Email verification

**API integration:**
- Base URL configured via `REACT_APP_BACKEND_ADDRESS` env var (default: `http://localhost:8000`)
- Token stored in localStorage and passed in request headers
- Retry logic for network failures (3 retries, 3s delay)

## Development Setup

### Environment Files

The project requires `.envs/.django` and `.envs/.postgres` for environment variables (gitignored). These contain:
- Database credentials (POSTGRES_USER, POSTGRES_PASSWORD, POSTGRES_DB, POSTGRES_HOST, POSTGRES_PORT)
- Django settings (DJANGO_DEBUG, DJANGO_SECRET_KEY, DJANGO_ALLOWED_HOSTS)

### Running Locally with Docker

**Start all services:**
```bash
docker-compose -f local.yml up
```

**Backend runs on:** `http://localhost:8000`
**Frontend must be started separately** (see below)

**Access Django shell:**
```bash
docker-compose -f local.yml exec backend_party python manage.py shell
```

**Run migrations:**
```bash
docker-compose -f local.yml exec backend_party python manage.py migrate
```

**Create superuser:**
```bash
docker-compose -f local.yml exec backend_party python manage.py createsuperuser
```

### Backend Development

**Location:** `backend/`

**Install dependencies:**
```bash
pip install -r requirements/local.txt
```

**Run Django development server** (without Docker):
```bash
cd backend
python manage.py runserver
```

**Run tests:**
```bash
cd backend
pytest
```

**Run migrations:**
```bash
cd backend
python manage.py migrate
```

**Create new migration:**
```bash
cd backend
python manage.py makemigrations
```

**Access Django admin:**
Navigate to `http://localhost:8000/admin/`

**View API documentation:**
Navigate to `http://localhost:8000/docs/` (Swagger UI via drf-yasg)

### Frontend Development

**Location:** `frontend/`

**Install dependencies:**
```bash
cd frontend
yarn install
```

**Start development server:**
```bash
cd frontend
yarn start
```
Opens on `http://localhost:3000`

**Run tests:**
```bash
cd frontend
yarn test
```

**Build for production:**
```bash
cd frontend
yarn build
```

**Note:** Tests use a custom transform pattern for axios: `--transformIgnorePatterns "node_modules/(?!axios)/"`

## Key Development Patterns

### Backend Patterns

1. **ViewSets over views:** Use DRF ViewSets with routers for REST endpoints
2. **Serializers organization:** Separate serializer files per model in `serializers/` directory
3. **Permissions:** Custom permission classes in `permissions/` directory
4. **URL routing:** App-level `urls.py` registered in main `config/urls.py`
5. **Models:** Organized by feature in subdirectories (e.g., `compos/models/`)

### Frontend Patterns

1. **Authentication flow:** All auth logic centralized in `AuthContext.js`
2. **Private routes:** Use `PrivateRoute` wrapper component for protected pages
3. **API calls:** Always use `axiosWrapper()` for backend requests
4. **User permissions:** Check `groups` array from AuthContext (e.g., `['Admin']`, `['Organizer']`)
5. **Theming:** Import theme from `theme.js` and wrap with MUI ThemeProvider

## Testing

### Backend Tests
- Framework: pytest with pytest-django
- Configuration: `pytest.ini` sets `DJANGO_SETTINGS_MODULE=config.settings.test`
- Run from backend directory: `pytest`

### Frontend Tests
- Framework: Jest + React Testing Library
- Run: `yarn test` from frontend directory
- Note: Custom axios transform pattern required

## Common Issues

1. **Backend can't connect to DB:** Ensure `.envs/.postgres` file exists with correct credentials
2. **Frontend can't reach backend:** Check `REACT_APP_BACKEND_ADDRESS` in frontend environment
3. **Token authentication fails:** Clear localStorage and re-login
4. **Docker volume issues:** Use `docker-compose -f local.yml down -v` to remove volumes and restart

## Code Organization Notes

- **Django apps follow domain-driven design:** Users and Compos are separate bounded contexts
- **Frontend uses component co-location:** Related components in feature directories (e.g., `components/user/`)
- **Shared utilities:** Frontend utils in `utils/`, backend utils in `dpms/utils/`
- **Custom package:** `@dpms-freemem/` contains reusable UI components (MainBar, Content)
