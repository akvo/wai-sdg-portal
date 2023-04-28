#!/usr/bin/env bash

set -eu

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

python worker.py
