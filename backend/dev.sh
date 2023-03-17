#!/usr/bin/env bash
# shellcheck disable=SC2155

set -eu
pip -q install --upgrade pip
pip -q install --cache-dir=.pip -r requirements.txt
pip check

alembic upgrade head

<<<<<<< Updated upstream
=======
CATEGORIES="./source/${INSTANCE_NAME}/category.json"

if [ -f "${CATEGORIES}" ]; then
  echo "${CATEGORIES} exists"
	# akvo-responsegrouper --config $(echo "./source/${INSTANCE_NAME}/category.json") --database $(echo $DATABASE_URL | sed 's/-/_/g')
	echo "done"
fi

>>>>>>> Stashed changes
uvicorn main:app --reload --port 5000
