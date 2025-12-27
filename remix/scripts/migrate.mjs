// Run database migrations - reads from .dev.vars
import { createClient } from "@libsql/client";
import { readFileSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));

// Read .dev.vars file
function loadEnvFromDevVars() {
    try {
        const devVarsPath = join(__dirname, "..", ".dev.vars");
        const content = readFileSync(devVarsPath, "utf-8");
        const lines = content.split("\n");

        for (const line of lines) {
            const trimmed = line.trim();
            if (trimmed && !trimmed.startsWith("#")) {
                const eqIndex = trimmed.indexOf("=");
                if (eqIndex > 0) {
                    const key = trimmed.slice(0, eqIndex).trim();
                    let value = trimmed.slice(eqIndex + 1).trim();
                    // Remove quotes if present
                    if ((value.startsWith('"') && value.endsWith('"')) ||
                        (value.startsWith("'") && value.endsWith("'"))) {
                        value = value.slice(1, -1);
                    }
                    process.env[key] = value;
                }
            }
        }
        console.log("📂 Loaded environment from .dev.vars\n");
    } catch (err) {
        console.log("⚠️  Could not load .dev.vars, using existing environment\n");
    }
}

loadEnvFromDevVars();

if (!process.env.TURSO_DATABASE_URL || !process.env.TURSO_AUTH_TOKEN) {
    console.error("❌ Missing TURSO_DATABASE_URL or TURSO_AUTH_TOKEN");
    process.exit(1);
}

console.log(`🔗 Connecting to: ${process.env.TURSO_DATABASE_URL}\n`);

const client = createClient({
    url: process.env.TURSO_DATABASE_URL,
    authToken: process.env.TURSO_AUTH_TOKEN,
});

const migrations = [
    `CREATE TABLE IF NOT EXISTS users (
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
  )`,
    `CREATE TABLE IF NOT EXISTS sheets (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT NOT NULL,
    description TEXT,
    creator_id INTEGER NOT NULL REFERENCES users(id),
    is_giin_only INTEGER DEFAULT 0,
    current_phase TEXT DEFAULT 'draft',
    created_at TEXT DEFAULT CURRENT_TIMESTAMP,
    updated_at TEXT
  )`,
    `CREATE TABLE IF NOT EXISTS script_sections (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    sheet_id INTEGER NOT NULL REFERENCES sheets(id),
    order_index INTEGER NOT NULL,
    content TEXT NOT NULL,
    image_instruction TEXT,
    reference_images TEXT,
    created_at TEXT DEFAULT CURRENT_TIMESTAMP,
    updated_at TEXT
  )`,
    `CREATE TABLE IF NOT EXISTS images (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    sheet_id INTEGER NOT NULL REFERENCES sheets(id),
    section_id INTEGER,
    uploader_id INTEGER NOT NULL REFERENCES users(id),
    file_path TEXT NOT NULL,
    original_file_path TEXT,
    is_selected INTEGER DEFAULT 0,
    uploaded_at TEXT DEFAULT CURRENT_TIMESTAMP
  )`,
    `CREATE TABLE IF NOT EXISTS point_history (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL REFERENCES users(id),
    points_change INTEGER NOT NULL,
    reason TEXT NOT NULL,
    created_at TEXT DEFAULT CURRENT_TIMESTAMP
  )`,
    `CREATE TABLE IF NOT EXISTS reward_settings (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    setting_key TEXT NOT NULL UNIQUE,
    setting_value INTEGER NOT NULL,
    updated_at TEXT
  )`,
    `CREATE TABLE IF NOT EXISTS api_keys (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL REFERENCES users(id),
    key_name TEXT NOT NULL,
    key_hash TEXT NOT NULL UNIQUE,
    usage_count INTEGER DEFAULT 0,
    last_used_at TEXT,
    created_at TEXT DEFAULT CURRENT_TIMESTAMP,
    is_active INTEGER DEFAULT 1
  )`,
    `CREATE TABLE IF NOT EXISTS tool_projects (
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
  )`,
    `CREATE TABLE IF NOT EXISTS tool_votes (
    id TEXT PRIMARY KEY,
    project_id TEXT NOT NULL REFERENCES tool_projects(id),
    user_id INTEGER NOT NULL REFERENCES users(id),
    is_upvote INTEGER NOT NULL,
    created_at TEXT DEFAULT CURRENT_TIMESTAMP
  )`,
    `CREATE TABLE IF NOT EXISTS tool_comments (
    id TEXT PRIMARY KEY,
    project_id TEXT NOT NULL REFERENCES tool_projects(id),
    user_id INTEGER NOT NULL REFERENCES users(id),
    content TEXT NOT NULL,
    is_deleted INTEGER DEFAULT 0,
    created_at TEXT DEFAULT CURRENT_TIMESTAMP,
    updated_at TEXT
  )`,
    `INSERT OR IGNORE INTO reward_settings (setting_key, setting_value) VALUES ('upload_points', 5)`,
    `INSERT OR IGNORE INTO reward_settings (setting_key, setting_value) VALUES ('adoption_points', 20)`,
];

async function runMigrations() {
    console.log("🚀 Running migrations...\n");

    for (let i = 0; i < migrations.length; i++) {
        const sql = migrations[i];
        const tableName = sql.match(/CREATE TABLE IF NOT EXISTS (\w+)/)?.[1] ||
            sql.match(/INSERT OR IGNORE INTO (\w+)/)?.[1] ||
            `Migration ${i + 1}`;
        try {
            await client.execute(sql);
            console.log(`✅ ${tableName}`);
        } catch (error) {
            console.error(`❌ ${tableName}: ${error.message}`);
        }
    }

    console.log("\n✨ Migrations complete!");
    process.exit(0);
}

runMigrations().catch((err) => {
    console.error("Migration failed:", err);
    process.exit(1);
});
