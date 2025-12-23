"""
封解Box Backend - WebSocket Router
リアルタイム同期のための双方向通信
"""
import json
import logging
from typing import Dict, Set
from fastapi import APIRouter, WebSocket, WebSocketDisconnect, Depends
from sqlalchemy.ext.asyncio import AsyncSession

from app.database import get_db

router = APIRouter()
logger = logging.getLogger(__name__)


class ConnectionManager:
    """WebSocket接続管理クラス."""
    
    def __init__(self):
        # user_id -> WebSocket connection
        self.active_connections: Dict[str, WebSocket] = {}
        # sheet_id -> set of user_ids subscribed
        self.sheet_subscriptions: Dict[str, Set[str]] = {}
    
    async def connect(self, websocket: WebSocket, user_id: str):
        """新規接続を受け入れ."""
        await websocket.accept()
        self.active_connections[user_id] = websocket
        logger.info(f"WebSocket connected: {user_id}")
    
    def disconnect(self, user_id: str):
        """接続を切断."""
        if user_id in self.active_connections:
            del self.active_connections[user_id]
        # Remove from all subscriptions
        for sheet_id in list(self.sheet_subscriptions.keys()):
            self.sheet_subscriptions[sheet_id].discard(user_id)
            if not self.sheet_subscriptions[sheet_id]:
                del self.sheet_subscriptions[sheet_id]
        logger.info(f"WebSocket disconnected: {user_id}")
    
    def subscribe_to_sheet(self, user_id: str, sheet_id: str):
        """シートへのサブスクリプション登録."""
        if sheet_id not in self.sheet_subscriptions:
            self.sheet_subscriptions[sheet_id] = set()
        self.sheet_subscriptions[sheet_id].add(user_id)
        logger.info(f"User {user_id} subscribed to sheet {sheet_id}")
    
    def unsubscribe_from_sheet(self, user_id: str, sheet_id: str):
        """シートからのサブスクリプション解除."""
        if sheet_id in self.sheet_subscriptions:
            self.sheet_subscriptions[sheet_id].discard(user_id)
    
    async def send_personal(self, user_id: str, message: dict):
        """特定ユーザーにメッセージ送信."""
        if user_id in self.active_connections:
            try:
                await self.active_connections[user_id].send_json(message)
            except Exception as e:
                logger.error(f"Failed to send to {user_id}: {e}")
    
    async def broadcast_to_sheet(self, sheet_id: str, message: dict, exclude_user: str = None):
        """シート購読者全員にブロードキャスト."""
        if sheet_id not in self.sheet_subscriptions:
            return
        
        for user_id in self.sheet_subscriptions[sheet_id]:
            if exclude_user and user_id == exclude_user:
                continue
            await self.send_personal(user_id, message)
    
    async def broadcast_all(self, message: dict, exclude_user: str = None):
        """全接続にブロードキャスト."""
        for user_id in self.active_connections:
            if exclude_user and user_id == exclude_user:
                continue
            await self.send_personal(user_id, message)


# Global connection manager
manager = ConnectionManager()


def get_connection_manager() -> ConnectionManager:
    """ConnectionManagerを取得."""
    return manager


@router.websocket("/ws")
async def websocket_endpoint(websocket: WebSocket):
    """
    WebSocket接続エンドポイント.
    
    メッセージ形式:
    {
        "type": "auth",
        "user_id": "xxx",
        "token": "jwt_token"
    }
    {
        "type": "subscribe",
        "sheet_id": "xxx"
    }
    {
        "type": "unsubscribe", 
        "sheet_id": "xxx"
    }
    """
    user_id = None
    
    try:
        await websocket.accept()
        
        # 認証待ち
        auth_data = await websocket.receive_json()
        
        if auth_data.get("type") != "auth":
            await websocket.send_json({
                "type": "error",
                "message": "Authentication required"
            })
            await websocket.close()
            return
        
        user_id = auth_data.get("user_id")
        # TODO: JWT検証を追加
        
        if not user_id:
            await websocket.send_json({
                "type": "error",
                "message": "Invalid user_id"
            })
            await websocket.close()
            return
        
        # 既存接続を閉じて新規接続
        if user_id in manager.active_connections:
            try:
                old_ws = manager.active_connections[user_id]
                await old_ws.close()
            except Exception:
                pass
        
        manager.active_connections[user_id] = websocket
        
        await websocket.send_json({
            "type": "connected",
            "user_id": user_id
        })
        
        logger.info(f"User {user_id} connected via WebSocket")
        
        # メッセージループ
        while True:
            data = await websocket.receive_json()
            msg_type = data.get("type")
            
            if msg_type == "subscribe":
                sheet_id = data.get("sheet_id")
                if sheet_id:
                    manager.subscribe_to_sheet(user_id, sheet_id)
                    await websocket.send_json({
                        "type": "subscribed",
                        "sheet_id": sheet_id
                    })
            
            elif msg_type == "unsubscribe":
                sheet_id = data.get("sheet_id")
                if sheet_id:
                    manager.unsubscribe_from_sheet(user_id, sheet_id)
                    await websocket.send_json({
                        "type": "unsubscribed",
                        "sheet_id": sheet_id
                    })
            
            elif msg_type == "ping":
                await websocket.send_json({"type": "pong"})
    
    except WebSocketDisconnect:
        logger.info(f"WebSocket disconnected: {user_id}")
    except Exception as e:
        logger.error(f"WebSocket error: {e}")
    finally:
        if user_id:
            manager.disconnect(user_id)


# ブロードキャスト用ヘルパー関数
async def notify_sheet_update(sheet_id: str, action: str, data: dict, actor_id: str = None):
    """シート更新を通知."""
    await manager.broadcast_to_sheet(sheet_id, {
        "type": "sheet_update",
        "action": action,
        "sheet_id": sheet_id,
        "data": data
    }, exclude_user=actor_id)


async def notify_image_update(sheet_id: str, action: str, image_data: dict, actor_id: str = None):
    """画像更新を通知."""
    await manager.broadcast_to_sheet(sheet_id, {
        "type": "image_update",
        "action": action,
        "sheet_id": sheet_id,
        "data": image_data
    }, exclude_user=actor_id)


async def notify_points_update(user_id: str, points: int, reason: str):
    """点数更新を通知."""
    await manager.send_personal(user_id, {
        "type": "points_update",
        "points": points,
        "reason": reason
    })
