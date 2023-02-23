#!/usr/bin/env bash

alembic upgrade head

CATEGORIES="./source/${INSTANCE_NAME}/category.json"

if [ "${SANDBOX_STATUS}" = "true" ]; then
	echo "This is sandbox"
	echo "${SANDBOX_DATA_SOURCE}"
	CATEGORIES="./source/${SANDBOX_DATA_SOURCE}/category.json"
fi

if [ -f "${CATEGORIES}" ]; then
  echo "${CATEGORIES} exists"
	akvo-responsegrouper -c ${CATEGORIES}
	echo "done"
fi

if [[ -z "${SKIP_MIGRATION}" ]]; then
    alembic upgrade head
    akvo-responsegrouper --config $(echo "./source/${INSTANCE_NAME}/category.json") --database $(echo $DATABASE_URL | sed 's/-/_/g')
fi

python main.py
