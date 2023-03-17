#!/usr/bin/env bash

set -euo pipefail

echo "Migrating main schema"
alembic upgrade head

echo "Migrating DB From AkvoResponseGrouper Dependency"
akvo-responsegrouper --config $(echo "./source/${INSTANCE_NAME}/category.json") --database $(echo $DATABASE_URL | sed 's/-/_/g')

echo "Running tests"
COVERAGE_PROCESS_START=./.coveragerc \
  coverage run --parallel-mode --concurrency=thread,gevent --rcfile=./.coveragerc \
  /usr/local/bin/pytest -vvv -rP

echo "Coverage"
coverage combine --rcfile=./.coveragerc
coverage report -m --rcfile=./.coveragerc

if [[ -n "${COVERALLS_REPO_TOKEN:-}" ]] ; then
  coveralls
fi

./storage.sh clear
flake8
