import { db } from "@/lib/db";
import { sql } from "drizzle-orm";

async function main() {
    console.log("Adding password column to accounts table...");
    try {
        await db.run(sql`ALTER TABLE accounts ADD COLUMN password TEXT`);
        console.log("Successfully added password column.");
    } catch (e: any) {
        console.log("Error adding password column (might already exist):", e.message);
    }

    console.log("Creating sessions_token_unique index...");
    try {
        await db.run(sql`CREATE UNIQUE INDEX IF NOT EXISTS sessions_token_unique ON sessions (token)`);
        console.log("Successfully created index.");
    } catch (e: any) {
        console.log("Error creating index:", e.message);
    }
}

main().catch(console.error);
