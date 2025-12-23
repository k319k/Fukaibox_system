"""
封解Box Backend - Image Processing Service (Pillow 640x480)
"""
import os
import uuid
from io import BytesIO
from typing import Tuple

from PIL import Image as PILImage

# Target size as per specification
TARGET_WIDTH = 640
TARGET_HEIGHT = 480
THUMBNAIL_SIZE = (160, 120)
UPLOADS_DIR = "uploads"


async def process_and_save_image(
    file_content: bytes,
    original_filename: str,
    sheet_id: str
) -> Tuple[str, str, str, str, int, int]:
    """
    画像をリサイズして保存（オリジナルも保存）.
    
    Returns:
        Tuple of (filename, file_path, original_file_path, thumbnail_path, width, height)
    """
    # Generate unique filename
    ext = os.path.splitext(original_filename)[1].lower()
    if ext not in [".jpg", ".jpeg", ".png", ".gif", ".webp"]:
        ext = ".jpg"
    
    filename = f"{uuid.uuid4()}{ext}"
    original_filename_saved = f"{uuid.uuid4()}_original{ext}"
    
    # Create directories
    sheet_dir = os.path.join(UPLOADS_DIR, sheet_id)
    originals_dir = os.path.join(sheet_dir, "originals")
    thumbnails_dir = os.path.join(sheet_dir, "thumbnails")
    os.makedirs(sheet_dir, exist_ok=True)
    os.makedirs(originals_dir, exist_ok=True)
    os.makedirs(thumbnails_dir, exist_ok=True)
    
    # Save original file
    original_file_path = os.path.join(originals_dir, original_filename_saved)
    with open(original_file_path, "wb") as f:
        f.write(file_content)
    
    # Open and process image
    img = PILImage.open(BytesIO(file_content))
    
    # Convert to RGB if necessary (for JPEG saving)
    if img.mode in ("RGBA", "P"):
        img = img.convert("RGB")
    
    # Resize to 640x480 with center crop
    resized_img = resize_with_center_crop(img, TARGET_WIDTH, TARGET_HEIGHT)
    
    # Save resized image
    file_path = os.path.join(sheet_dir, filename)
    resized_img.save(file_path, quality=90, optimize=True)
    
    # Create and save thumbnail
    thumbnail = resized_img.copy()
    thumbnail.thumbnail(THUMBNAIL_SIZE, PILImage.Resampling.LANCZOS)
    thumbnail_path = os.path.join(thumbnails_dir, filename)
    thumbnail.save(thumbnail_path, quality=80, optimize=True)
    
    return filename, file_path, original_file_path, thumbnail_path, TARGET_WIDTH, TARGET_HEIGHT


def resize_with_center_crop(img: PILImage.Image, target_width: int, target_height: int) -> PILImage.Image:
    """
    画像を中央クロップでターゲットサイズにリサイズ.
    
    仕様書に従い Center Crop を実行.
    """
    original_width, original_height = img.size
    target_ratio = target_width / target_height
    original_ratio = original_width / original_height
    
    if original_ratio > target_ratio:
        # Image is wider than target - crop width
        new_width = int(original_height * target_ratio)
        left = (original_width - new_width) // 2
        img = img.crop((left, 0, left + new_width, original_height))
    elif original_ratio < target_ratio:
        # Image is taller than target - crop height
        new_height = int(original_width / target_ratio)
        top = (original_height - new_height) // 2
        img = img.crop((0, top, original_width, top + new_height))
    
    # Resize to exact target dimensions
    return img.resize((target_width, target_height), PILImage.Resampling.LANCZOS)
