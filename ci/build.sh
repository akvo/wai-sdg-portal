#!/usr/bin/env bash
#shellcheck disable=SC2039

set -exuo pipefail

[[ -n "${CI_TAG:=}" ]] && { echo "Skip build"; exit 0; }

image_prefix="eu.gcr.io/akvo-lumen/idh-ipd"

# Normal Docker Compose
dc () {
    docker-compose \
        --ansi never \
        "$@"
}

# Docker compose using CI env
dci () {
    dc -f docker-compose.yml \
       -f docker-compose.ci.yml "$@"
}

backend_build () {

    docker build \
        --tag "${image_prefix}/backend:latest" \
        --tag "${image_prefix}/backend:${CI_COMMIT}" backend
}


backend_build

#test-connection
if ! dci run -T ci ./basic.sh; then
  dci logs
  echo "Build failed when running basic.sh"
  exit 1
fi
