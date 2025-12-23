"""
Database migration script for script sections
"""
import sys
import os
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from sqlalchemy import text, create_engine
from sqlalchemy.orm import sessionmaker
from app.config import settings
from app.models.script_section import ScriptSection
from app.models.sheet import Sheet
import uuid

# Create sync engine for migration
sync_url = settings.database_url.replace('+asyncpg', '').replace('postgresql://', 'postgresql+psycopg://')
sync_engine = create_engine(sync_url)
SessionLocal = sessionmaker(bind=sync_engine)


def create_tables():
    """Create script_sections table"""
    print("Creating script_sections table...")
    
    with sync_engine.begin() as conn:
        # Create script_sections table
        conn.execute(text("""
            CREATE TABLE IF NOT EXISTS script_sections (
                id VARCHAR(36) PRIMARY KEY,
                sheet_id VARCHAR(36) NOT NULL,
                "order" INTEGER NOT NULL,
                title VARCHAR(200),
                content TEXT NOT NULL DEFAULT '',
                image_instructions TEXT,
                reference_image_urls JSON,
                created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (sheet_id) REFERENCES sheets(id) ON DELETE CASCADE
            )
        """))
        
        # Create indexes
        conn.execute(text("""
            CREATE INDEX IF NOT EXISTS idx_script_sections_sheet_id 
            ON script_sections(sheet_id)
        """))
        
        conn.execute(text("""
            CREATE INDEX IF NOT EXISTS idx_script_sections_order 
            ON script_sections("order")
        """))
        
        print("✓ script_sections table created")


def add_section_id_to_images():
    """Add section_id column to images table"""
    print("Adding section_id to images table...")
    
    with sync_engine.begin() as conn:
        # Add section_id column
        conn.execute(text("""
            ALTER TABLE images 
            ADD COLUMN IF NOT EXISTS section_id VARCHAR(36)
        """))
        
        # Add foreign key constraint
        conn.execute(text("""
            DO $$
            BEGIN
                IF NOT EXISTS (
                    SELECT 1 FROM information_schema.table_constraints 
                    WHERE constraint_name = 'images_section_id_fkey'
                ) THEN
                    ALTER TABLE images 
                    ADD CONSTRAINT images_section_id_fkey 
                    FOREIGN KEY (section_id) REFERENCES script_sections(id) ON DELETE SET NULL;
                END IF;
            END $$;
        """))
        
        # Create index
        conn.execute(text("""
            CREATE INDEX IF NOT EXISTS idx_images_section_id 
            ON images(section_id)
        """))
        
        print("✓ section_id column added to images")


def migrate_existing_sheets():
    """Migrate existing sheets to use sections"""
    print("Migrating existing sheets to sections...")
    
    db = SessionLocal()
    try:
        # Get all sheets
        sheets = db.query(Sheet).all()
        
        migrated_count = 0
        for sheet in sheets:
            # Check if sheet already has sections
            existing_sections = db.query(ScriptSection).filter(
                ScriptSection.sheet_id == sheet.id
            ).count()
            
            if existing_sections > 0:
                print(f"  Skipping sheet {sheet.id} (already has sections)")
                continue
            
            # Create a single section from script_content
            section = ScriptSection(
                id=str(uuid.uuid4()),
                sheet_id=sheet.id,
                order=0,
                title="全体",
                content=sheet.script_content or "",
                image_instructions=None,
                reference_image_urls=[]
            )
            
            db.add(section)
            migrated_count += 1
            print(f"  ✓ Migrated sheet: {sheet.title}")
        
        db.commit()
        print(f"✓ Migrated {migrated_count} sheets to use sections")
        
    except Exception as e:
        db.rollback()
        print(f"✗ Error during migration: {e}")
        raise
    finally:
        db.close()


def main():
    """Run all migrations"""
    print("\n" + "="*50)
    print("Script Sections Migration")
    print("="*50 + "\n")
    
    try:
        # Step 1: Create tables
        create_tables()
        
        # Step 2: Add section_id to images
        add_section_id_to_images()
        
        # Step 3: Migrate existing data
        migrate_existing_sheets()
        
        print("\n" + "="*50)
        print("Migration completed successfully!")
        print("="*50 + "\n")
        
    except Exception as e:
        print(f"\n✗ Migration failed: {e}")
        sys.exit(1)


if __name__ == "__main__":
    main()
