#!/bin/bash
set -eu

source .env

USER=$WAI_DB_USER
PASSWORD=$WAI_DB_PASSWORD
HOST=db
DATE=$(date +%Y%m%d-%H-%M-%S)
BACKUPPATH=~/WAI_BACKUP

mkdir -p $BACKUPPATH/DB
mkdir -p $BACKUPPATH/FILE_UPLOAD

# Backup DB
DB_BACKUP_PATH="$BACKUPPATH/DB/"FULL-BACKUP-$INSTANCE_NAME"_$DATE.dump";
echo "-------------------------- Backup DB $INSTANCE_NAME --------------------------"
docker compose run -e PGPASSWORD=${PASSWORD} --rm db_backup pg_dump -U ${USER} -h ${HOST} -p 5432 -Fc $INSTANCE_NAME > $DB_BACKUP_PATH;
echo "-------------------------- DB $INSTANCE_NAME has been backed up --------------------------"


echo "-------------------------- Backup files on $INSTANCE_NAME --------------------------"
# Backup File Upload
FILE_UPLOAD_BACKUP_PATH="$BACKUPPATH/FILE_UPLOAD/"FULL-BACKUP-$INSTANCE_NAME"_$DATE";
docker cp backend:/data/storage $FILE_UPLOAD_BACKUP_PATH
echo "-------------------------- Files on $INSTANCE_NAME has been backed up --------------------------"
