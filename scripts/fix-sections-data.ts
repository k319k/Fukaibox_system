// Fix existing sections data to match new schema
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

async function fixSectionsData() {
    const rawUrl = process.env.TURSO_DATABASE_URL!;
    const connectionUrl = rawUrl.replace(/^https?:\/\//, "libsql://");

    console.log("Connecting to:", connectionUrl);

    const client = createClient({
        url: connectionUrl,
        authToken: process.env.TURSO_AUTH_TOKEN,
        fetch: customFetch,
    });

    try {
        // First, check if there are any existing sections with null values
        console.log("\n=== Checking existing sections ===");
        const sections = await client.execute(`SELECT * FROM cooking_sections LIMIT 5`);
        console.log("Sample sections:", JSON.stringify(sections.rows, null, 2));

        // Update existing sections to fill in missing data
        console.log("\n=== Updating existing sections ===");

        // Set default timestamps for rows that don't have them
        await client.execute(`
            UPDATE cooking_sections 
            SET created_at = COALESCE(created_at, ${Date.now()})
            WHERE created_at IS NULL
        `);
        console.log("✓ Updated created_at");

        await client.execute(`
            UPDATE cooking_sections 
            SET updated_at = COALESCE(updated_at, ${Date.now()})
            WHERE updated_at IS NULL
        `);
        console.log("✓ Updated updated_at");

        // Set default order_index from order if not set
        await client.execute(`
            UPDATE cooking_sections 
            SET order_index = COALESCE(order_index, "order", 0)
            WHERE order_index IS NULL
        `);
        console.log("✓ Updated order_index");

        // Set content from title/description if not set
        await client.execute(`
            UPDATE cooking_sections 
            SET content = COALESCE(
                content, 
                CASE 
                    WHEN title IS NOT NULL AND description IS NOT NULL THEN title || '\\n\\n' || description
                    WHEN title IS NOT NULL THEN title
                    WHEN description IS NOT NULL THEN description
                    ELSE ''
                END
            )
            WHERE content IS NULL
        `);
        console.log("✓ Updated content");

        // Set allow_image_submission default
        await client.execute(`
            UPDATE cooking_sections 
            SET allow_image_submission = COALESCE(allow_image_submission, is_image_submission_allowed, 1)
            WHERE allow_image_submission IS NULL
        `);
        console.log("✓ Updated allow_image_submission");

        console.log("\n✅ Data migration complete!");

        // Show updated data
        const updated = await client.execute(`SELECT * FROM cooking_sections LIMIT 5`);
        console.log("\nUpdated sections:", JSON.stringify(updated.rows, null, 2));

    } catch (error: any) {
        console.error("Error:", error.message);
    } finally {
        process.exit(0);
    }
}

fixSectionsData().catch(console.error);
