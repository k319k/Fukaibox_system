
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

    console.log("Starting Reliable Schema Fix for users table...");

    try {
        // 1. Get current columns
        const columnsInfo = await db.run(sql`PRAGMA table_info(users)`);

        // Drizzleの .run() の戻り値はResultSetだが、driverによって形式が違う。
        // .all() を使うのが安全。
        const columns = await db.all(sql`PRAGMA table_info(users)`);
        console.log("Current Columns:", JSON.stringify(columns, null, 2));

        const existingColumns = new Set(columns.map((c: any) => c.name));

        // 2. Define required columns and their types
        const requiredColumns = [
            { name: "image", definition: "text('image')" },
            { name: "email", definition: "text('email')" }, // unique制約はADD COLUMNではつけにくいので一旦TEXTのみ
            { name: "email_verified", definition: "integer('email_verified')" }, // defaultは後で
            { name: "created_at", definition: "integer('created_at')" },
            { name: "updated_at", definition: "integer('updated_at')" }
        ];

        // 3. Add missing columns
        for (const col of requiredColumns) {
            if (!existingColumns.has(col.name)) {
                console.log(`Adding missing column: ${col.name}...`);
                try {
                    // 型定義部分はSQLに合わせて調整
                    let typeDef = "";
                    if (col.name === 'image') typeDef = "TEXT";
                    if (col.name === 'email') typeDef = "TEXT";
                    if (col.name === 'email_verified') typeDef = "INTEGER DEFAULT 0";
                    if (col.name === 'created_at') typeDef = "INTEGER";
                    if (col.name === 'updated_at') typeDef = "INTEGER";

                    await db.run(sql.raw(`ALTER TABLE users ADD COLUMN ${col.name} ${typeDef}`));
                    console.log(`Successfully added ${col.name}`);
                } catch (err) {
                    console.error(`Failed to add ${col.name}:`, err);
                }
            } else {
                console.log(`Column ${col.name} already exists.`);
            }
        }

        console.log("Schema Fix Completed.");

        // Verify again
        const finalColumns = await db.all(sql`PRAGMA table_info(users)`);
        console.log("Final Columns:", JSON.stringify(finalColumns.map((c: any) => c.name), null, 2));

    } catch (error) {
        console.error("Migration failed:", error);
    }
}

main().catch(console.error);
