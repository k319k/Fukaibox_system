-- Migration: Add API Keys table and user permissions
-- Date: 2025-12-21

-- Create api_keys table
CREATE TABLE IF NOT EXISTS api_keys (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    key_hash VARCHAR(255) NOT NULL UNIQUE,
    key_prefix VARCHAR(12) NOT NULL,
    name VARCHAR(100) NOT NULL,
    permissions JSONB DEFAULT '{"read_points": true, "write_points": false}'::jsonb,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    last_used_at TIMESTAMP WITH TIME ZONE,
    is_active BOOLEAN DEFAULT TRUE,
    CONSTRAINT fk_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Add can_manage_api_keys column to users table
ALTER TABLE users ADD COLUMN IF NOT EXISTS can_manage_api_keys BOOLEAN DEFAULT FALSE;

-- Set all 儀長 (Gicho) users to have API key management permission
UPDATE users SET can_manage_api_keys = TRUE WHERE is_gicho = TRUE;

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_api_keys_user_id ON api_keys(user_id);
CREATE INDEX IF NOT EXISTS idx_api_keys_key_hash ON api_keys(key_hash);
CREATE INDEX IF NOT EXISTS idx_api_keys_is_active ON api_keys(is_active);

-- Add comments
COMMENT ON TABLE api_keys IS 'Stores API keys for accessing public FukaiBox APIs';
COMMENT ON COLUMN api_keys.key_hash IS 'Bcrypt hash of the full API key';
COMMENT ON COLUMN api_keys.key_prefix IS 'First 8-12 characters of key for display purposes';
COMMENT ON COLUMN api_keys.permissions IS 'JSON object defining what this key can do';
COMMENT ON COLUMN users.can_manage_api_keys IS 'Whether user can create/manage API keys (儀長 + permitted 儀員)';
