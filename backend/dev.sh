#!/usr/bin/env bash
# shellcheck disable=SC2155

set -eu
pip -q install --upgrade pip
pip -q install --cache-dir=.pip -r requirements.txt
pip check

alembic upgrade head

CATEGORIES="./source/${INSTANCE_NAME}/category.json"

if [ -f "${CATEGORIES}" ]; then
  echo "${CATEGORIES} exists"
	akvo-responsegrouper --config "./source/${INSTANCE_NAME}/category.json"
	echo "done"
fi

uvicorn main:app --reload --port 5000
