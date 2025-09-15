#!/bin/bash

# Database Backup Script for Wedding App
# This script creates automated backups of the PostgreSQL database

set -e

# Configuration
BACKUP_DIR="./backups"
DATE=$(date +%Y%m%d_%H%M%S)
BACKUP_FILE="wedding_db_backup_${DATE}.sql"
RETENTION_DAYS=30

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Function to log messages
log() {
    echo -e "${GREEN}[$(date +'%Y-%m-%d %H:%M:%S')]${NC} $1"
}

error() {
    echo -e "${RED}[ERROR]${NC} $1" >&2
}

warn() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

# Check if DATABASE_URL is set
if [ -z "$DATABASE_URL" ]; then
    error "DATABASE_URL environment variable is not set"
    exit 1
fi

# Create backup directory if it doesn't exist
mkdir -p "$BACKUP_DIR"

log "Starting database backup..."

# Create backup using pg_dump
if pg_dump "$DATABASE_URL" > "$BACKUP_DIR/$BACKUP_FILE"; then
    log "Database backup created successfully: $BACKUP_FILE"
    
    # Compress the backup
    if gzip "$BACKUP_DIR/$BACKUP_FILE"; then
        log "Backup compressed: ${BACKUP_FILE}.gz"
        BACKUP_FILE="${BACKUP_FILE}.gz"
    else
        warn "Failed to compress backup file"
    fi
    
    # Get backup file size
    BACKUP_SIZE=$(du -h "$BACKUP_DIR/$BACKUP_FILE" | cut -f1)
    log "Backup size: $BACKUP_SIZE"
    
else
    error "Failed to create database backup"
    exit 1
fi

# Clean up old backups (older than RETENTION_DAYS)
log "Cleaning up old backups (older than $RETENTION_DAYS days)..."
find "$BACKUP_DIR" -name "wedding_db_backup_*.sql.gz" -type f -mtime +$RETENTION_DAYS -delete
CLEANED_COUNT=$(find "$BACKUP_DIR" -name "wedding_db_backup_*.sql.gz" -type f -mtime +$RETENTION_DAYS | wc -l)
if [ $CLEANED_COUNT -gt 0 ]; then
    log "Cleaned up $CLEANED_COUNT old backup files"
fi

# Optional: Upload to cloud storage (uncomment and configure as needed)
# log "Uploading backup to cloud storage..."
# if aws s3 cp "$BACKUP_DIR/$BACKUP_FILE" s3://your-backup-bucket/wedding-db/; then
#     log "Backup uploaded to S3 successfully"
# else
#     warn "Failed to upload backup to S3"
# fi

log "Backup process completed successfully!"

# List current backups
log "Current backups:"
ls -lh "$BACKUP_DIR"/wedding_db_backup_*.sql.gz 2>/dev/null || warn "No backup files found"
