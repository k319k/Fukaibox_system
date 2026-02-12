// Migration: Add reference_image_urls column to cooking_sections
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

async function migrate() {
    const rawUrl = process.env.TURSO_DATABASE_URL!;
    const connectionUrl = rawUrl.replace(/^https?:\/\//, "libsql://");

    console.log("Connecting to:", connectionUrl);

    const client = createClient({
        url: connectionUrl,
        authToken: process.env.TURSO_AUTH_TOKEN,
        fetch: customFetch,
    });

    const migrations = [
        {
            name: "Add reference_image_urls to cooking_sections",
            sql: `ALTER TABLE cooking_sections ADD COLUMN reference_image_urls TEXT`
        },
    ];

    console.log(`\nExecuting ${migrations.length} migration(s)...\n`);

    for (const migration of migrations) {
        try {
            console.log(`→ ${migration.name}`);
            await client.execute(migration.sql);
            console.log(`✓ Success`);
        } catch (error: any) {
            if (error.message?.includes("duplicate column") ||
                error.message?.includes("already exists")) {
                console.log(`⚠ Skipped (column already exists)`);
            } else {
                console.error(`✗ Error: ${error.message}`);
            }
        }
    }

    console.log("\n✅ Migration complete!");
    process.exit(0);
}

migrate().catch((err) => {
    console.error("Migration failed:", err);
    process.exit(1);
});
