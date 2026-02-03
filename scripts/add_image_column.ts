
import fs from "fs";
import path from "path";

// .envを手動で読み込む
try {
    const envPath = path.resolve(process.cwd(), ".env");
    const envFile = fs.readFileSync(envPath, "utf-8");
    envFile.split("\n").forEach(line => {
        const match = line.match(/^([^=]+)=(.*)$/);
        if (match) {
            const key = match[1].trim();
            const value = match[2].trim().replace(/^["']|["']$/g, ""); // クォート削除
            if (!process.env[key]) {
                process.env[key] = value;
            }
        }
    });
    console.log("Environment variables loaded from .env");
} catch (e) {
    console.error("Failed to load .env:", e);
}

// 環境変数設定後に動的インポート
async function main() {
    const { db } = await import("@/lib/db");
    const { sql } = await import("drizzle-orm");

    console.log("Starting Migration to add 'image' column to users table...");

    try {
        // カラムの存在チェック（簡易的）をしてから追加
        // しかしSQLiteのALTER TABLE ADD COLUMN IF NOT EXISTSは存在しないので、
        // エラー覚悟で実行するか、事前にチェックするか。
        // ここでは簡単なtry-catchで実行する。

        console.log("Adding 'image' column...");
        await db.run(sql`ALTER TABLE users ADD COLUMN image TEXT`);
        console.log("Success: Added 'image' column.");

    } catch (error) {
        if (String(error).includes("duplicate column name")) {
            console.log("Column 'image' already exists.");
        } else {
            console.error("Failed to add 'image' column:", error);
        }
    }

    // ついでに他のmissing columnsもチェックすべきだが、まずはimageのみ。
    // schema.tsには email, emailVerified, createdAt, updatedAt もある。
    // さっきのDumpでは: id, name, role(default guest), discord_id, google_drive_linked
    // これらは古いPrisma時代の名残かもしれない。
    // better-authの標準に合わせるなら email, emailVerified, createdAt, updatedAt も必要。
    // 今回はアイコン表示が目的なので image を優先。

    // createdAt, updatedAtがないとAuthAdapterがエラーを吐く可能性がある。
    // 追加しておくのが無難。

    try {
        console.log("Adding 'email' column...");
        await db.run(sql`ALTER TABLE users ADD COLUMN email TEXT`);
    } catch (e) { /* ignore */ }

    try {
        console.log("Adding 'email_verified' column...");
        await db.run(sql`ALTER TABLE users ADD COLUMN email_verified INTEGER DEFAULT 0`);
    } catch (e) { /* ignore */ }

    try {
        console.log("Adding 'created_at' column...");
        await db.run(sql`ALTER TABLE users ADD COLUMN created_at INTEGER`);
    } catch (e) { /* ignore */ }

    try {
        console.log("Adding 'updated_at' column...");
        await db.run(sql`ALTER TABLE users ADD COLUMN updated_at INTEGER`);
    } catch (e) { /* ignore */ }

    console.log("Migration completed.");

    // 最終確認
    const result = await db.all(sql`SELECT sql FROM sqlite_master WHERE type='table' AND name='users'`);
    console.log("Final Schema:", JSON.stringify(result, null, 2));
}

main().catch(console.error);
