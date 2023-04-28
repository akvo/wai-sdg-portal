#!/usr/bin/env bash
# shellcheck disable=SC2155

set -eu
pip -q install --upgrade pip
pip -q install --cache-dir=.pip -r requirements.txt
pip check

CATEGORIES="./source/${INSTANCE_NAME}/category.json"

if [ -f "${CATEGORIES}" ]; then
  echo "${CATEGORIES} exists"
	akvo-responsegrouper -c ${CATEGORIES}
	echo "done"
fi

uvicorn worker:worker --reload --port 5001
