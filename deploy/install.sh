#!/bin/bash

# Check if Docker is already installed
if ! [ -x "$(command -v docker)" ]; then
    echo 'Docker is not installed. Follow this installation instruction https://docs.docker.com/engine/install/'
else
    echo 'Docker is already installed.'
fi

docker compose up --build frontend_build
docker compose up --build documentation_build
docker compose up -d --build db
docker compose up -d --build backend
docker compose up -d --build worker
docker compose up -d --build frontend
