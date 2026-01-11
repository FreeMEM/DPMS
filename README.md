# DPMS - Demo Party Management System

A modern, secure web application for managing demoscene parties, competitions, productions, voting systems, and live event presentation (StageRunner).

## About

DPMS is designed as a more secure and internet-ready alternative to existing party management systems like wuhu. While traditional PMS solutions work well as intranet applications during events, DPMS focuses on security, user management, and the ability to run online before, during, and after the party.

### Background

I'm computing passionated since 1984. I organized RadyKal Party at Granada, Spain in 1998 and I visit every years another Amiga Parties around Spain. The last years I've collaborated with Posadas Party and Capacitor Party. I began to develop a web application to manage the next Capacitor Amiga Party but the pandemic cancelled the project. Last summer (2022), Posadas Party celebrated a new edition and we needed a tool for the people to vote the competitions. We used wuhu, a well known Party Management System (PMS) written in PHP programing language. I liked its functions and how manages the data to the competitions and its "beamer" system. But its register system it's too simple and insecure. Wuhu it's though more like a intranet application used only for the event day. But I would want something more secure to keep online on internet.

## Features

- **User Management**: Secure registration and authentication system with email verification
- **Edition Management**: Create party editions with custom logo, poster, and configurable glow effects
- **Competition Management (Compos)**: Create and manage different competition categories
- **Production Submissions**: Allow sceners to submit their productions (demos, music, graphics, etc.)
- **Voting System**: Enable attendees to vote on competition entries
- **StageRunner**: Fullscreen presentation system for displaying productions on projector/big screen during events
- **Role-based Access**: Different permissions for Admins, Organizers, and Sceners
- **Multi-language Support**: Built with i18n support (currently Spanish/English)
- **Animated 3D Backgrounds**: Multiple WebGL effects (Hyperspace, Wave, Energy Grid, TRON Grid) with automatic rotation
- **Dynamic Branding**: Edition logo with configurable glow effect displayed across login, signup, and main application
- **SEO-friendly Landing Page**: Public-facing page with event information, countdown timer, and animated backgrounds
- **Admin Dashboard**: Full-featured administration panel for managing editions, competitions, productions, and users
- **REST API**: Full-featured API with Swagger documentation

## Technology Stack

- **Backend**: Django 4.x + Django REST Framework + PostgreSQL
- **Frontend**: React 18 + Material-UI + React Router v6
- **3D Graphics**: Three.js for WebGL background effects
- **Containerization**: Docker & Docker Compose
- **Authentication**: Token-based authentication (DRF Token + JWT)

## Prerequisites

- Docker and Docker Compose
- Node.js 18+ and Yarn (for frontend development)
- Python 3.9+ (for backend development without Docker)

## Quick Start

### 1. Clone the repository

```bash
git clone https://github.com/yourusername/DPMS.git
cd DPMS
```

### 2. Set up environment variables

Create the environment files in `.envs/` directory:

**.envs/.django**
```env
# Django
DJANGO_SECRET_KEY=your-secret-key-here-change-in-production

# Redis (for Celery)
REDIS_URL=redis://redis:6379/0

# Celery Flower (task monitoring)
CELERY_FLOWER_USER=your-flower-user
CELERY_FLOWER_PASSWORD=your-flower-password

# SceneID OAuth (optional, for SceneID login)
SCENE_CLIENT_ID=your-sceneid-client-id
SCENEID_CLIENT_SECRET=your-sceneid-client-secret
```

**.envs/.postgres**
```env
POSTGRES_HOST=postgres
POSTGRES_PORT=5432
POSTGRES_DB=dpms
POSTGRES_USER=dpms_user
POSTGRES_PASSWORD=dpms_password
```

**frontend/.env** (optional, for development)
```env
REACT_APP_BACKEND_ADDRESS=http://localhost:8000
```

### 3. Start the backend with Docker Compose

```bash
docker compose -f local.yml up -d
```

This will start:
- PostgreSQL database
- Django backend API on http://localhost:8000

### 4. Install frontend dependencies and start development server

```bash
cd frontend
yarn install
yarn start
```

Frontend will be available at http://localhost:3000

### 5. Create a superuser (optional)

```bash
docker compose -f local.yml exec backend_party python manage.py createsuperuser
```

## Development

### Backend Development

**Access Django admin panel:**
```
http://localhost:8000/admin/
```

**View API documentation (Swagger):**
```
http://localhost:8000/docs/
```

**Run migrations:**
```bash
docker compose -f local.yml exec backend_party python manage.py migrate
```

**Create new migrations:**
```bash
docker compose -f local.yml exec backend_party python manage.py makemigrations
```

**Run backend tests:**
```bash
docker compose -f local.yml exec backend_party pytest
```

**Access Django shell:**
```bash
docker compose -f local.yml exec backend_party python manage.py shell
```

### Frontend Development

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

**Configure backend URL:**

Create a `.env` file in the `frontend/` directory:
```env
REACT_APP_BACKEND_ADDRESS=http://localhost:8000
```

### Stopping the application

**Stop all services:**
```bash
docker compose -f local.yml down
```

**Stop frontend:**
Press `Ctrl+C` in the terminal running `yarn start`

## Production Deployment

For production deployment, use the production Docker Compose file:

```bash
docker compose -f production.yml up -d
```

**Important security considerations:**
- Change `DJANGO_SECRET_KEY` to a strong random value
- Set `DJANGO_DEBUG=False`
- Configure proper `DJANGO_ALLOWED_HOSTS`
- Use strong database passwords
- Set up HTTPS/SSL certificates
- Configure proper CORS settings

**Additional production environment variables (.envs/.django):**
```env
# Email configuration (required for user verification)
EMAIL_HOST=smtp.your-provider.com
EMAIL_HOST_USER=your-email@domain.com
EMAIL_HOST_PASSWORD=your-email-password
EMAIL_PORT=587

# Frontend URL (for email links)
FRONTEND_URL=https://your-domain.com/app
```

## Project Structure

```
DPMS/
├── backend/              # Django REST API
│   ├── config/          # Django settings and main URLs
│   ├── dpms/            # Main Django apps
│   │   ├── users/       # User authentication and management
│   │   ├── compos/      # Competitions and productions
│   │   ├── website/     # Landing page (SSR)
│   │   └── utils/       # Shared utilities
│   └── requirements/    # Python dependencies
├── frontend/            # React application (SPA)
│   ├── src/
│   │   ├── @dpms-freemem/      # Core UI components (MainBar, Content)
│   │   ├── components/         # React components
│   │   │   ├── admin/          # Admin panel components
│   │   │   │   └── common/     # Shared admin components (LoadingSpinner, StatusChip, etc.)
│   │   │   ├── common/         # Shared components (ThreeBackground, backgroundEffects)
│   │   │   ├── user/           # Auth components (Login, Signup)
│   │   │   └── productions/    # Production management
│   │   ├── pages/              # Page components
│   │   │   └── admin/          # Admin pages (Editions, Compos, Productions)
│   │   ├── effects/            # Visual effects (ParticleEffects)
│   │   ├── utils/              # Frontend utilities (AxiosWrapper, dateFormatting)
│   │   └── routes.js           # Application routing
│   └── package.json
├── stagerunner/         # StageRunner presentation app (separate React app)
│   ├── src/
│   │   ├── components/  # Presentation components
│   │   ├── screens/     # Display screens
│   │   ├── services/    # API client with caching
│   │   └── hooks/       # Custom hooks (keyboard, slideshow)
│   └── package.json
├── docker/              # Docker configurations
├── .envs/              # Environment variables (gitignored)
├── local.yml           # Local development Docker Compose
├── production.yml      # Production Docker Compose
├── TECHNICAL_SPEC.md   # Complete technical specification
├── STAGERUNNER_SPEC.md # StageRunner detailed specification
└── CLAUDE.md           # Development guidelines
```

## Application URLs

- **Landing Page**: `http://localhost:8000/` (Django SSR)
- **User Application**: `http://localhost:3000/app/` (React SPA - development)
- **Admin Panel**: `http://localhost:8000/admin/` (Django admin)
- **API Documentation**: `http://localhost:8000/docs/` (Swagger)
- **StageRunner**: `http://localhost:3001/` (React - when implemented)

## API Endpoints

Main API endpoints:

- `POST /api/users/signup/` - User registration
- `POST /api/users/login/` - User authentication
- `GET /api/users/verify?token=<token>` - Email verification
- `GET /api/editions/` - List editions
- `GET /api/compos/` - List competitions
- `GET /api/productions/` - List productions
- `GET /api/productions/my_productions/` - User's productions (authenticated)
- `GET /api/files/` - List files
- `POST /api/files/` - Upload file (multipart, authenticated)
- `GET /api/files/{id}/download/` - Download file
- `GET /docs/` - Full Swagger API documentation

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Author

FreeMem - Demoscene enthusiast and party organizer since 1984

## Acknowledgments

- **Wuhu Team**: Special thanks to the wuhu Party Management System development team for their excellent work. Wuhu has been an inspiration and a reference for this project, showing me what a party management system should be. I hope to contribute to the demoscene with new technologies while building upon the solid foundation they established.
- Built with love for the demoscene community
- Special thanks to Posadas Party and Capacitor Party organizers for their support and feedback
