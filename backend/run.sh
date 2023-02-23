#!/usr/bin/env bash

alembic upgrade head

if [ "${SANDBOX_STATUS}" = "true" ]; then
	echo "This is sandbox"
	echo "${SANDBOX_DATA_SOURCE}"
fi

if test -f "./source/${SANDBOX_DATA_SOURCE}/category.json"; then
  echo "category.json exists"
	akvo-responsegrouper -c "./source/${SANDBOX_DATA_SOURCE}/category.json"
	echo "done"
fi

python main.py
