-- FukaiBox Database Schema
-- Run this SQL to create all tables in Turso

-- ========== Users ==========
CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username TEXT NOT NULL UNIQUE,
    display_name TEXT,
    password_hash TEXT,
    discord_id TEXT UNIQUE,
    discord_username TEXT,
    avatar_url TEXT,
    role TEXT DEFAULT 'GIIN',
    is_gicho INTEGER DEFAULT 0,
    is_blocked INTEGER DEFAULT 0,
    is_active INTEGER DEFAULT 1,
    block_reason TEXT,
    points INTEGER DEFAULT 0,
    can_manage_api_keys INTEGER DEFAULT 0,
    last_seen_at TEXT,
    created_at TEXT DEFAULT CURRENT_TIMESTAMP,
    updated_at TEXT
);

-- ========== Sheets ==========
CREATE TABLE IF NOT EXISTS sheets (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT NOT NULL,
    description TEXT,
    creator_id INTEGER NOT NULL REFERENCES users(id),
    is_giin_only INTEGER DEFAULT 0,
    current_phase TEXT DEFAULT 'draft',
    created_at TEXT DEFAULT CURRENT_TIMESTAMP,
    updated_at TEXT
);

-- ========== Script Sections ==========
CREATE TABLE IF NOT EXISTS script_sections (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    sheet_id INTEGER NOT NULL REFERENCES sheets(id),
    order_index INTEGER NOT NULL,
    content TEXT NOT NULL,
    image_instruction TEXT,
    reference_images TEXT,
    created_at TEXT DEFAULT CURRENT_TIMESTAMP,
    updated_at TEXT
);

-- ========== Images ==========
CREATE TABLE IF NOT EXISTS images (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    sheet_id INTEGER NOT NULL REFERENCES sheets(id),
    section_id INTEGER,
    uploader_id INTEGER NOT NULL REFERENCES users(id),
    file_path TEXT NOT NULL,
    original_file_path TEXT,
    is_selected INTEGER DEFAULT 0,
    uploaded_at TEXT DEFAULT CURRENT_TIMESTAMP
);

-- ========== Point History ==========
CREATE TABLE IF NOT EXISTS point_history (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL REFERENCES users(id),
    points_change INTEGER NOT NULL,
    reason TEXT NOT NULL,
    created_at TEXT DEFAULT CURRENT_TIMESTAMP
);

-- ========== Reward Settings ==========
CREATE TABLE IF NOT EXISTS reward_settings (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    setting_key TEXT NOT NULL UNIQUE,
    setting_value INTEGER NOT NULL,
    updated_at TEXT
);

-- ========== API Keys ==========
CREATE TABLE IF NOT EXISTS api_keys (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL REFERENCES users(id),
    key_name TEXT NOT NULL,
    key_hash TEXT NOT NULL UNIQUE,
    usage_count INTEGER DEFAULT 0,
    last_used_at TEXT,
    created_at TEXT DEFAULT CURRENT_TIMESTAMP,
    is_active INTEGER DEFAULT 1
);

-- ========== Tool Projects ==========
CREATE TABLE IF NOT EXISTS tool_projects (
    id TEXT PRIMARY KEY,
    owner_id INTEGER NOT NULL REFERENCES users(id),
    name TEXT NOT NULL,
    description TEXT,
    thumbnail_url TEXT,
    project_type TEXT DEFAULT 'sandbox',
    html_content TEXT,
    status TEXT DEFAULT 'stopped',
    storage_used_bytes INTEGER DEFAULT 0,
    embed_source TEXT,
    embed_url TEXT,
    view_count INTEGER DEFAULT 0,
    is_public INTEGER DEFAULT 1,
    is_deleted INTEGER DEFAULT 0,
    created_at TEXT DEFAULT CURRENT_TIMESTAMP,
    updated_at TEXT
);

-- ========== Tool Votes ==========
CREATE TABLE IF NOT EXISTS tool_votes (
    id TEXT PRIMARY KEY,
    project_id TEXT NOT NULL REFERENCES tool_projects(id),
    user_id INTEGER NOT NULL REFERENCES users(id),
    is_upvote INTEGER NOT NULL,
    created_at TEXT DEFAULT CURRENT_TIMESTAMP
);

-- ========== Tool Comments ==========
CREATE TABLE IF NOT EXISTS tool_comments (
    id TEXT PRIMARY KEY,
    project_id TEXT NOT NULL REFERENCES tool_projects(id),
    user_id INTEGER NOT NULL REFERENCES users(id),
    content TEXT NOT NULL,
    is_deleted INTEGER DEFAULT 0,
    created_at TEXT DEFAULT CURRENT_TIMESTAMP,
    updated_at TEXT
);

-- Insert default reward settings
INSERT OR IGNORE INTO reward_settings (setting_key, setting_value) VALUES ('upload_points', 5);
INSERT OR IGNORE INTO reward_settings (setting_key, setting_value) VALUES ('adoption_points', 20);
