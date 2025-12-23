"""
Google Drive Backup Sync Script
Uploads PostgreSQL backups to Google Drive and manages retention
"""
import os
import sys
from datetime import datetime, timedelta
from pathlib import Path

try:
    from google.oauth2 import service_account
    from googleapiclient.discovery import build
    from googleapiclient.http import MediaFileUpload
    from googleapiclient.errors import HttpError
except ImportError:
    print("ERROR: Google API libraries not installed")
    print("Run: pip install google-auth google-auth-oauthlib google-auth-httplib2 google-api-python-client")
    sys.exit(1)

# Configuration
SCOPES = ['https://www.googleapis.com/auth/drive.file']
BACKUP_DIR = '/opt/fukaibox/backups/postgres'
SERVICE_ACCOUNT_FILE = os.getenv('GOOGLE_SERVICE_ACCOUNT_KEY', '/opt/fukaibox/credentials/service-account-key.json')
FOLDER_ID = os.getenv('GOOGLE_DRIVE_FOLDER_ID')
RETENTION_DAYS = 30


def get_drive_service():
    """Initialize Google Drive API service"""
    if not os.path.exists(SERVICE_ACCOUNT_FILE):
        print(f"ERROR: Service account key not found at {SERVICE_ACCOUNT_FILE}")
        sys.exit(1)
    
    if not FOLDER_ID:
        print("ERROR: GOOGLE_DRIVE_FOLDER_ID environment variable not set")
        sys.exit(1)
    
    credentials = service_account.Credentials.from_service_account_file(
        SERVICE_ACCOUNT_FILE, scopes=SCOPES
    )
    
    return build('drive', 'v3', credentials=credentials)


def upload_to_gdrive(file_path):
    """Upload backup file to Google Drive"""
    service = get_drive_service()
    
    file_metadata = {
        'name': os.path.basename(file_path),
        'parents': [FOLDER_ID]
    }
    
    media = MediaFileUpload(file_path, resumable=True)
    
    try:
        file = service.files().create(
            body=file_metadata,
            media_body=media,
            fields='id, name, size'
        ).execute()
        
        file_size = int(file.get('size', 0)) / (1024 * 1024)  # Convert to MB
        print(f"✓ Uploaded: {file.get('name')} ({file_size:.2f} MB)")
        print(f"  File ID: {file.get('id')}")
        return file.get('id')
    
    except HttpError as error:
        print(f"ERROR: Upload failed - {error}")
        return None


def cleanup_old_backups(days=RETENTION_DAYS):
    """Remove backups older than specified days from Google Drive"""
    service = get_drive_service()
    
    # Calculate cutoff date
    cutoff = datetime.now() - timedelta(days=days)
    cutoff_str = cutoff.isoformat() + 'Z'
    
    try:
        # Query old files
        query = f"'{FOLDER_ID}' in parents and createdTime < '{cutoff_str}' and trashed = false"
        results = service.files().list(
            q=query,
            fields='files(id, name, createdTime)',
            orderBy='createdTime'
        ).execute()
        
        files = results.get('files', [])
        
        if not files:
            print("No old backups to delete")
            return
        
        # Delete old files
        deleted_count = 0
        for file in files:
            try:
                service.files().delete(fileId=file['id']).execute()
                print(f"✗ Deleted old backup: {file['name']} (created: {file['createdTime']})")
                deleted_count += 1
            except HttpError as error:
                print(f"ERROR: Failed to delete {file['name']} - {error}")
        
        print(f"\nDeleted {deleted_count} old backup(s) from Google Drive")
    
    except HttpError as error:
        print(f"ERROR: Failed to list files - {error}")


def list_gdrive_backups():
    """List all backups in Google Drive"""
    service = get_drive_service()
    
    try:
        query = f"'{FOLDER_ID}' in parents and trashed = false"
        results = service.files().list(
            q=query,
            fields='files(id, name, size, createdTime)',
            orderBy='createdTime desc'
        ).execute()
        
        files = results.get('files', [])
        
        if not files:
            print("No backups found in Google Drive")
            return
        
        print(f"\n{len(files)} backup(s) in Google Drive:")
        for file in files:
            size_mb = int(file.get('size', 0)) / (1024 * 1024)
            created = datetime.fromisoformat(file['createdTime'].replace('Z', '+00:00'))
            print(f"  - {file['name']} ({size_mb:.2f} MB) - {created.strftime('%Y-%m-%d %H:%M:%S')}")
    
    except HttpError as error:
        print(f"ERROR: Failed to list files - {error}")


if __name__ == '__main__':
    print("=== FukaiBox Google Drive Backup Sync ===\n")
    
    # Check if Google Drive is enabled
    if os.getenv('GOOGLE_DRIVE_ENABLED', 'false').lower() != 'true':
        print("Google Drive sync is disabled")
        print("Set GOOGLE_DRIVE_ENABLED=true in .env to enable")
        sys.exit(0)
    
    # Find latest backup file
    if not os.path.exists(BACKUP_DIR):
        print(f"ERROR: Backup directory not found: {BACKUP_DIR}")
        sys.exit(1)
    
    backups = sorted([
        f for f in os.listdir(BACKUP_DIR) 
        if f.endswith('.sql.gz')
    ], reverse=True)
    
    if not backups:
        print("No backup files found")
        sys.exit(1)
    
    latest_backup = os.path.join(BACKUP_DIR, backups[0])
    print(f"Latest backup: {backups[0]}")
    print(f"Uploading to Google Drive...\n")
    
    # Upload latest backup
    file_id = upload_to_gdrive(latest_backup)
    
    if file_id:
        print("\n✓ Upload successful")
        
        # Cleanup old backups
        print(f"\nCleaning up backups older than {RETENTION_DAYS} days...")
        cleanup_old_backups(RETENTION_DAYS)
        
        # List current backups
        list_gdrive_backups()
    else:
        print("\n✗ Upload failed")
        sys.exit(1)
