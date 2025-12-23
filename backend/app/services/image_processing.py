"""
封解Box Backend - Image Processing Service
Pillow-based image resizing and cropping
"""
from PIL import Image, ImageOps
from io import BytesIO
import os
from typing import Tuple


def resize_and_crop_center(
    image_path: str, 
    target_size: Tuple[int, int] = (640, 480)
) -> str:
    """
    画像を640×480にCenter Cropリサイズ
    
    Args:
        image_path: 元画像のパス
        target_size: ターゲットサイズ (width, height)
    
    Returns:
        リサイズ後の画像パス
    """
    with Image.open(image_path) as img:
        # EXIF回転情報を適用（スマホ写真対応）
        img = ImageOps.exif_transpose(img) if img._getexif() else img
        
        # RGBに変換（PNGのアルファチャンネル対応）
        if img.mode != 'RGB':
            img = img.convert('RGB')
        
        # 元のアスペクト比を計算
        original_width, original_height = img.size
        target_width, target_height = target_size
        target_ratio = target_width / target_height
        original_ratio = original_width / original_height
        
        # アスペクト比に応じてリサイズ
        if original_ratio > target_ratio:
            # 横長画像: 高さを基準にリサイズ
            new_height = target_height
            new_width = int(original_width * (target_height / original_height))
        else:
            # 縦長画像: 幅を基準にリサイズ
            new_width = target_width
            new_height = int(original_height * (target_width / original_width))
        
        img_resized = img.resize((new_width, new_height), Image.Resampling.LANCZOS)
        
        # Center Crop
        left = (new_width - target_width) // 2
        top = (new_height - target_height) // 2
        right = left + target_width
        bottom = top + target_height
        
        img_cropped = img_resized.crop((left, top, right, bottom))
        
        # 保存（元のパスに_640x480を追加）
        base, ext = os.path.splitext(image_path)
        resized_path = f"{base}_640x480{ext}"
        
        # JPEG品質85で保存（ファイルサイズとクオリティのバランス）
        if ext.lower() in ['.jpg', '.jpeg']:
            img_cropped.save(resized_path, 'JPEG', quality=85, optimize=True)
        else:
            img_cropped.save(resized_path, quality=85, optimize=True)
        
        return resized_path


def create_thumbnail(image_path: str, max_size: Tuple[int, int] = (200, 200)) -> str:
    """
    サムネイル画像を作成
    
    Args:
        image_path: 元画像のパス
        max_size: 最大サイズ (width, height)
    
    Returns:
        サムネイル画像パス
    """
    with Image.open(image_path) as img:
        img = ImageOps.exif_transpose(img) if img._getexif() else img
        
        if img.mode != 'RGB':
            img = img.convert('RGB')
        
        img.thumbnail(max_size, Image.Resampling.LANCZOS)
        
        base, ext = os.path.splitext(image_path)
        thumb_path = f"{base}_thumb{ext}"
        
        if ext.lower() in ['.jpg', '.jpeg']:
            img.save(thumb_path, 'JPEG', quality=75, optimize=True)
        else:
            img.save(thumb_path, quality=75, optimize=True)
        
        return thumb_path
