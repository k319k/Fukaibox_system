import { createClient } from "@libsql/client";
import * as dotenv from "dotenv";
import * as fs from "fs";

dotenv.config();

const rawUrl = process.env.TURSO_DATABASE_URL || "";
const authToken = process.env.TURSO_AUTH_TOKEN || "";
const url = rawUrl.replace(/^https?:\/\//, "libsql://");

const client = createClient({ url, authToken });

async function main() {
    const log: string[] = [];
    log.push("URL: " + url);

    // テーブル一覧
    const tables = await client.execute("SELECT name FROM sqlite_master WHERE type='table'");
    log.push("\nTables: " + tables.rows.map(r => r.name).join(", "));

    // verificationsテーブルの確認
    const schema = await client.execute("PRAGMA table_info(verifications)");
    log.push("\nverifications columns:");
    for (const row of schema.rows) {
        log.push(`  ${row.name}: notnull=${row.notnull}`);
    }

    // テストINSERT
    const testId = `test-${Date.now()}`;
    try {
        await client.execute({
            sql: `INSERT INTO verifications (id, identifier, value, expires_at, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?)`,
            args: [testId, "test@example.com", "token", Date.now() / 1000, Date.now() / 1000, Date.now() / 1000],
        });
        log.push("\nINSERT: SUCCESS");
        await client.execute({ sql: `DELETE FROM verifications WHERE id = ?`, args: [testId] });
        log.push("DELETE: SUCCESS");
    } catch (err: any) {
        log.push("\nINSERT FAILED: " + err.message);
        log.push("Error code: " + err.code);
    }

    fs.writeFileSync("db-test-result.txt", log.join("\n"));
    console.log("Written to db-test-result.txt");
    await client.close();
}

main().catch(console.error);
