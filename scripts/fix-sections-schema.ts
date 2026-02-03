// Fix cooking_sections schema - make old columns nullable
import { config } from "dotenv";
config();

import { createClient } from "@libsql/client";
import { fetch as undiciFetch } from "undici";

const customFetch: typeof fetch = async (input, init?) => {
    const urlString = typeof input === 'string' ? input : input.url;
    const requestInit = typeof input === 'string' ? init : {
        ...init,
        method: input.method,
        headers: input.headers,
        body: input.body,
    };
    return undiciFetch(urlString, requestInit) as Promise<Response>;
};

async function fixSectionsSchema() {
    const rawUrl = process.env.TURSO_DATABASE_URL!;
    const connectionUrl = rawUrl.replace(/^https?:\/\//, "libsql://");

    console.log("Connecting to:", connectionUrl);

    const client = createClient({
        url: connectionUrl,
        authToken: process.env.TURSO_AUTH_TOKEN,
        fetch: customFetch,
    });

    try {
        // Step 1: Rename old table
        console.log("\n=== Step 1: Backing up cooking_sections ===");
        await client.execute(`ALTER TABLE cooking_sections RENAME TO cooking_sections_backup`);
        console.log("✓ Renamed cooking_sections to cooking_sections_backup");

        // Step 2: Create new table with correct nullable columns
        console.log("\n=== Step 2: Creating new cooking_sections table ===");
        await client.execute(`
            CREATE TABLE cooking_sections (
                id TEXT PRIMARY KEY,
                project_id TEXT NOT NULL REFERENCES cooking_projects(id) ON DELETE CASCADE,
                title TEXT,
                description TEXT,
                "order" INTEGER,
                is_image_submission_allowed INTEGER DEFAULT 1,
                assigned_to TEXT,
                order_index INTEGER,
                content TEXT,
                image_instruction TEXT,
                reference_image_url TEXT,
                allow_image_submission INTEGER DEFAULT 1,
                created_at INTEGER,
                updated_at INTEGER
            )
        `);
        console.log("✓ Created new cooking_sections table with nullable columns");

        // Step 3: Copy data from backup
        console.log("\n=== Step 3: Copying data from backup ===");
        await client.execute(`
            INSERT INTO cooking_sections 
            SELECT * FROM cooking_sections_backup
        `);
        console.log("✓ Copied existing data to new table");

        // Step 4: Drop backup table
        console.log("\n=== Step 4: Dropping backup table ===");
        await client.execute(`DROP TABLE cooking_sections_backup`);
        console.log("✓ Dropped backup table");

        console.log("\n✅ Schema fix complete! All old columns are now nullable.");

        // Verify
        const schema = await client.execute(`PRAGMA table_info(cooking_sections)`);
        console.log("\nNew schema:");
        console.log(JSON.stringify(schema.rows, null, 2));

    } catch (error: any) {
        console.error("Error:", error.message);
        console.error("Full error:", error);
    } finally {
        process.exit(0);
    }
}

fixSectionsSchema().catch(console.error);
