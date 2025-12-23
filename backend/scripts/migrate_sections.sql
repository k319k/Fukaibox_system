-- Script Sections Migration SQL
-- Run this directly with psql

-- Step 1: Create script_sections table
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
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_script_sections_sheet_id ON script_sections(sheet_id);
CREATE INDEX IF NOT EXISTS idx_script_sections_order ON script_sections("order");

-- Step 2: Add section_id to images table
ALTER TABLE images ADD COLUMN IF NOT EXISTS section_id VARCHAR(36);

-- Add foreign key constraint
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

-- Create index
CREATE INDEX IF NOT EXISTS idx_images_section_id ON images(section_id);

-- Step 3: Migrate existing sheets (create default section for each)
INSERT INTO script_sections (id, sheet_id, "order", title, content, created_at, updated_at)
SELECT 
    gen_random_uuid()::text AS id,
    id AS sheet_id,
    0 AS "order",
    '全体' AS title,
    COALESCE(script_content, '') AS content,
    created_at,
    updated_at
FROM sheets
WHERE NOT EXISTS (
    SELECT 1 FROM script_sections WHERE script_sections.sheet_id = sheets.id
);
