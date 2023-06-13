#!/bin/bash
set -euv

source .env

USER=postgres
PASSWORD=$POSTGRES_PASSWORD
DB=postgres
HOST=172.17.0.1
DATE=$(date +%Y%m%d-%H-%M-%S)
BACKUPPATH=~/BACKUP_DB_WAI

mkdir -p $BACKUPPATH
FILE_BACKUP="$BACKUPPATH/"FULL-BACKUP-$INSTANCE_NAME"_$DATE.dump";

echo "-------------------------- Backuping DB $INSTANCE_NAME --------------------------"
docker run -e PGPASSWORD=${PASSWORD} --rm postgres:12-alpine pg_dump -U ${USER} -h ${HOST} -p 5432 -Fc $INSTANCE_NAME > $FILE_BACKUP;
echo "-------------------------- DB $INSTANCE_NAME has been backed up --------------------------"
