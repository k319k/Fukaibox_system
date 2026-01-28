-- ============================================================
-- 封解Box Tools: App Data Schema (Supabase)
-- ============================================================

-- ------------------------------------------------------------
-- 1. Create `tools_app_data` table
-- ------------------------------------------------------------
-- 各アプリのKey-Valueストアとして機能するテーブル。
-- JSONB型 `data` に任意のデータを格納する。
-- `collection` カラムで「セーブデータ」「ランキング」「チャットログ」などを区別可能。

CREATE TABLE IF NOT EXISTS tools_app_data (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    app_id TEXT NOT NULL,          -- アプリID (Turso側の tools_apps.id と対応)
    user_id TEXT NOT NULL,         -- ユーザーID (Turso/Discord側のユーザーID)
    collection TEXT NOT NULL,      -- コレクション名 (例: 'save_data', 'scores', 'chat')
    data JSONB NOT NULL DEFAULT '{}'::JSONB, -- データ本体
    is_public BOOLEAN DEFAULT false, -- 公開設定 (trueなら誰でも読める)
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ------------------------------------------------------------
-- 2. Indexes
-- ------------------------------------------------------------
-- データの検索高速化のため、GINインデックスを作成。
-- これにより `data->>'score'` のようなクエリが高速になる。

CREATE INDEX IF NOT EXISTS idx_tools_app_data_app_id ON tools_app_data(app_id);
CREATE INDEX IF NOT EXISTS idx_tools_app_data_user_id ON tools_app_data(user_id);
CREATE INDEX IF NOT EXISTS idx_tools_app_data_collection ON tools_app_data(collection);
CREATE INDEX IF NOT EXISTS idx_tools_app_data_data_gin ON tools_app_data USING GIN (data);

-- ------------------------------------------------------------
-- 3. Row Level Security (RLS) Policies
-- ------------------------------------------------------------
-- SupabaseのRLSを有効化し、Custom JWTを使ったアクセス制御を行う。
-- Custom JWTには `app_id` クレームが含まれている前提。
-- auth.jwt() -> { "app_id": "...", "sub": "...", "role": "authenticated" ... }

ALTER TABLE tools_app_data ENABLE ROW LEVEL SECURITY;

-- ------------------------------------------------------------
-- Policy: READ (SELECT)
-- ------------------------------------------------------------
-- 読み取り許可条件:
-- 1. 自分のデータである (auth.uid() == user_id)
--    AND アプリIDが一致する (auth.jwt()->>'app_id' == app_id)
-- OR
-- 2. 公開データである (is_public == true)
--    AND アプリIDが一致する (auth.jwt()->>'app_id' == app_id)

CREATE POLICY "Allow read own data or public data within same app" 
ON tools_app_data
FOR SELECT
USING (
    (auth.jwt() ->> 'app_id' = app_id) 
    AND 
    (
        (auth.jwt() ->> 'sub' = user_id) 
        OR 
        (is_public = true)
    )
);

-- ------------------------------------------------------------
-- Policy: WRITE (INSERT/UPDATE/DELETE)
-- ------------------------------------------------------------
-- 書き込み許可条件:
-- 1. 自分のデータである (auth.uid() == user_id)
--    AND アプリIDが一致する (auth.jwt()->>'app_id' == app_id)
--    ※他人のデータは絶対に書き込めない。

CREATE POLICY "Allow write own data within same app" 
ON tools_app_data
FOR ALL
USING (
    (auth.jwt() ->> 'app_id' = app_id) 
    AND 
    (auth.jwt() ->> 'sub' = user_id)
);

-- ------------------------------------------------------------
-- 4. Utility Functions (Optional)
-- ------------------------------------------------------------
-- `updated_at` を自動更新するトリガー
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_tools_app_data_updated_at
    BEFORE UPDATE ON tools_app_data
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();
