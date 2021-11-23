#!/usr/bin/env bash

set -eu

alembic upgrade head

python worker.py
