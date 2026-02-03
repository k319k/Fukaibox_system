// Apply Phase 2-C schema changes to Turso database
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

async function runMigration() {
    const rawUrl = process.env.TURSO_DATABASE_URL!;
    const connectionUrl = rawUrl.replace(/^https?:\/\//, "libsql://");

    console.log("Connecting to:", connectionUrl);

    const client = createClient({
        url: connectionUrl,
        authToken: process.env.TURSO_AUTH_TOKEN,
        fetch: customFetch,
    });

    // cooking_projects table - only update if columns don't exist
    const statements = [
        // Add description column if it doesn't exist
        `ALTER TABLE cooking_projects ADD COLUMN description text`,
        // Add created_by column with default
        `ALTER TABLE cooking_projects ADD COLUMN created_by text DEFAULT 'anonymous' NOT NULL REFERENCES users(id)`,
    ];

    console.log(`Executing ${statements.length} ALTER TABLE statements...\n`);

    for (let i = 0; i < statements.length; i++) {
        const stmt = statements[i];
        try {
            await client.execute(stmt);
            console.log(`✓ Statement ${i + 1}/${statements.length} executed`);
            console.log(`  ${stmt.substring(0, 80)}...`);
        } catch (error: any) {
            if (error.message?.includes("duplicate column") || error.message?.includes("already exists")) {
                console.log(`⚠ Statement ${i + 1}/${statements.length} skipped (column already exists)`);
            } else {
                console.error(`✗ Statement ${i + 1}/${statements.length} failed:`);
                console.error("  Error:", error.message);
                console.error("  SQL:", stmt);
            }
        }
    }

    console.log("\n✅ Migration complete!");
    process.exit(0);
}

runMigration().catch((err) => {
    console.error("Migration failed:", err);
    process.exit(1);
});
