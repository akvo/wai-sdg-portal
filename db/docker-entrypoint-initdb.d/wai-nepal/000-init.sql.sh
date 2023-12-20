#!/bin/bash
set -e

psql -v ON_ERROR_STOP=1 --username "postgres" <<-EOSQL
	CREATE USER "${WAI_DB_USER}" WITH CREATEDB PASSWORD '${WAI_DB_PASSWORD}';
EOSQL


psql -v ON_ERROR_STOP=1 --username "postgres" <<-EOSQL
CREATE DATABASE "wai-nepal"
WITH OWNER = "${WAI_DB_USER}"
     TEMPLATE = template0
     ENCODING = 'UTF8'
     LC_COLLATE = 'en_US.UTF-8'
     LC_CTYPE = 'en_US.UTF-8';

CREATE DATABASE "wai-nepal_test"
WITH OWNER = "${WAI_DB_USER}"
     TEMPLATE = template0
     ENCODING = 'UTF8'
     LC_COLLATE = 'en_US.UTF-8'
     LC_CTYPE = 'en_US.UTF-8';
EOSQL
