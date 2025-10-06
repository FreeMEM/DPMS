# DPMS - Demo Party Management System

A modern, secure web application for managing demoscene parties, competitions, productions, and voting systems.

## About

DPMS is designed as a more secure and internet-ready alternative to existing party management systems like wuhu. While traditional PMS solutions work well as intranet applications during events, DPMS focuses on security, user management, and the ability to run online before, during, and after the party.

### Background

I'm computing passionated since 1984. I organized RadyKal Party at Granada, Spain in 1998 and I visit every years another Amiga Parties around Spain. The last years I've collaborated with Posadas Party and Capacitor Party. I began to develop a web application to manage the next Capacitor Amiga Party but the pandemic cancelled the project. Last summer (2022), Posadas Party celebrated a new edition and we needed a tool for the people to vote the competitions. We used wuhu, a well known Party Management System (PMS) written in PHP programing language. I liked its functions and how manages the data to the competitions and its "beamer" system. But its register system it's too simple and insecure. Wuhu it's though more like a intranet application used only for the event day. But I would want something more secure to keep online on internet.

## Features

- **User Management**: Secure registration and authentication system with email verification
- **Competition Management (Compos)**: Create and manage different competition categories
- **Production Submissions**: Allow sceners to submit their productions (demos, music, graphics, etc.)
- **Voting System**: Enable attendees to vote on competition entries
- **Role-based Access**: Different permissions for Admins, Organizers, and Sceners
- **Multi-language Support**: Built with i18n support (currently Spanish/English)
- **REST API**: Full-featured API with Swagger documentation

## Technology Stack

- **Backend**: Django 4.x + Django REST Framework + PostgreSQL
- **Frontend**: React 18 + Material-UI + React Router v6
- **Containerization**: Docker & Docker Compose
- **Authentication**: Token-based authentication

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
DJANGO_DEBUG=True
DJANGO_SECRET_KEY=your-secret-key-here-change-in-production
DJANGO_ALLOWED_HOSTS=localhost,127.0.0.1,backend_party
```

**.envs/.postgres**
```env
POSTGRES_HOST=postgres
POSTGRES_PORT=5432
POSTGRES_DB=dpms
POSTGRES_USER=dpms_user
POSTGRES_PASSWORD=dpms_password
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
cd backend
pytest
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

## Project Structure

```
DPMS/
├── backend/              # Django REST API
│   ├── config/          # Django settings and main URLs
│   ├── dpms/            # Main Django apps
│   │   ├── users/       # User authentication and management
│   │   ├── compos/      # Competitions and productions
│   │   └── utils/       # Shared utilities
│   └── requirements/    # Python dependencies
├── frontend/            # React application
│   ├── src/
│   │   ├── components/  # React components
│   │   ├── utils/       # Frontend utilities
│   │   └── routes.js    # Application routing
│   └── package.json
├── docker/              # Docker configurations
├── .envs/              # Environment variables (gitignored)
├── local.yml           # Local development Docker Compose
└── production.yml      # Production Docker Compose
```

## API Endpoints

Main API endpoints:

- `POST /users/signup/` - User registration
- `POST /users/login/` - User authentication
- `GET /users/verify?token=<token>` - Email verification
- `GET /users/` - List users (authenticated)
- `GET /docs/` - Swagger API documentation

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
