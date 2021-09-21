#!/usr/bin/env bash
set -eu
pip -q install --upgrade pip
pip -q install --cache-dir=.pip -r requirements.txt
pip check

alembic upgrade head

uvicorn main:app --reload --port 5000
