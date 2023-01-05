#!/usr/bin/env bash
#shellcheck disable=SC2039

set -exuo pipefail

INSTANCES="wai-ethiopia wai-uganda wai-bangladesh wai-nepal wai-demo"

[[ -n "${CI_TAG:=}" ]] && { echo "Skip build"; exit 0; }

image_prefix="eu.gcr.io/akvo-lumen/wai-sdg-portal"

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

documentation_build () {
    for INSTANCE in ${INSTANCES}
    do
        echo "Build ${INSTANCE} documentation"
        docker run -it --rm -v "$(pwd)/docs/${INSTANCE}:/docs" \
            akvo/akvo-sphinx:20220525.082728.594558b make html
        mkdir -p frontend/build/docs/${INSTANCE}
        cp -r docs/${INSTANCE}/build/html frontend/build/docs/${INSTANCE}

    done
}


frontend_build () {

    echo "PUBLIC_URL=/" > frontend/.env

    sed 's/"warn"/"error"/g' < frontend/.eslintrc.json > frontend/.eslintrc.prod.json

    dc run \
       --rm \
       --no-deps \
       frontend \
       bash release.sh

    docker build \
        --tag "${image_prefix}/frontend:latest" \
        --tag "${image_prefix}/frontend:${CI_COMMIT}" frontend
}

backend_build () {

    docker build \
        --tag "${image_prefix}/backend:latest" \
        --tag "${image_prefix}/backend:${CI_COMMIT}" backend

    # Test and Code Quality
    dc -f docker-compose.test.yml \
        -p backend-test \
        run --rm -T backend ./test.sh

}

worker_build () {

    docker build \
        --tag "${image_prefix}/worker:latest" \
        --tag "${image_prefix}/worker:${CI_COMMIT}" backend -f ./backend/Dockerfile.worker

}


worker_build
backend_build
frontend_build
documentation_build

#test-connection
if ! dci run -T ci ./basic.sh; then
  dci logs
  echo "Build failed when running basic.sh"
  exit 1
fi
