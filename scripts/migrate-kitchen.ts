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
    console.log("Starting manual migration for cooking_sections...");

    const columns = [
        "ALTER TABLE cooking_sections ADD COLUMN order_index INTEGER",
        "ALTER TABLE cooking_sections ADD COLUMN content TEXT",
        "ALTER TABLE cooking_sections ADD COLUMN image_instruction TEXT",
        "ALTER TABLE cooking_sections ADD COLUMN reference_image_url TEXT",
        "ALTER TABLE cooking_sections ADD COLUMN is_generating INTEGER",
        "ALTER TABLE cooking_sections ADD COLUMN allow_image_submission INTEGER",
        "ALTER TABLE cooking_sections ADD COLUMN created_at INTEGER",
        "ALTER TABLE cooking_sections ADD COLUMN updated_at INTEGER",
    ];

    for (const sql of columns) {
        try {
            await client.execute(sql);
            console.log(`Executed: ${sql}`);
        } catch (e: any) {
            // If column already exists, ignore
            if (e.message.includes("duplicate column name")) {
                console.log(`Skipped (Exists): ${sql}`);
            } else {
                console.error(`Error executing ${sql}:`, e);
            }
        }
    }

    console.log("Migration completed.");
}

main();
