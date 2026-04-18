FROM python:3.10-slim

ENV PYTHONDONTWRITEBYTECODE=1
ENV PYTHONUNBUFFERED=1

WORKDIR /app

# Install system dependencies for psycopg2, ffmpeg and gettext (for compilemessages)
RUN apt-get update && apt-get install -y --no-install-recommends \
    libpq-dev gcc libc6-dev ffmpeg gettext \
    && rm -rf /var/lib/apt/lists/*

ADD ./backend/requirements /app/backend/requirements
RUN --mount=type=cache,target=/root/.cache/pip \
    pip install --upgrade pip \
    && pip install -r backend/requirements/production.txt

ADD ./backend /app/backend
ADD ./docker /app/docker

# Compile i18n .mo files so Django picks up translations at runtime
RUN cd /app/backend && django-admin compilemessages

RUN chmod +x /app/docker/backend/wsgi-entrypoint-prod.sh
