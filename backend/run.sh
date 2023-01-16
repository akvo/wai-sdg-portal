#!/usr/bin/env bash

# if [[ -z "${SKIP_MIGRATION}" ]]; then
#     alembic upgrade head
# fi
alembic upgrade head

python main.py
