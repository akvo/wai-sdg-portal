#!/usr/bin/env bash

alembic upgrade head

if [ "${SANDBOX_STATUS}" = "true" ]; then
	echo "This is sandbox"
	echo "${SANDBOX_DATA_SOURCE}"
fi

python main.py
