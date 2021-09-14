# syntax=docker/dockerfile:1
FROM python:3.9.7-slim-buster

WORKDIR /usr/src/app

ENV PYTHONDONTWRITEBYTECODE 1
ENV PYTHONUNBUFFERED 1

COPY . .

RUN apk update \
    && apk add postgresql-dev gcc python3-dev musl-dev

RUN set -e; \
    pip -q install --upgrade pip && \
    pip -q install --no-cache-dir -r requirements.txt && \
    pip check
