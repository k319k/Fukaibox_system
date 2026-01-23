
import { db } from "../lib/db";
import { sql } from "drizzle-orm";

async function checkApiKeysTable() {
    try {
        const result = await db.run(sql`SELECT count(*) FROM api_keys`);
        console.log("api_keys table exists:", result);
    } catch (error) {
        console.error("Error verifying api_keys table:", error);
    }
}

checkApiKeysTable();
