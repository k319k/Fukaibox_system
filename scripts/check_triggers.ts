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

    console.log("Checking cooking_sections schema...");
    try {
        const tableInfo = await db.all(sql`PRAGMA table_info(cooking_sections);`);
        console.log("Cooking Sections Columns:", JSON.stringify(tableInfo, null, 2));

        const projectStatuses = await db.all(sql`SELECT status, COUNT(*) as count FROM cooking_projects GROUP BY status;`);
        console.log("Project Statuses:", JSON.stringify(projectStatuses, null, 2));

        const sampleProject = await db.all(sql`SELECT id, status FROM cooking_projects LIMIT 1;`);
        console.log("Sample Project:", sampleProject);

    } catch (e) {
        console.error("Error checking schema:", e);
    }
}

main().catch(console.error);
