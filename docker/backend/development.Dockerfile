FROM python:3.10

WORKDIR /app
ADD ./backend/requirements /app/backend/requirements

RUN pip install --upgrade pip
RUN pip install -r backend/requirements/local.txt

ADD ./backend /app/backend
ADD ./docker /app/docker
