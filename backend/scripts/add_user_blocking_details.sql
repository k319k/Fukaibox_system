-- Add user blocking detail fields
ALTER TABLE users ADD COLUMN IF NOT EXISTS blocked_at TIMESTAMP;
ALTER TABLE users ADD COLUMN IF NOT EXISTS blocked_by VARCHAR(64);
ALTER TABLE users ADD COLUMN IF NOT EXISTS block_reason VARCHAR(500);

COMMENT ON COLUMN users.blocked_at IS 'ブロックされた日時';
COMMENT ON COLUMN users.blocked_by IS 'ブロックした儀長のID';
COMMENT ON COLUMN users.block_reason IS 'ブロック理由';
