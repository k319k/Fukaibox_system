import { config } from "dotenv";
config();

import { createClient } from "@libsql/client";

const rawUrl = process.env.TURSO_DATABASE_URL!;
// libsql:// 形式を維持
const connectionUrl = rawUrl.replace(/^https?:\/\//, "libsql://");

console.log("Connecting to:", connectionUrl);

const client = createClient({
    url: connectionUrl,
    authToken: process.env.TURSO_AUTH_TOKEN,
});

async function main() {
    console.log("\n=== Tables in DB ===");
    const tables = await client.execute("SELECT name FROM sqlite_master WHERE type='table' ORDER BY name");
    tables.rows.forEach(r => console.log("-", r.name));

    console.log("\n=== verifications table info ===");
    try {
        const info = await client.execute("PRAGMA table_info(verifications)");
        if (info.rows.length === 0) {
            console.log("Table does not exist!");
        } else {
            info.rows.forEach(r => console.log(`  ${r.name}: ${r.type} (notnull=${r.notnull})`));
        }
    } catch (e: any) {
        console.log("Error:", e.message);
    }

    console.log("\n=== TEST INSERT ===");
    try {
        const id = `test-${Date.now()}`;
        await client.execute({
            sql: "INSERT INTO verifications (id, identifier, value, expires_at, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?)",
            args: [id, "test@test.com", "token", Math.floor(Date.now() / 1000) + 3600, Math.floor(Date.now() / 1000), Math.floor(Date.now() / 1000)],
        });
        console.log("INSERT SUCCESS!");
        await client.execute({ sql: "DELETE FROM verifications WHERE id = ?", args: [id] });
        console.log("DELETE SUCCESS!");
    } catch (e: any) {
        console.log("INSERT FAILED:", e.message);
    }
}

main().then(() => process.exit(0)).catch(e => {
    console.error("Fatal:", e);
    process.exit(1);
});
