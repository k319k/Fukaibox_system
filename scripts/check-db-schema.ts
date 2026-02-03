import { createClient } from "@libsql/client";
import * as dotenv from "dotenv";

dotenv.config();

const client = createClient({
    url: process.env.TURSO_DATABASE_URL || process.env.DATABASE_URL || "",
    authToken: process.env.TURSO_AUTH_TOKEN || "",
});

async function main() {
    console.log("=== All tables ===");
    const allTables = await client.execute(
        "SELECT name FROM sqlite_master WHERE type='table' ORDER BY name"
    );
    for (const row of allTables.rows) {
        console.log(`  - ${row.name}`);
    }

    console.log("\n=== cooking_images schema ===");
    try {
        const schema = await client.execute(
            "SELECT sql FROM sqlite_master WHERE type='table' AND name='cooking_images'"
        );
        console.log(schema.rows[0]?.sql || "Table not found");
    } catch (e) {
        console.log("Error:", e);
    }

    console.log("\n=== cooking_sections schema ===");
    try {
        const schema = await client.execute(
            "SELECT sql FROM sqlite_master WHERE type='table' AND name='cooking_sections'"
        );
        console.log(schema.rows[0]?.sql || "Table not found");
    } catch (e) {
        console.log("Error:", e);
    }

    console.log("\n=== Test insert to cooking_images ===");
    try {
        // まずcooking_projectsからプロジェクトIDを取得
        const projects = await client.execute(
            "SELECT id FROM cooking_projects LIMIT 1"
        );
        if (projects.rows.length > 0) {
            const projectId = projects.rows[0].id as string;
            console.log("Using project ID:", projectId);

            // テストインサート
            const testId = `test-${Date.now()}`;
            await client.execute({
                sql: `INSERT INTO cooking_images (id, project_id, uploaded_by, image_url, created_at) 
                      VALUES (?, ?, ?, ?, ?)`,
                args: [testId, projectId, "test-user", "https://example.com/test.jpg", Date.now()]
            });
            console.log("✓ Test insert successful!");

            // クリーンアップ
            await client.execute({
                sql: "DELETE FROM cooking_images WHERE id = ?",
                args: [testId]
            });
            console.log("✓ Test record deleted");
        } else {
            console.log("No projects found for testing");
        }
    } catch (e) {
        console.log("Error during test insert:", e);
    }
}

main().catch(console.error);
