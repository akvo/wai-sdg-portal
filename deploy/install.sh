#!/bin/bash
set -euo pipefail

# Check if Docker is already installed
if ! [ -x "$(command -v docker)" ]; then
    echo 'Docker is not installed. Follow this installation instruction https://docs.docker.com/engine/install/'
else
    echo 'Docker is already installed.'
fi



# Function to start SSL registration with Certbot and Letsencrypt SSL
ssl_registration () {
    source .env
    # Obtain domain name from .env file
    domain=$(echo $WEBDOMAIN | awk -F/ '{print $3}')

    # skip ssl registration if domain is localhost or 127.0.0.1
    if [ $domain == "localhost" ] || [ $domain == "127.0.0.1" ]; then
        echo "Skipping SSL registration for localhost and 127.0.0.1."
        return
    fi

    # Start ssl registration
    DOMAIN=${domain} docker compose up -d nginx_certbot
    docker compose run --rm  certbot certonly -m $CERTBOT_EMAIL --agree-tos --no-eff-email --webroot --webroot-path /var/www/certbot/ -v -d ${domain}
    docker compose stop nginx_certbot
}


config_alter () {
    source .env

    # Update the values in the JavaScript config file
    sed -i "s|AUTH0_DOMAIN = \".*\";|AUTH0_DOMAIN = \"$AUTH0_SPA_DOMAIN\";|" ../backend/source/$INSTANCE_NAME/config.js
    sed -i "s|AUTH0_CLIENT_ID = \".*\";|AUTH0_CLIENT_ID = \"$AUTH0_SPA_CLIENT_ID\";|" ../backend/source/$INSTANCE_NAME/config.js
}


cleanup_artifact () {
    docker compose up --build documentation_build_cleanup
    docker compose up --build frontend_build_cleanup
    git checkout ../frontend/.env
}

# Start build application with docker compose
start_build () {

    cleanup_artifact

    # start docker container
    docker compose up --build frontend_build
    docker compose up --build documentation_build
    docker compose up -d --build db
    docker compose up -d --build backend
    docker compose up -d --build worker
    if [ $domain == "localhost" ] || [ $domain == "127.0.0.1" ]; then
        docker compose up -d --build frontend
    else
        DOMAIN=${domain} docker compose up -d --build frontend_ssl
    fi

    cleanup_artifact

}

ssl_registration
config_alter
start_build
