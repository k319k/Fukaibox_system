import { config } from "dotenv";
config();

import { createClient } from "@libsql/client";

const rawUrl = process.env.TURSO_DATABASE_URL!;
const connectionUrl = rawUrl.replace(/^https?:\/\//, "libsql://");

console.log("URL:", connectionUrl);

const client = createClient({
    url: connectionUrl,
    authToken: process.env.TURSO_AUTH_TOKEN,
});

async function main() {
    console.log("Testing connection...");

    try {
        const tables = await client.execute("SELECT name FROM sqlite_master WHERE type='table'");
        console.log("Tables found:", tables.rows.length);
        console.log("Table names:", tables.rows.map(r => r.name).join(", "));
    } catch (err: any) {
        console.log("Error:", err.message);
        console.log("Code:", err.code);
    }
}

main().then(() => process.exit(0)).catch(e => {
    console.log("Fatal:", e.message);
    process.exit(1);
});
