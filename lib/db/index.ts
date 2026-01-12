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

// Undici fetchラッパー：RequestオブジェクトをURLに変換
const customFetch: typeof fetch = async (input, init?) => {
  // RequestオブジェクトをURLに変換
  const urlString = typeof input === 'string' ? input : input.url;
  const requestInit = typeof input === 'string' ? init : {
    ...init,
    method: input.method,
    headers: input.headers,
    body: input.body,
  };

  return undiciFetch(urlString, requestInit) as Promise<Response>;
};

// PDCA #1: Native libSQL Protocol (libsql://) を試行
// RETURNING句サポートのため、https://変換を削除してlibsql://プロトコルを直接使用
export const client = createClient({
  url: url ?? ":memory:",
  authToken: authToken,
  fetch: customFetch, // カスタムfetchラッパーを使用
});

// Drizzle ORMインスタンス（SQLite mode、クエリログ有効化）
export const db = drizzle(client, {
  schema,
  logger: true, // 実行されるSQLクエリをログ出力して確認
});

// 互換性のためのエクスポート
export { client as libsqlClient };
