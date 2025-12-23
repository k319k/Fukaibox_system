"""
Google Drive Backup Service
Handles uploading database backups to Google Drive for儀長 users
"""

from google.oauth2 import service_account
from googleapiclient.discovery import build
from googleapiclient.http import MediaFileUpload
from datetime import datetime
import os
from typing import Optional

class GoogleDriveBackupService:
    """Service for uploading backups to Google Drive."""
    
    def __init__(self, credentials_path: str):
        """Initialize Google Drive service.
        
        Args:
            credentials_path: Path to Google service account credentials JSON
        """
        self.credentials_path = credentials_path
        self.service = None
        self._initialize_service()
    
    def _initialize_service(self):
        """Initialize Google Drive API service."""
        try:
            credentials = service_account.Credentials.from_service_account_file(
                self.credentials_path,
                scopes=['https://www.googleapis.com/auth/drive.file']
            )
            self.service = build('drive', 'v3', credentials=credentials)
        except Exception as e:
            print(f"Failed to initialize Google Drive service: {e}")
            raise
    
    def create_backup_folder(self, folder_name: str = "FukaiBox_Backups") -> str:
        """Create or get backup folder in Google Drive.
        
        Args:
            folder_name: Name of the backup folder
            
        Returns:
            Folder ID
        """
        # Search for existing folder
        query = f"name='{folder_name}' and mimeType='application/vnd.google-apps.folder' and trashed=false"
        results = self.service.files().list(q=query, fields="files(id, name)").execute()
        files = results.get('files', [])
        
        if files:
            return files[0]['id']
        
        # Create new folder
        folder_metadata = {
            'name': folder_name,
            'mimeType': 'application/vnd.google-apps.folder'
        }
        folder = self.service.files().create(body=folder_metadata, fields='id').execute()
        return folder['id']
    
    def upload_backup(self, file_path: str, folder_id: Optional[str] = None) -> dict:
        """Upload backup file to Google Drive.
        
        Args:
            file_path: Path to the backup file
            folder_id: Optional folder ID to upload to
            
        Returns:
            Uploaded file metadata
        """
        if not os.path.exists(file_path):
            raise FileNotFoundError(f"Backup file not found: {file_path}")
        
        # Ensure backup folder exists
        if not folder_id:
            folder_id = self.create_backup_folder()
        
        # Prepare file metadata
        file_name = os.path.basename(file_path)
        timestamp = datetime.now().strftime("%Y-%m-%d_%H-%M-%S")
        file_metadata = {
            'name': f"{timestamp}_{file_name}",
            'parents': [folder_id]
        }
        
        # Upload file
        media = MediaFileUpload(file_path, resumable=True)
        file = self.service.files().create(
            body=file_metadata,
            media_body=media,
            fields='id, name, size, createdTime, webViewLink'
        ).execute()
        
        return {
            'file_id': file['id'],
            'file_name': file['name'],
            'size': int(file['size']),
            'created_time': file['createdTime'],
            'web_view_link': file.get('webViewLink', '')
        }
    
    def list_backups(self, folder_id: Optional[str] = None, max_results: int = 20) -> list:
        """List backup files in Drive.
        
        Args:
            folder_id: Optional folder ID to list from
            max_results: Maximum number of results to return
            
        Returns:
            List of backup file metadata
        """
        if not folder_id:
            folder_id = self.create_backup_folder()
        
        query = f"'{folder_id}' in parents and trashed=false"
        results = self.service.files().list(
            q=query,
            pageSize=max_results,
            orderBy='createdTime desc',
            fields="files(id, name, size, createdTime, webViewLink)"
        ).execute()
        
        return results.get('files', [])
    
    def delete_old_backups(self, folder_id: Optional[str] = None, keep_count: int = 10):
        """Delete old backup files, keeping only the most recent ones.
        
        Args:
            folder_id: Optional folder ID to clean up
            keep_count: Number of recent backups to keep
        """
        backups = self.list_backups(folder_id, max_results=100)
        
        # Delete backups beyond keep_count
        for backup in backups[keep_count:]:
            try:
                self.service.files().delete(fileId=backup['id']).execute()
                print(f"Deleted old backup: {backup['name']}")
            except Exception as e:
                print(f"Failed to delete {backup['name']}: {e}")
