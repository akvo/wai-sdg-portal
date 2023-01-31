#!/usr/bin/env bash

if [[ -z "${SKIP_MIGRATION}" ]]; then
    alembic upgrade head
    akvo-responsegrouper --config $(echo "./source/${INSTANCE_NAME}/category.json")
fi

python main.py
