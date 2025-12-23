"""
封解Box Backend - Firebase Sync Service (Write-Through)
"""
import os
import logging
from typing import Optional
import firebase_admin
from firebase_admin import credentials, firestore

from app.config import settings

logger = logging.getLogger(__name__)

# Initialize Firebase Admin SDK
_firebase_app: Optional[firebase_admin.App] = None
_db: Optional[firestore.AsyncClient] = None


def get_firebase_db():
    """Firestore クライアントを取得."""
    global _firebase_app, _db
    
    if _firebase_app is None:
        cred_path = settings.firebase_credentials_path
        if os.path.exists(cred_path):
            try:
                cred = credentials.Certificate(cred_path)
                _firebase_app = firebase_admin.initialize_app(cred)
                _db = firestore.client()
                logger.info("Firebase Admin SDK initialized successfully")
            except Exception as e:
                logger.warning(f"Failed to initialize Firebase: {e}")
                return None
        else:
            logger.warning(f"Firebase credentials not found at {cred_path}")
            return None
    
    return _db


async def sync_sheet_to_firebase(sheet) -> bool:
    """シートをFirestoreへ同期 (Write-Through)."""
    db = get_firebase_db()
    if db is None:
        logger.warning("Firebase not available, skipping sync")
        return False
    
    try:
        doc_ref = db.collection("sheets").document(sheet.id)
        doc_ref.set({
            "id": sheet.id,
            "title": sheet.title,
            "description": sheet.description,
            "phase": sheet.phase.value if hasattr(sheet.phase, 'value') else str(sheet.phase),
            "is_giin_only": sheet.is_giin_only,
            "is_anonymous_allowed": sheet.is_anonymous_allowed,
            "is_recruitment_closed": sheet.is_recruitment_closed,
            "creator_id": sheet.creator_id,
            "updated_at": firestore.SERVER_TIMESTAMP,
        })
        logger.info(f"Synced sheet {sheet.id} to Firebase")
        return True
    except Exception as e:
        logger.error(f"Failed to sync sheet to Firebase: {e}")
        return False


async def sync_image_to_firebase(image) -> bool:
    """画像をFirestoreへ同期."""
    db = get_firebase_db()
    if db is None:
        return False
    
    try:
        doc_ref = db.collection("images").document(image.id)
        doc_ref.set({
            "id": image.id,
            "sheet_id": image.sheet_id,
            "uploader_id": image.uploader_id,
            "status": image.status.value if hasattr(image.status, 'value') else str(image.status),
            "section_index": image.section_index,
            "is_anonymous": image.is_anonymous,
            "updated_at": firestore.SERVER_TIMESTAMP,
        })
        logger.info(f"Synced image {image.id} to Firebase")
        return True
    except Exception as e:
        logger.error(f"Failed to sync image to Firebase: {e}")
        return False


async def sync_user_points_to_firebase(user) -> bool:
    """ユーザーポイントをFirestoreへ同期."""
    db = get_firebase_db()
    if db is None:
        return False
    
    try:
        doc_ref = db.collection("user_points").document(user.id)
        doc_ref.set({
            "uid": user.id,
            "username": user.username,
            "display_name": user.display_name,
            "points": user.points,
            "updated_at": firestore.SERVER_TIMESTAMP,
        })
        logger.info(f"Synced user points for {user.id} to Firebase")
        return True
    except Exception as e:
        logger.error(f"Failed to sync user points to Firebase: {e}")
        return False


async def delete_from_firebase(collection: str, doc_id: str) -> bool:
    """Firestoreからドキュメント削除."""
    db = get_firebase_db()
    if db is None:
        return False
    
    try:
        db.collection(collection).document(doc_id).delete()
        logger.info(f"Deleted {collection}/{doc_id} from Firebase")
        return True
    except Exception as e:
        logger.error(f"Failed to delete from Firebase: {e}")
        return False
