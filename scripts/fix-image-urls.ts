import { createClient } from "@libsql/client";
import * as dotenv from "dotenv";

dotenv.config();

const client = createClient({
    url: process.env.TURSO_DATABASE_URL || process.env.DATABASE_URL || "",
    authToken: process.env.TURSO_AUTH_TOKEN || "",
});

async function main() {
    console.log("=== Fixing cooking_images URLs ===");

    // URLにhttps://がない画像を取得
    const images = await client.execute(
        "SELECT id, image_url FROM cooking_images WHERE image_url NOT LIKE 'https://%'"
    );

    console.log(`Found ${images.rows.length} images to fix`);

    for (const row of images.rows) {
        const oldUrl = row.image_url as string;
        const newUrl = `https://${oldUrl}`;

        console.log(`Fixing: ${row.id}`);
        console.log(`  Old: ${oldUrl}`);
        console.log(`  New: ${newUrl}`);

        await client.execute({
            sql: "UPDATE cooking_images SET image_url = ? WHERE id = ?",
            args: [newUrl, row.id]
        });
        console.log("  ✓ Fixed");
    }

    console.log("\n=== Verification ===");
    const check = await client.execute("SELECT id, image_url FROM cooking_images LIMIT 5");
    for (const row of check.rows) {
        console.log(`${row.id}: ${row.image_url}`);
    }

    console.log("\n=== Done ===");
}

main().catch(console.error);
