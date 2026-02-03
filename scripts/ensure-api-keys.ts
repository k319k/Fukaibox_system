
import "dotenv/config";
import { db } from "../lib/db";
import { sql } from "drizzle-orm";

async function ensureApiKeys() {
    try {
        console.log("Checking api_keys table...");
        await db.run(sql`
            CREATE TABLE IF NOT EXISTS api_keys (
                id TEXT PRIMARY KEY,
                key TEXT NOT NULL UNIQUE,
                owner_id TEXT NOT NULL,
                name TEXT NOT NULL,
                permissions TEXT NOT NULL,
                expires_at INTEGER,
                created_at INTEGER NOT NULL
            )
        `);
        console.log("api_keys table ensured.");
    } catch (error) {
        console.error("Error creating api_keys table:", error);
    }
}

ensureApiKeys();
