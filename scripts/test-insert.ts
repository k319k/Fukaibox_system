import { config } from "dotenv";
config();

import { createClient } from "@libsql/client";
import * as fs from "fs";

const rawUrl = process.env.TURSO_DATABASE_URL!;
const connectionUrl = rawUrl.replace(/^https?:\/\//, "libsql://");

const client = createClient({
    url: connectionUrl,
    authToken: process.env.TURSO_AUTH_TOKEN,
});

const log: string[] = [];

function logMsg(msg: string) {
    console.log(msg);
    log.push(msg);
}

async function main() {
    logMsg("Connecting to: " + connectionUrl);

    // 1. テーブル一覧
    logMsg("\n=== Tables ===");
    const tables = await client.execute("SELECT name FROM sqlite_master WHERE type='table'");
    tables.rows.forEach(r => logMsg("- " + String(r.name)));

    // 2. verificationsテーブル構造
    logMsg("\n=== verifications structure ===");
    const info = await client.execute("PRAGMA table_info(verifications)");
    info.rows.forEach(r => logMsg(`- ${r.name}: ${r.type} (notnull=${r.notnull}, dflt=${r.dflt_value})`));

    // 3. テストINSERT
    logMsg("\n=== Test INSERT ===");
    try {
        const id = `test-${Date.now()}`;
        await client.execute({
            sql: "INSERT INTO verifications (id, identifier, value, expires_at, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?)",
            args: [id, "test@test.com", "token123", Math.floor(Date.now() / 1000) + 3600, Math.floor(Date.now() / 1000), Math.floor(Date.now() / 1000)],
        });
        logMsg("INSERT SUCCESS!");
        await client.execute({ sql: "DELETE FROM verifications WHERE id = ?", args: [id] });
        logMsg("DELETE SUCCESS!");
    } catch (err: any) {
        logMsg("INSERT FAILED: " + err.message);
        logMsg("Error code: " + err.code);
    }

    // 結果をファイルに保存
    fs.writeFileSync("test-result.txt", log.join("\n"));
    console.log("Written to test-result.txt");
}

main().catch(console.error).finally(() => process.exit(0));
