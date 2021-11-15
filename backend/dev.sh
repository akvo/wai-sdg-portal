#!/usr/bin/env bash
# shellcheck disable=SC2155

set -eu
pip -q install --upgrade pip
pip -q install --cache-dir=.pip -r requirements.txt
pip check

export DATABASE_URL=${DATABASE_URL//-/_}
echo "$DATABASE_URL"

alembic upgrade head

uvicorn main:app --reload --port 5000
