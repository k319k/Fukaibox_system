#!/bin/bash
# FukaiBox PostgreSQL Database Backup Script
# This script creates compressed backups of the PostgreSQL database
# and maintains a 30-day retention policy

set -e

# Configuration
BACKUP_DIR="/opt/fukaibox/db-backups"
DB_NAME="fukaibox"
DB_USER="fukaibox"
TIMESTAMP=$(date +%Y-%m-%d_%H-%M-%S)
BACKUP_FILE="$BACKUP_DIR/${DB_NAME}_${TIMESTAMP}.sql"
LOG_FILE="/var/log/fukaibox-backup.log"

# Logging function
log() {
    echo "[$(date '+%Y-%m-%d %H:%M:%S')] $1" | tee -a "$LOG_FILE"
}

# Create backup directory if it doesn't exist
mkdir -p "$BACKUP_DIR"

log "Starting database backup..."

# Perform PostgreSQL dump
if pg_dump -U "$DB_USER" "$DB_NAME" > "$BACKUP_FILE" 2>> "$LOG_FILE"; then
    log "Database dump completed: $BACKUP_FILE"
    
    # Compress the backup
    if gzip "$BACKUP_FILE" 2>> "$LOG_FILE"; then
        COMPRESSED_FILE="${BACKUP_FILE}.gz"
        BACKUP_SIZE=$(du -h "$COMPRESSED_FILE" | cut -f1)
        log "Backup compressed: $COMPRESSED_FILE (Size: $BACKUP_SIZE)"
    else
        log "ERROR: Failed to compress backup"
        exit 1
    fi
else
    log "ERROR: Database dump failed"
    exit 1
fi

# Clean up old backups (keep last 30 days)
log "Cleaning up old backups..."
DELETED_COUNT=$(find "$BACKUP_DIR" -name "*.sql.gz" -mtime +30 -delete -print | wc -l)
log "Deleted $DELETED_COUNT old backup(s)"

# Calculate total backup size
TOTAL_SIZE=$(du -sh "$BACKUP_DIR" | cut -f1)
BACKUP_COUNT=$(find "$BACKUP_DIR" -name "*.sql.gz" | wc -l)
log "Backup completed successfully. Total: $BACKUP_COUNT backup(s), $TOTAL_SIZE"

exit 0
