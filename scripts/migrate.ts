// Tursoデータベースにマイグレーションを適用するスクリプト
import { config } from "dotenv";
config(); // .envファイルを読み込み

import { createClient } from "@libsql/client";
import { readFileSync } from "fs";
import { fetch as undiciFetch } from "undici";

// Undici fetchラッパー：RequestオブジェクトをURLに変換
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
    // URLをlibsql://形式に変換
    const rawUrl = process.env.TURSO_DATABASE_URL!;
    const connectionUrl = rawUrl.replace(/^https?:\/\//, "libsql://");

    console.log("Connecting to:", connectionUrl);

    const client = createClient({
        url: connectionUrl,
        authToken: process.env.TURSO_AUTH_TOKEN,
        fetch: customFetch,
    });

    const sqlContent = readFileSync("./drizzle/0000_daffy_outlaw_kid.sql", "utf-8");

    // statement-breakpointで分割して各ステートメントを実行
    const statements = sqlContent
        .split("--\> statement-breakpoint")
        .map(s => s.trim())
        .filter(s => s.length > 0);

    console.log(`Executing ${statements.length} statements...`);

    for (let i = 0; i < statements.length; i++) {
        const stmt = statements[i];
        try {
            await client.execute(stmt);
            console.log(`✓ Statement ${i + 1}/${statements.length} executed`);
        } catch (error: unknown) {
            const message = error instanceof Error ? error.message : String(error);
            // テーブルが既に存在する場合はスキップ
            if (message.includes("already exists")) {
                console.log(`⚠ Statement ${i + 1}/${statements.length} skipped (already exists)`);
            } else {
                console.error(`✗ Statement ${i + 1}/${statements.length} failed:`);
                console.error("  Error:", message);
                console.error("  SQL:", stmt.substring(0, 200) + (stmt.length > 200 ? "..." : ""));
            }
        }
    }

    console.log("Migration complete!");
    process.exit(0);
}

runMigration().catch(console.error);
