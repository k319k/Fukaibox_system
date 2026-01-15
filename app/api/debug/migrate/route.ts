import { NextRequest, NextResponse } from "next/server";
import { client } from "@/lib/db";
import { readFileSync } from "fs";
import { join } from "path";

export const runtime = "nodejs";

/**
 * DBマイグレーション実行API（開発/デバッグ専用）
 * GET /api/debug/migrate?secret=SESSION_SECRET
 */
export async function GET(request: NextRequest) {
    // シークレットキーによる認証
    const secret = request.nextUrl.searchParams.get("secret");
    if (secret !== process.env.SESSION_SECRET) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    try {
        const results: string[] = [];

        // まずテーブル一覧を確認
        results.push("=== Current tables ===");
        const tables = await client.execute(
            "SELECT name FROM sqlite_master WHERE type='table' ORDER BY name"
        );
        tables.rows.forEach((r) => results.push(`- ${r.name}`));

        // 必要なテーブルを作成
        results.push("\n=== Creating missing tables ===");

        // usersテーブル
        try {
            await client.execute(`
                CREATE TABLE IF NOT EXISTS users (
                    id TEXT PRIMARY KEY NOT NULL,
                    name TEXT NOT NULL,
                    email TEXT NOT NULL UNIQUE,
                    email_verified INTEGER DEFAULT 0,
                    image TEXT,
                    created_at INTEGER NOT NULL,
                    updated_at INTEGER NOT NULL
                )
            `);
            results.push("✓ users table created/verified");
        } catch (e: any) {
            results.push(`✗ users: ${e.message}`);
        }

        // sessionsテーブル
        try {
            await client.execute(`
                CREATE TABLE IF NOT EXISTS sessions (
                    id TEXT PRIMARY KEY NOT NULL,
                    user_id TEXT NOT NULL,
                    expires_at INTEGER NOT NULL,
                    token TEXT NOT NULL UNIQUE,
                    created_at INTEGER NOT NULL,
                    updated_at INTEGER NOT NULL,
                    ip_address TEXT,
                    user_agent TEXT,
                    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
                )
            `);
            results.push("✓ sessions table created/verified");
        } catch (e: any) {
            results.push(`✗ sessions: ${e.message}`);
        }

        // accountsテーブル
        try {
            await client.execute(`
                CREATE TABLE IF NOT EXISTS accounts (
                    id TEXT PRIMARY KEY NOT NULL,
                    user_id TEXT NOT NULL,
                    account_id TEXT NOT NULL,
                    provider_id TEXT NOT NULL,
                    access_token TEXT,
                    refresh_token TEXT,
                    access_token_expires_at INTEGER,
                    refresh_token_expires_at INTEGER,
                    scope TEXT,
                    id_token TEXT,
                    created_at INTEGER NOT NULL,
                    updated_at INTEGER NOT NULL,
                    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
                )
            `);
            results.push("✓ accounts table created/verified");
        } catch (e: any) {
            results.push(`✗ accounts: ${e.message}`);
        }

        // verificationsテーブル
        try {
            await client.execute(`
                CREATE TABLE IF NOT EXISTS verifications (
                    id TEXT PRIMARY KEY NOT NULL,
                    identifier TEXT NOT NULL,
                    value TEXT NOT NULL,
                    expires_at INTEGER NOT NULL,
                    created_at INTEGER,
                    updated_at INTEGER
                )
            `);
            results.push("✓ verifications table created/verified");
        } catch (e: any) {
            results.push(`✗ verifications: ${e.message}`);
        }

        // user_rolesテーブル
        try {
            await client.execute(`
                CREATE TABLE IF NOT EXISTS user_roles (
                    id TEXT PRIMARY KEY NOT NULL,
                    user_id TEXT NOT NULL,
                    role TEXT DEFAULT 'guest' NOT NULL,
                    discord_id TEXT,
                    discord_username TEXT,
                    created_at INTEGER NOT NULL,
                    updated_at INTEGER NOT NULL,
                    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
                )
            `);
            results.push("✓ user_roles table created/verified");
        } catch (e: any) {
            results.push(`✗ user_roles: ${e.message}`);
        }

        // 更新後のテーブル一覧
        results.push("\n=== Tables after migration ===");
        const tablesAfter = await client.execute(
            "SELECT name FROM sqlite_master WHERE type='table' ORDER BY name"
        );
        tablesAfter.rows.forEach((r) => results.push(`- ${r.name}`));

        return NextResponse.json({
            success: true,
            results: results.join("\n")
        });
    } catch (error: any) {
        return NextResponse.json({
            error: error.message,
            stack: error.stack
        }, { status: 500 });
    }
}
