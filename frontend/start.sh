#!/usr/bin/env bash

echo PUBLIC_URL="/" > .env
echo GENERATE_SOURCEMAP="false" >> .env
echo REACT_APP_AUTH0_DOMAIN="$AUTH0_DOMAIN" >> .env
echo REACT_APP_AUTH0_CLIENT_ID="$AUTH0_CLIENT_ID" >> .env
yarn install --no-progress --frozen-lock
yarn start
