import { createClient } from "@libsql/client";
import * as dotenv from "dotenv";

dotenv.config();

const client = createClient({
    url: process.env.TURSO_DATABASE_URL || process.env.DATABASE_URL || "",
    authToken: process.env.TURSO_AUTH_TOKEN || "",
});

async function main() {
    console.log("=== Checking cooking_images section_id ===");
    const images = await client.execute(`
        SELECT ci.id, ci.section_id, ci.project_id, ci.image_url 
        FROM cooking_images ci
        ORDER BY ci.created_at DESC 
        LIMIT 10
    `);

    for (const row of images.rows) {
        console.log(`ID: ${row.id}`);
        console.log(`  section_id: ${row.section_id || 'NULL'}`);
        console.log(`  project_id: ${row.project_id}`);
        console.log(`  image_url: ${(row.image_url as string).substring(0, 80)}...`);
        console.log("");
    }

    console.log("=== Checking cooking_sections ===");
    const sections = await client.execute(`
        SELECT id, project_id, content 
        FROM cooking_sections 
        WHERE project_id = '451f3fff-9dff-4bc1-9051-df4b49222808'
    `);

    for (const row of sections.rows) {
        console.log(`Section: ${row.id}`);
        console.log(`  content: ${(row.content as string || '').substring(0, 50)}...`);
        console.log("");
    }
}

main().catch(console.error);
