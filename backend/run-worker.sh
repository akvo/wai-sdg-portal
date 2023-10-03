#!/usr/bin/env bash

CATEGORIES="./source/${INSTANCE_NAME}/category.json"

if [ "${SANDBOX_STATUS}" = "true" ]; then
	echo "This is sandbox"
	echo "${SANDBOX_DATA_SOURCE}"
	CATEGORIES="./source/${SANDBOX_DATA_SOURCE}/category.json"
fi

# Copy the content of $CATEGORIES to "./.category.json"
echo "$(<"$CATEGORIES")" > "./.category.json"

python worker.py
