// Check schema on Turso production database
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

async function checkSchema() {
    const rawUrl = process.env.TURSO_DATABASE_URL!;
    const connectionUrl = rawUrl.replace(/^https?:\/\//, "libsql://");

    console.log("Connecting to:", connectionUrl);

    const client = createClient({
        url: connectionUrl,
        authToken: process.env.TURSO_AUTH_TOKEN,
        fetch: customFetch,
    });

    try {
        // Check cooking_projects table schema
        console.log("\n=== Checking cooking_projects table ===");
        const projectsInfo = await client.execute(`PRAGMA table_info(cooking_projects)`);
        console.log("Columns:", JSON.stringify(projectsInfo.rows, null, 2));

        // Check cooking_sections table schema
        console.log("\n=== Checking cooking_sections table ===");
        const sectionsInfo = await client.execute(`PRAGMA table_info(cooking_sections)`);
        console.log("Columns:", JSON.stringify(sectionsInfo.rows, null, 2));

        // Check cooking_images table schema
        console.log("\n=== Checking cooking_images table ===");
        const imagesInfo = await client.execute(`PRAGMA table_info(cooking_images)`);
        console.log("Columns:", JSON.stringify(imagesInfo.rows, null, 2));

        // Try to query an existing project
        console.log("\n=== Querying existing project ===");
        const project = await client.execute(`SELECT * FROM cooking_projects LIMIT 1`);
        console.log("Sample project:", JSON.stringify(project.rows, null, 2));

    } catch (error: any) {
        console.error("Error:", error.message);
    } finally {
        process.exit(0);
    }
}

checkSchema().catch(console.error);
