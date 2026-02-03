import "dotenv/config";
import { db } from "../lib/db";
import { sql } from "drizzle-orm";

async function main() {
    console.log("Starting manual DB fix...");

    try {
        // 1. Drop conflicting / new tables to allow clean recreate by Drizzle
        // We drop them so Drizzle sees them as 'create new' rather than 'rename' or 'conflict'
        const tablesToDrop = [
            "sessions", "accounts", "verifications",
            "session", "account", "reward_settings",
            "kitchen_presence", "dictionary_entries", "dictionary_relations",
            "tools_apps", "tools_files", "tools_ratings", "user_points", "point_history"
        ];

        for (const table of tablesToDrop) {
            try {
                await db.run(sql.raw(`DROP TABLE IF EXISTS ${table}`));
                console.log(`Dropped ${table}`);
            } catch (e) {
                console.log(`Error dropping ${table}:`, e);
            }
        }

        // 2. Align 'users' table columns
        const columnsToDrop = ["role", "discord_id", "google_drive_linked"];
        for (const col of columnsToDrop) {
            try {
                // Try to drop column (LibSQL/SQLite 3.35+ supports DROP COLUMN)
                await db.run(sql.raw(`ALTER TABLE users DROP COLUMN ${col}`));
                console.log(`Dropped column ${col} from users`);
            } catch (e: any) {
                // Ignore if column doesn't exist
                if (!e.message?.includes("no such column") && !e.message?.includes("no such table")) {
                    console.log(`Note: Could not drop ${col}: ${e.message}`);
                }
            }
        }

        const columnsToAdd = [
            { name: "image", type: "TEXT" },
            { name: "email_verified", type: "INTEGER DEFAULT 0" },
            { name: "updated_at", type: "INTEGER" }
        ];

        for (const col of columnsToAdd) {
            try {
                await db.run(sql.raw(`ALTER TABLE users ADD COLUMN ${col.name} ${col.type}`));
                console.log(`Added column ${col.name} to users`);
            } catch (e: any) {
                if (!e.message?.includes("duplicate column")) {
                    console.log(`Note: Could not add ${col.name}: ${e.message}`);
                }
            }
        }

        console.log("Manual fix completed.");
    } catch (e) {
        console.error("Error in manual fix:", e);
    }
}

main();
