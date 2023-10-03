#!/usr/bin/env bash
# shellcheck disable=SC2155

set -eu
pip -q install --upgrade pip
pip -q install --cache-dir=.pip -r requirements.txt
pip check

CATEGORIES="./source/${INSTANCE_NAME}/category.json"

if [ "${SANDBOX_STATUS}" = "true" ]; then
	echo "This is sandbox"
	echo "${SANDBOX_DATA_SOURCE}"
	CATEGORIES="./source/${SANDBOX_DATA_SOURCE}/category.json"
fi

# Copy the content of $CATEGORIES to "./category.json"
echo "$(<"$CATEGORIES")" > "./category.json"

uvicorn worker:worker --reload --port 5001
