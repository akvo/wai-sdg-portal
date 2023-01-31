#!/usr/bin/env bash
# shellcheck disable=SC2155

set -eu
pip -q install --upgrade pip
pip -q install --cache-dir=.pip -r requirements.txt
pip check

alembic upgrade head
akvo-responsegrouper --config "./source/${INSTANCE_NAME}/category.json" --database $(echo $DATABASE_URL | sed 's/-/_/g')

uvicorn main:app --reload --port 5000
