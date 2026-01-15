import { drizzle } from "drizzle-orm/libsql";
import { createClient } from "@libsql/client";
import { fetch as undiciFetch } from "undici";
import * as schema from "./schema";
import { env } from "@/lib/env";

// 環境変数から接続情報を取得 (Zod検証済み)
const url = env.TURSO_DATABASE_URL;
const authToken = env.TURSO_AUTH_TOKEN;

// RETURNING句サポートのため、https:// などを libsql:// に強制変換
// これによりWebSocket経由で接続され、RETURNING句がサポートされる
const connectionUrl = url.replace(/^https?:\/\//, "libsql://");

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

export const client = createClient({
  url: connectionUrl,
  authToken: authToken,
  fetch: customFetch, // カスタムfetchラッパーを使用
});

// Drizzle ORMインスタンス（SQLite mode、クエリログ有効化）
export const db = drizzle(client, {
  schema,
  logger: env.NODE_ENV === "development", // 開発環境のみログ出力
});

// 互換性のためのエクスポート
export { client as libsqlClient };

