import fs from "fs";
import path from "path";

// Main function to run trigger check with proper env loading
async function main() {
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
    const { db } = await import("@/lib/db");
    const { sql } = await import("drizzle-orm");

    console.log("Checking accounts table data...");
    try {
        const accounts = await db.all(sql`SELECT user_id, provider_id, access_token FROM accounts LIMIT 5`);
        // トークンは長いので先頭だけ表示
        const masked = accounts.map((a: any) => ({
            ...a,
            access_token: a.access_token ? a.access_token.substring(0, 10) + "..." : "null"
        }));
        console.log("Accounts:", JSON.stringify(masked, null, 2));
    } catch (e) {
        console.error("Error checking accounts:", e);
    }
}

main().catch(console.error);
