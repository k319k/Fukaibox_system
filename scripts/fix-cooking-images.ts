import { createClient } from "@libsql/client";
import * as dotenv from "dotenv";

dotenv.config();

const client = createClient({
    url: process.env.TURSO_DATABASE_URL || process.env.DATABASE_URL || "",
    authToken: process.env.TURSO_AUTH_TOKEN || "",
});

async function main() {
    console.log("=== Step 1: Get current cooking_images schema ===");
    const schema = await client.execute(
        "SELECT sql FROM sqlite_master WHERE type='table' AND name='cooking_images'"
    );
    console.log("Current schema:", schema.rows[0]?.sql);

    console.log("\n=== Step 2: Get current data count ===");
    const count = await client.execute("SELECT COUNT(*) as cnt FROM cooking_images");
    console.log("Current row count:", count.rows[0]?.cnt);

    console.log("\n=== Step 3: Backup existing data ===");
    const existingData = await client.execute("SELECT * FROM cooking_images");
    console.log("Rows to backup:", existingData.rows.length);

    console.log("\n=== Step 4: Drop and recreate cooking_images table ===");

    // Drop the problematic table
    await client.execute("DROP TABLE IF EXISTS cooking_images");
    console.log("✓ Dropped cooking_images");

    // Recreate with correct schema (matching schema.ts)
    await client.execute(`
        CREATE TABLE cooking_images (
            id TEXT PRIMARY KEY NOT NULL,
            section_id TEXT REFERENCES cooking_sections(id) ON DELETE SET NULL,
            project_id TEXT NOT NULL REFERENCES cooking_projects(id) ON DELETE CASCADE,
            uploaded_by TEXT NOT NULL REFERENCES users(id),
            image_url TEXT NOT NULL,
            is_selected INTEGER DEFAULT 0,
            is_final_selected INTEGER DEFAULT 0,
            created_at INTEGER NOT NULL
        )
    `);
    console.log("✓ Recreated cooking_images");

    console.log("\n=== Step 5: Restore data ===");
    for (const row of existingData.rows) {
        try {
            await client.execute({
                sql: `INSERT INTO cooking_images (id, section_id, project_id, uploaded_by, image_url, is_selected, is_final_selected, created_at)
                      VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
                args: [
                    row.id,
                    row.section_id,
                    row.project_id,
                    row.uploaded_by,
                    row.image_url,
                    row.is_selected,
                    row.is_final_selected,
                    row.created_at
                ]
            });
            console.log(`  ✓ Restored ${row.id}`);
        } catch (e) {
            console.log(`  ✗ Failed to restore ${row.id}:`, e);
        }
    }

    console.log("\n=== Step 6: Verify ===");
    const newCount = await client.execute("SELECT COUNT(*) as cnt FROM cooking_images");
    console.log("New row count:", newCount.rows[0]?.cnt);

    console.log("\n=== Step 7: Test insert ===");
    try {
        const projects = await client.execute("SELECT id FROM cooking_projects LIMIT 1");
        if (projects.rows.length > 0) {
            const testId = `test-${Date.now()}`;
            await client.execute({
                sql: `INSERT INTO cooking_images (id, project_id, uploaded_by, image_url, created_at) 
                      VALUES (?, ?, ?, ?, ?)`,
                args: [testId, projects.rows[0].id, "test-user", "https://example.com/test.jpg", Date.now()]
            });
            console.log("✓ Test insert successful!");
            await client.execute({ sql: "DELETE FROM cooking_images WHERE id = ?", args: [testId] });
            console.log("✓ Test record cleaned up");
        }
    } catch (e) {
        console.log("✗ Test insert failed:", e);
    }

    console.log("\n=== DONE ===");
}

main().catch(console.error);
