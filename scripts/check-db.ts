import { createClient } from "@libsql/client";
import * as dotenv from "dotenv";
import * as fs from "fs";

// .envファイルを読み込む
dotenv.config();

// 環境変数から接続情報を取得
const rawUrl = process.env.TURSO_DATABASE_URL || process.env.DATABASE_URL || "";
const authToken = process.env.TURSO_AUTH_TOKEN || process.env.DATABASE_AUTH_TOKEN;

// libsql:// 形式に変換
const url = rawUrl.replace(/^https?:\/\//, "libsql://");

const client = createClient({
    url,
    authToken,
});

async function main() {
    const output: string[] = [];
    output.push("=== Database Tables ===\n");

    const tables = await client.execute(
        "SELECT name, sql FROM sqlite_master WHERE type='table' ORDER BY name"
    );

    for (const row of tables.rows) {
        output.push(`\n--- Table: ${row.name} ---`);
        output.push(String(row.sql));
    }

    // ファイルに書き込み
    fs.writeFileSync("db-schema.txt", output.join("\n"), "utf8");
    console.log("Output written to db-schema.txt");

    await client.close();
}

main().catch(console.error);
