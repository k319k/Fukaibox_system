import { createClient } from "@libsql/client";
import * as dotenv from "dotenv";

dotenv.config();

const client = createClient({
    url: process.env.TURSO_DATABASE_URL || process.env.DATABASE_URL || "",
    authToken: process.env.TURSO_AUTH_TOKEN || "",
});

async function main() {
    console.log("=== Checking cooking_images URLs ===");
    const images = await client.execute("SELECT id, image_url FROM cooking_images ORDER BY created_at DESC LIMIT 10");

    for (const row of images.rows) {
        console.log(`ID: ${row.id}`);
        console.log(`  URL: ${row.image_url}`);
        console.log(`  Has https: ${(row.image_url as string).startsWith('https://') ? 'YES' : 'NO'}`);
        console.log("");
    }
}

main().catch(console.error);
