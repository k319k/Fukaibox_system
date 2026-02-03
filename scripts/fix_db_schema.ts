
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

    console.log("Starting DB Schema Fix for cooking_proposals...");

    try {
        await db.transaction(async (tx) => {
            // 1. Rename existing table
            console.log("Renaming old table...");
            await tx.run(sql`ALTER TABLE cooking_proposals RENAME TO cooking_proposals_old`);

            // 2. Create new table with CORRECT foreign key
            console.log("Creating new table...");
            // Drizzleスキーマと一致させつつ、外部キーをcooking_sectionsに向ける
            // 現在のスキーマ定義に基づいて作成
            await tx.run(sql`
                CREATE TABLE cooking_proposals (
                    id TEXT PRIMARY KEY NOT NULL,
                    section_id TEXT NOT NULL,
                    proposed_by TEXT NOT NULL,
                    proposed_content TEXT NOT NULL,
                    status TEXT DEFAULT 'pending' NOT NULL,
                    created_at INTEGER NOT NULL,
                    updated_at INTEGER NOT NULL,
                    FOREIGN KEY (section_id) REFERENCES cooking_sections(id) ON DELETE CASCADE,
                    FOREIGN KEY (proposed_by) REFERENCES users(id) ON DELETE NO ACTION
                )
            `);
            // Note: 元の定義には user_id, type, feedback などDrizzleスキーマ(cookingProposals)にないカラムがあった。
            // しかしDrizzleスキーマ(schema.ts)では:
            // id, sectionId, proposedBy, proposedContent, status, createdAt, updatedAt
            // となっている。
            // schema_dump.jsonを見ると、実際のDBには user_id, type, feedback, proposed_by, proposed_content などが混在している。
            // 以前のmigrationでカラム名変更があったのかもしれない (user_id -> proposed_by ?)

            // 安全のため、schema_dump.jsonにあったカラムをできるだけ維持するか、Drizzleスキーマに合わせるか。
            // Drizzleスキーマに合わせてデータを移行するのが正しい姿にするチャンス。

            // schema_dump.jsonの定義:
            // id, section_id, user_id, type, content, status, feedback, created_at, proposed_by, proposed_content, updated_at

            // Drizzleスキーマ:
            // id, sectionId, proposedBy, proposedContent, status, createdAt, updatedAt

            // データ移行ロジック:
            // proposed_by があればそれ、なければ user_id
            // proposed_content があればそれ、なければ content

            console.log("Copying data...");
            await tx.run(sql`
                INSERT INTO cooking_proposals (id, section_id, proposed_by, proposed_content, status, created_at, updated_at)
                SELECT 
                    id, 
                    section_id, 
                    COALESCE(proposed_by, user_id), 
                    COALESCE(proposed_content, content), 
                    status, 
                    created_at, 
                    COALESCE(updated_at, created_at)
                FROM cooking_proposals_old
            `);

            // 3. Drop old table
            console.log("Dropping old table...");
            await tx.run(sql`DROP TABLE cooking_proposals_old`);

            console.log("Schema Fix Completed Successfully!");
        });
    } catch (error) {
        console.error("Migration failed:", error);
        // Transaction should rollback automatically on error
    }
}

main().catch(console.error);
