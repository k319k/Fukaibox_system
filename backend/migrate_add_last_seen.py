"""
Migration script to add last_seen column to users table
"""
import asyncio
from sqlalchemy.ext.asyncio import create_async_engine
from sqlalchemy import text
import os
from dotenv import load_dotenv

load_dotenv()

DATABASE_URL = os.getenv("DATABASE_URL", "postgresql+asyncpg://fukaibox:fukaibox@localhost:5432/fukaibox")


async def migrate():
    """Add missing columns to users table."""
    engine = create_async_engine(DATABASE_URL)
    
    async with engine.begin() as conn:
        # Add last_seen column if it doesn't exist
        try:
            await conn.execute(text("ALTER TABLE users ADD COLUMN IF NOT EXISTS last_seen TIMESTAMP"))
            print("Added 'last_seen' column (or already exists)")
        except Exception as e:
            print(f"Error adding last_seen: {e}")
        
        # Add other potentially missing columns
        columns_to_add = [
            ("profile_image_url", "TEXT"),
            ("google_id", "VARCHAR(64)"),
            ("hashed_password", "VARCHAR(255)"),
            ("appearance_preferences", "JSONB DEFAULT '{}'"),
            ("notification_preferences", "JSONB DEFAULT '{\"email\": false, \"browser\": true, \"upload\": true, \"adoption\": true, \"points\": true}'"),
            ("security_settings", "JSONB DEFAULT '{\"loginAlerts\": true}'"),
        ]
        
        for column_name, column_type in columns_to_add:
            try:
                await conn.execute(text(f"ALTER TABLE users ADD COLUMN IF NOT EXISTS {column_name} {column_type}"))
                print(f"Added '{column_name}' column (or already exists)")
            except Exception as e:
                print(f"Error adding {column_name}: {e}")
    
    await engine.dispose()
    print("\nMigration complete!")


if __name__ == "__main__":
    asyncio.run(migrate())
