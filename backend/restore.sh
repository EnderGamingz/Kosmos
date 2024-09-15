#!/bin/bash

# Ensure required environment variables are set
if [ -z "$DATABASE_URL" ]; then
  echo "Error: One or more required environment variables are missing."
  echo "Required variables: DATABASE_URL, BACKUP_DIR, UPLOAD_LOCATION"
  exit 1
fi


# Get backup file name from argument
if [ -z "$1" ]; then
  echo "Error: No backup file name provided."
  exit 1
fi

BACKUP_FILE="$1"

# Check that file exists
if [ ! -f "$BACKUP_FILE" ]; then
  echo "Error: Backup file $BACKUP_FILE does not exist."
  exit 1
fi

# Uncompress the backup file
echo "Decompressing backup file..."


if tar -xzvf "$BACKUP_FILE"; then
  echo "Backup file decompressed successfully."
  echo "Backed up files restored successfully."
else
  echo "Error decompressing backup file!" >&2
  exit 1
fi


# Parse DATABASE_URL
DB_USER=$(echo "$DATABASE_URL" | sed -r 's/.*:\/\/([^:]+):.*/\1/')
DB_PASSWORD=$(echo "$DATABASE_URL" | sed -r 's/.*:\/\/[^:]+:([^@]+)@.*/\1/')
DB_HOST=$(echo "$DATABASE_URL" | sed -r 's/.*@([^:]+):.*/\1/')
DB_PORT=$(echo "$DATABASE_URL" | sed -r 's/.*:([0-9]+)\/.*/\1/')
DB_NAME=$(echo "$DATABASE_URL" | sed -r 's/.*\/([^?]+).*/\1/')

echo "Restoring PostgreSQL database..."

# Find restore .sql file in ./backup
BACKUP_DIR="./backup"
FILE_NAME=$(find "$BACKUP_DIR" -name "*.dump" -print -quit)
echo "Restore file found: $FILE_NAME"

echo "Restoring database..."
# Restore the PostgreSQL database
export PGPASSWORD=$DB_PASSWORD

if pg_restore --clean --if-exists -U "$DB_USER" -h "$DB_HOST" -p "$DB_PORT" -d "$DB_NAME" "$FILE_NAME"; then
  echo "Database restore completed successfully."
else
  echo "Error restoring database!" >&2
  echo "Cleaning up..."
  rm -f "$FILE_NAME"
  exit 1
fi


# Clean up
echo "Cleaning up..."
rm -f "$FILE_NAME"

echo "Restore completed successfully."
echo "You can now remove the backup file: $BACKUP_FILE"
exit 1