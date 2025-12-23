-- ユーザー設定カラム追加マイグレーション
-- Personal Settings Feature: Add user preferences and OAuth linking columns

-- プロフィール画像URL (Discord avatarとは別のカスタム画像)
ALTER TABLE users ADD COLUMN IF NOT EXISTS profile_image_url TEXT;

-- Googleアカウント連携
ALTER TABLE users ADD COLUMN IF NOT EXISTS google_id VARCHAR(64) UNIQUE;

-- パスワードハッシュ (非Discordユーザー用)
ALTER TABLE users ADD COLUMN IF NOT EXISTS hashed_password VARCHAR(255);

-- 外観設定 (JSON)
-- Example: {"theme": "dark", "color": "#1890ff", "language": "ja", "fontSize": 14}
ALTER TABLE users ADD COLUMN IF NOT EXISTS appearance_preferences JSONB DEFAULT '{}'::jsonb;

-- 通知設定 (JSON)
-- Example: {"email": true, "browser": true, "upload": true, "adoption": true, "points": true}
ALTER TABLE users ADD COLUMN IF NOT EXISTS notification_preferences JSONB DEFAULT '{"email": false, "browser": true, "upload": true, "adoption": true, "points": true}'::jsonb;

-- セキュリティ設定 (JSON)
-- Example: {"twoFactorEnabled": false, "loginAlerts": true}
ALTER TABLE users ADD COLUMN IF NOT EXISTS security_settings JSONB DEFAULT '{"loginAlerts": true}'::jsonb;

-- インデックス作成
CREATE INDEX IF NOT EXISTS idx_users_google_id ON users(google_id) WHERE google_id IS NOT NULL;

-- コメント追加
COMMENT ON COLUMN users.profile_image_url IS 'Custom profile image URL (separate from Discord avatar)';
COMMENT ON COLUMN users.google_id IS 'Google account ID for OAuth linking';
COMMENT ON COLUMN users.hashed_password IS 'Bcrypt hashed password for non-Discord users';
COMMENT ON COLUMN users.appearance_preferences IS 'User appearance preferences (theme, color, language, fontSize)';
COMMENT ON COLUMN users.notification_preferences IS 'User notification settings (email, browser, upload, adoption, points)';
COMMENT ON COLUMN users.security_settings IS 'User security settings (2FA, login alerts)';
