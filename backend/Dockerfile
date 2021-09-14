# syntax=docker/dockerfile:1
FROM python:3.9.7-slim-buster

ENV PYTHONUNBUFFERED=1
WORKDIR /usr/src/app

COPY . .

RUN set -e; \
    pip -q install --upgrade pip && \
    pip -q install --no-cache-dir -r requirements.txt && \
    pip check
