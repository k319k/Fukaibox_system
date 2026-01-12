import { drizzle } from "drizzle-orm/libsql";
import { createClient } from "@libsql/client";
import { fetch as undiciFetch } from "undici";
import * as schema from "./schema";

// 環境変数から接続情報を取得
const url = process.env.TURSO_DATABASE_URL || process.env.DATABASE_URL;
const authToken = process.env.TURSO_AUTH_TOKEN;

// ビルド時の警告（本番環境でのみ）
if (!url && process.env.NODE_ENV === "production") {
  console.warn("Warning: Database URL is not defined.");
}

// Undici fetch を使用してVercelのfetch問題を回避
// libsql://プロトコルをhttps://に変換
const httpUrl = url?.replace(/^libsql:\/\//, 'https://');

export const client = createClient({
  url: httpUrl ?? ":memory:",
  authToken: authToken,
  fetch: undiciFetch as typeof fetch, // Node.js標準のfetch実装を使用
});

// Drizzle ORMインスタンス
export const db = drizzle(client, { schema });

// 互換性のためのエクスポート
export { client as libsqlClient };
