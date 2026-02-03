import "dotenv/config";
import { db } from "../lib/db";
import { sql } from "drizzle-orm";

async function main() {
    console.log("Adding kitchen_presence table...");

    await db.run(sql`
    CREATE TABLE IF NOT EXISTS kitchen_presence (
      id TEXT PRIMARY KEY,
      project_id TEXT NOT NULL REFERENCES cooking_projects(id) ON DELETE CASCADE,
      user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      last_seen_at INTEGER NOT NULL
    );
  `);

    console.log("Done.");
}

main().catch(console.error);
