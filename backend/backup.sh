#!/bin/bash

# Ensure required environment variables are set
if [ -z "$DATABASE_URL" ] || [ -z "$UPLOAD_LOCATION" ]; then
  echo "Error: One or more required environment variables are missing."
  echo "Required variables: DATABASE_URL, BACKUP_DIR, UPLOAD_LOCATION"
  exit 1
fi

if [ ! -d "$UPLOAD_LOCATION" ]; then
  echo "Error: Uploads directory $UPLOAD_LOCATION does not exist!"
  exit 1
fi


BACKUP_DIR="./backup"

# Create backup directory if it doesn't exist
if [ ! -d "$BACKUP_DIR" ]; then
  echo "Creating backup directory..."
  mkdir -p "$BACKUP_DIR"
fi


# Parse DATABASE_URL
DB_USER=$(echo "$DATABASE_URL" | sed -r 's/.*:\/\/([^:]+):.*/\1/')
DB_PASSWORD=$(echo "$DATABASE_URL" | sed -r 's/.*:\/\/[^:]+:([^@]+)@.*/\1/')
DB_HOST=$(echo "$DATABASE_URL" | sed -r 's/.*@([^:]+):.*/\1/')
DB_PORT=$(echo "$DATABASE_URL" | sed -r 's/.*:([0-9]+)\/.*/\1/')
DB_NAME=$(echo "$DATABASE_URL" | sed -r 's/.*\/([^?]+).*/\1/')

# Load PGPASSWORD environment variable for pg_dump
export PGPASSWORD=$DB_PASSWORD

# Generate a timestamp for the backup filename
TIMESTAMP=$(date +"%Y-%m-%d_%H-%M-%S")
BACKUP_NAME="backup_$TIMESTAMP"
DB_DUMP_FILE="$BACKUP_DIR/$BACKUP_NAME.dump"
ARCHIVE_FILE="$BACKUP_DIR/$BACKUP_NAME.tar.gz"

# Clean up on error
function cleanup_on_error() {
  echo "Error occurred during backup. Cleaning up..."
  rm -f "$DB_DUMP_FILE"
  rm -f "$ARCHIVE_FILE"
  exit 1
}

# Dump the PostgreSQL database
echo "Dumping PostgreSQL database..."

if pg_dump -U "$DB_USER" -h "$DB_HOST" -p "$DB_PORT" "$DB_NAME" --format=custom --file="$DB_DUMP_FILE"; then
  echo "Database dump completed successfully."
else
  echo "Error dumping database!" >&2
  cleanup_on_error
fi

# Archive the database dump and uploads folder
echo "Archiving database dump and uploads folder..."

if tar -czf "$ARCHIVE_FILE" "$UPLOAD_LOCATION" "$DB_DUMP_FILE"; then
  echo "Archive created successfully: $ARCHIVE_FILE"
else
  echo "Error creating archive!" >&2
  cleanup_on_error
fi

# Clean up
echo "Cleaning up..."
rm -f "$DB_DUMP_FILE"

echo "Backup completed successfully."
