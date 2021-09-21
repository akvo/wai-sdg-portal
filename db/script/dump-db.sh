#!/usr/bin/env bash
#shellcheck disable=SC2016

set -eu

docker-compose exec -T db bash -c 'pg_dump --user wai --clean --create --format plain wai_ethiopia > /docker-entrypoint-initdb.d/001-init.sql; echo "Export done"'
