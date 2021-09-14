#!/usr/bin/env bash

set -eu

apk update && apk add postgresql-dev gcc python3-dev musl-dev

pip -q install --upgrade pip
pip -q install --cache-dir=.pip -r requirements.txt
pip check

python manage.py runserver 0.0.0.0:8000
