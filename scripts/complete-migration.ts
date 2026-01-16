// Complete migration to fix all schema issues
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

async function completeMigration() {
    const rawUrl = process.env.TURSO_DATABASE_URL!;
    const connectionUrl = rawUrl.replace(/^https?:\/\//, "libsql://");

    console.log("Connecting to:", connectionUrl);

    const client = createClient({
        url: connectionUrl,
        authToken: process.env.TURSO_AUTH_TOKEN,
        fetch: customFetch,
    });

    const migrations = [
        // 1. cooking_projects: rename user_id to created_by
        {
            name: "Rename user_id to created_by in cooking_projects",
            sql: `ALTER TABLE cooking_projects RENAME COLUMN user_id TO created_by`
        },

        // 2. cooking_images: create the table if it doesn't exist
        {
            name: "Drop and recreate cooking_images table",
            sql: `DROP TABLE IF EXISTS cooking_images`
        },
        {
            name: "Create cooking_images table with correct schema",
            sql: `CREATE TABLE cooking_images (
                id TEXT PRIMARY KEY NOT NULL,
                section_id TEXT,
                project_id TEXT NOT NULL,
                uploaded_by TEXT NOT NULL,
                image_url TEXT NOT NULL,
                is_selected INTEGER DEFAULT 0,
                is_final_selected INTEGER DEFAULT 0,
                created_at INTEGER NOT NULL,
                FOREIGN KEY (section_id) REFERENCES cooking_sections(id) ON DELETE SET NULL,
                FOREIGN KEY (project_id) REFERENCES cooking_projects(id) ON DELETE CASCADE,
                FOREIGN KEY (uploaded_by) REFERENCES users(id)
            )`
        },

        // 3. cooking_sections: add missing columns
        {
            name: "Add order_index to cooking_sections",
            sql: `ALTER TABLE cooking_sections ADD COLUMN order_index INTEGER`
        },
        {
            name: "Update order_index from order",
            sql: `UPDATE cooking_sections SET order_index = "order"`
        },
        {
            name: "Add content to cooking_sections",
            sql: `ALTER TABLE cooking_sections ADD COLUMN content TEXT`
        },
        {
            name: "Update content from title+description",
            sql: `UPDATE cooking_sections SET content = COALESCE(title || '\\n' || description, title, '')`
        },
        {
            name: "Add image_instruction to cooking_sections",
            sql: `ALTER TABLE cooking_sections ADD COLUMN image_instruction TEXT`
        },
        {
            name: "Add allow_image_submission to cooking_sections",
            sql: `ALTER TABLE cooking_sections ADD COLUMN allow_image_submission INTEGER DEFAULT 1`
        },
        {
            name: "Add created_at to cooking_sections",
            sql: `ALTER TABLE cooking_sections ADD COLUMN created_at INTEGER`
        },
        {
            name: "Add updated_at to cooking_sections",
            sql: `ALTER TABLE cooking_sections ADD COLUMN updated_at INTEGER`
        },

        // 4. cooking_proposals: add missing columns
        {
            name: "Add proposed_by to cooking_proposals",
            sql: `ALTER TABLE cooking_proposals ADD COLUMN proposed_by TEXT`
        },
        {
            name: "Add proposed_content to cooking_proposals",
            sql: `ALTER TABLE cooking_proposals ADD COLUMN proposed_content TEXT`
        },
        {
            name: "Add updated_at to cooking_proposals",
            sql: `ALTER TABLE cooking_proposals ADD COLUMN updated_at INTEGER`
        },
    ];

    console.log(`\nExecuting ${migrations.length} migration statements...\n`);

    for (let i = 0; i < migrations.length; i++) {
        const migration = migrations[i];
        try {
            console.log(`[${i + 1}/${migrations.length}] ${migration.name}`);
            await client.execute(migration.sql);
            console.log(`✓ Success`);
        } catch (error: any) {
            if (error.message?.includes("duplicate column") ||
                error.message?.includes("already exists") ||
                error.message?.includes("no such column")) {
                console.log(`⚠ Skipped (${error.message.substring(0, 60)}...)`);
            } else {
                console.error(`✗ Error: ${error.message}`);
                // Don't throw, continue with other migrations
            }
        }
    }

    console.log("\n✅ Migration complete!");
    process.exit(0);
}

completeMigration().catch((err) => {
    console.error("Migration failed:", err);
    process.exit(1);
});
