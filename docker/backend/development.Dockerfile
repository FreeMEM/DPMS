FROM python:3.10

RUN apt-get update && apt-get install -y --no-install-recommends ffmpeg \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app
ADD ./backend/requirements /app/backend/requirements

RUN pip install --upgrade pip
RUN pip install -r backend/requirements/local.txt

ADD ./backend /app/backend
ADD ./docker /app/docker
