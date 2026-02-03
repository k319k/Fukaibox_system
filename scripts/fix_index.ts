import { db } from "@/lib/db";
import { sql } from "drizzle-orm";

async function main() {
    console.log("Creating user_points_user_id_unique index...");
    try {
        await db.run(sql`CREATE UNIQUE INDEX IF NOT EXISTS user_points_user_id_unique ON user_points (user_id)`);
        console.log("Successfully created index.");
    } catch (e: any) {
        console.log("Error creating index:", e.message);
    }
}

main().catch(console.error);
