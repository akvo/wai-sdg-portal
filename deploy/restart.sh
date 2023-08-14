#!/bin/bash
set -euo pipefail

# Check if Docker is already installed
if ! [ -x "$(command -v docker)" ]; then
    echo 'Docker is not installed. Follow this installation instruction https://docs.docker.com/engine/install/'
else
    echo 'Docker is already installed.'
fi



# Restart application with docker compose
restart_service () {

    source .env
    # Obtain domain name from .env file
    domain=$(echo $WEBDOMAIN | awk -F/ '{print $3}')

    # restart docker container
    docker compose restart db
    docker compose restart backend
    docker compose restart worker
    if [ $domain == "localhost" ] || [ $domain == "127.0.0.1" ]; then
        docker compose restart frontend
    else
        DOMAIN=${domain} docker compose restart frontend_ssl
    fi

}

restart_service
