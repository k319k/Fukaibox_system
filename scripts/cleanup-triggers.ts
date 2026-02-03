import { createClient } from "@libsql/client";
import * as dotenv from "dotenv";

// Load environment variables
dotenv.config();

const client = createClient({
    url: process.env.TURSO_DATABASE_URL || process.env.DATABASE_URL || "",
    authToken: process.env.TURSO_AUTH_TOKEN || "",
});

async function main() {
    console.log("=== Checking for triggers ===");

    // 1. トリガー一覧を確認
    const triggers = await client.execute(
        "SELECT name, sql FROM sqlite_master WHERE type='trigger'"
    );
    console.log("Triggers found:", triggers.rows.length);
    for (const row of triggers.rows) {
        console.log(`  - ${row.name}: ${row.sql}`);
    }

    // 2. バックアップテーブルを確認
    console.log("\n=== Checking for backup tables ===");
    const backupTables = await client.execute(
        "SELECT name FROM sqlite_master WHERE type='table' AND name LIKE '%backup%'"
    );
    console.log("Backup tables found:", backupTables.rows.length);
    for (const row of backupTables.rows) {
        console.log(`  - ${row.name}`);
    }

    // 3. 問題のあるトリガーを削除
    console.log("\n=== Cleaning up ===");

    for (const row of triggers.rows) {
        const triggerName = row.name as string;
        const triggerSql = row.sql as string;

        if (triggerSql && triggerSql.includes("cooking_sections_backup")) {
            console.log(`Dropping trigger: ${triggerName}`);
            await client.execute(`DROP TRIGGER IF EXISTS "${triggerName}"`);
            console.log(`  ✓ Dropped`);
        }
    }

    // 4. バックアップテーブルを削除
    for (const row of backupTables.rows) {
        const tableName = row.name as string;
        if (tableName.includes("cooking_sections")) {
            console.log(`Dropping table: ${tableName}`);
            await client.execute(`DROP TABLE IF EXISTS "${tableName}"`);
            console.log(`  ✓ Dropped`);
        }
    }

    console.log("\n=== Cleanup complete ===");

    // 5. 最終確認
    const remainingTriggers = await client.execute(
        "SELECT name FROM sqlite_master WHERE type='trigger'"
    );
    console.log("Remaining triggers:", remainingTriggers.rows.length);
}

main().catch((e) => {
    console.error("Error:", e);
    process.exit(1);
});
