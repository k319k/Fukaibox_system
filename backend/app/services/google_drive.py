"""
封解Box Backend - Google Drive Backup Service
シートアーカイブ時のGoogle Driveバックアップ
"""
import os
import io
import json
import logging
from datetime import datetime
from typing import Optional

from google.oauth2 import service_account
from googleapiclient.discovery import build
from googleapiclient.http import MediaIoBaseUpload

from app.config import settings

logger = logging.getLogger(__name__)

# Google Drive API スコープ
SCOPES = ['https://www.googleapis.com/auth/drive.file']

# バックアップフォルダ名
BACKUP_FOLDER_NAME = "FukaiBox_Backups"


class GoogleDriveService:
    """Google Drive操作サービス."""
    
    def __init__(self):
        self.service = None
        self.backup_folder_id = None
        self._init_service()
    
    def _init_service(self):
        """Google Drive APIサービスを初期化."""
        cred_path = getattr(settings, 'google_credentials_path', './google-credentials.json')
        
        if not os.path.exists(cred_path):
            logger.warning(f"Google credentials not found at {cred_path}")
            return
        
        try:
            credentials = service_account.Credentials.from_service_account_file(
                cred_path, scopes=SCOPES
            )
            self.service = build('drive', 'v3', credentials=credentials)
            logger.info("Google Drive service initialized successfully")
            
            # バックアップフォルダを取得/作成
            self._ensure_backup_folder()
        except Exception as e:
            logger.error(f"Failed to initialize Google Drive: {e}")
    
    def _ensure_backup_folder(self):
        """バックアップフォルダを確保."""
        if not self.service:
            return
        
        try:
            # 既存フォルダを検索
            query = f"name='{BACKUP_FOLDER_NAME}' and mimeType='application/vnd.google-apps.folder' and trashed=false"
            results = self.service.files().list(q=query, fields="files(id, name)").execute()
            folders = results.get('files', [])
            
            if folders:
                self.backup_folder_id = folders[0]['id']
                logger.info(f"Using existing backup folder: {self.backup_folder_id}")
            else:
                # 新規作成
                folder_metadata = {
                    'name': BACKUP_FOLDER_NAME,
                    'mimeType': 'application/vnd.google-apps.folder'
                }
                folder = self.service.files().create(body=folder_metadata, fields='id').execute()
                self.backup_folder_id = folder.get('id')
                logger.info(f"Created backup folder: {self.backup_folder_id}")
        except Exception as e:
            logger.error(f"Failed to ensure backup folder: {e}")
    
    def is_available(self) -> bool:
        """サービスが利用可能か確認."""
        return self.service is not None and self.backup_folder_id is not None
    
    async def upload_zip(self, zip_content: bytes, filename: str, sheet_title: str) -> Optional[str]:
        """
        ZIPファイルをGoogle Driveにアップロード.
        
        Returns:
            アップロードされたファイルのID（失敗時はNone）
        """
        if not self.is_available():
            logger.warning("Google Drive not available, skipping backup")
            return None
        
        try:
            # 日付付きフォルダを作成
            date_folder_name = datetime.now().strftime("%Y-%m-%d")
            date_folder_id = self._get_or_create_subfolder(date_folder_name)
            
            if not date_folder_id:
                date_folder_id = self.backup_folder_id
            
            # ファイルメタデータ
            file_metadata = {
                'name': f"{sheet_title}_{filename}",
                'parents': [date_folder_id]
            }
            
            # アップロード
            media = MediaIoBaseUpload(
                io.BytesIO(zip_content),
                mimetype='application/zip',
                resumable=True
            )
            
            file = self.service.files().create(
                body=file_metadata,
                media_body=media,
                fields='id, webViewLink'
            ).execute()
            
            file_id = file.get('id')
            web_link = file.get('webViewLink')
            
            logger.info(f"Uploaded to Google Drive: {file_id} ({web_link})")
            return file_id
            
        except Exception as e:
            logger.error(f"Failed to upload to Google Drive: {e}")
            return None
    
    def _get_or_create_subfolder(self, folder_name: str) -> Optional[str]:
        """サブフォルダを取得または作成."""
        if not self.service or not self.backup_folder_id:
            return None
        
        try:
            # 既存フォルダを検索
            query = (f"name='{folder_name}' and "
                    f"'{self.backup_folder_id}' in parents and "
                    "mimeType='application/vnd.google-apps.folder' and "
                    "trashed=false")
            results = self.service.files().list(q=query, fields="files(id)").execute()
            folders = results.get('files', [])
            
            if folders:
                return folders[0]['id']
            
            # 新規作成
            folder_metadata = {
                'name': folder_name,
                'mimeType': 'application/vnd.google-apps.folder',
                'parents': [self.backup_folder_id]
            }
            folder = self.service.files().create(body=folder_metadata, fields='id').execute()
            return folder.get('id')
            
        except Exception as e:
            logger.error(f"Failed to get/create subfolder: {e}")
            return None
    
    async def upload_metadata(self, sheet_data: dict, sheet_id: str) -> Optional[str]:
        """
        シートメタデータをJSONとしてアップロード.
        """
        if not self.is_available():
            return None
        
        try:
            json_content = json.dumps(sheet_data, ensure_ascii=False, indent=2)
            
            file_metadata = {
                'name': f"metadata_{sheet_id}.json",
                'parents': [self.backup_folder_id]
            }
            
            media = MediaIoBaseUpload(
                io.BytesIO(json_content.encode('utf-8')),
                mimetype='application/json',
                resumable=True
            )
            
            file = self.service.files().create(
                body=file_metadata,
                media_body=media,
                fields='id'
            ).execute()
            
            return file.get('id')
            
        except Exception as e:
            logger.error(f"Failed to upload metadata: {e}")
            return None


# グローバルサービスインスタンス
_drive_service: Optional[GoogleDriveService] = None


def get_drive_service() -> GoogleDriveService:
    """Google Driveサービスを取得."""
    global _drive_service
    if _drive_service is None:
        _drive_service = GoogleDriveService()
    return _drive_service


async def backup_sheet_to_drive(zip_content: bytes, filename: str, sheet_title: str) -> Optional[str]:
    """シートをGoogle Driveにバックアップ（ヘルパー関数）."""
    service = get_drive_service()
    return await service.upload_zip(zip_content, filename, sheet_title)
