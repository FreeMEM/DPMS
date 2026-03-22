FROM python:3.10-slim

ENV PYTHONDONTWRITEBYTECODE=1
ENV PYTHONUNBUFFERED=1

WORKDIR /app

# Install system dependencies for psycopg2
RUN apt-get update && apt-get install -y --no-install-recommends \
    libpq-dev gcc ffmpeg \
    && rm -rf /var/lib/apt/lists/*

ADD ./backend/requirements /app/backend/requirements
RUN pip install --upgrade pip \
    && pip install --no-cache-dir -r backend/requirements/production.txt

ADD ./backend /app/backend
ADD ./docker /app/docker

RUN chmod +x /app/docker/backend/wsgi-entrypoint-prod.sh
