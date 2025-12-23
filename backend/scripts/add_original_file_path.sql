-- Add original_file_path column to images table
ALTER TABLE images ADD COLUMN IF NOT EXISTS original_file_path VARCHAR(500);

-- Add comment for clarity
COMMENT ON COLUMN images.file_path IS 'Resized 640x480 image path';
COMMENT ON COLUMN images.original_file_path IS 'Original unresized image path';
