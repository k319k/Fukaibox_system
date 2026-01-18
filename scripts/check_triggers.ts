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

    console.log("Checking user images...");
    try {
        const users = await db.all(sql`SELECT id, name, image FROM users LIMIT 10`);
        console.log("Users:", JSON.stringify(users, null, 2));
    } catch (e) {
        console.error("Error checking users:", e);
    }
}

main().catch(console.error);
