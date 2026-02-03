import { createClient } from "@libsql/client";
import dotenv from "dotenv";

dotenv.config();

const url = process.env.TURSO_DATABASE_URL!;
const authToken = process.env.TURSO_AUTH_TOKEN!;

const client = createClient({
    url: url.startsWith("libsql://") ? url : url.replace(/^https?:\/\//, "libsql://"),
    authToken,
});

async function main() {
    console.log("Starting manual migration for notifications...");

    const sql = `
    CREATE TABLE IF NOT EXISTS notifications (
        id TEXT PRIMARY KEY,
        user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        type TEXT NOT NULL,
        title TEXT NOT NULL,
        message TEXT,
        link TEXT,
        is_read INTEGER DEFAULT 0,
        created_at INTEGER NOT NULL
    );
  `;

    try {
        await client.execute(sql);
        console.log(`Executed: ${sql}`);
    } catch (e: any) {
        console.error(`Error executing SQL:`, e);
    }

    console.log("Migration completed.");
}

main();
