#!/usr/bin/env bash

if [[ $1 == "up" ]]; then
rm -rf docs/"${INSTANCE_NAME}"/build/html/*
docker run -it --rm -v "$(pwd)/docs/${INSTANCE_NAME}:/docs" \
    akvo/akvo-sphinx:20220829.093307.b5bbf28 make html
fi

COMPOSE_HTTP_TIMEOUT=180 docker compose -f docker-compose.yml -f docker-compose.custom-storage.yml -f docker-compose-docker-sync.yml "$@"
