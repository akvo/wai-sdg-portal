#!/bin/bash
set -euo pipefail

# Check if Docker is already installed
if ! [ -x "$(command -v docker)" ]; then
    echo 'Docker is not installed. Follow this installation instruction https://docs.docker.com/engine/install/'
else
    echo 'Docker is already installed.'
fi

# Function to start SSL registration with Certbot and Letsencrypt SSL
ssl_renew () {
    source .env
    # Obtain domain name from .env file
    domain=$(echo $WEBDOMAIN | awk -F/ '{print $3}')

    # skip ssl registration if domain is localhost or 127.0.0.1
    if [ $domain == "localhost" ] || [ $domain == "127.0.0.1" ]; then
        echo "Skipping SSL renew for localhost and 127.0.0.1."
        return
    fi

    # Stop current frontend container
    docker compose stop frontend_ssl

    # Start renew ssl
    DOMAIN=${domain} docker compose up -d nginx_certbot
    docker compose run --rm  certbot renew
    docker compose stop nginx_certbot

    # Start again frontend container with new ssl
    DOMAIN=${domain} docker compose build frontend --no-cache
    DOMAIN=${domain} docker compose up -d frontend_ssl
}

ssl_renew
