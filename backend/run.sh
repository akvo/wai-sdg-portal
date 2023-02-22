#!/usr/bin/env bash

if [[ -z "${SKIP_MIGRATION}" ]]; then
    alembic upgrade head
fi

if [[ "${SANDBOX_STATUS}" = "true" ]]; then
	echo "This is sandbox"
	echo "${SANDBOX_DATA_SOURCE}"
fi

python main.py
