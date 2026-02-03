import { drizzle } from "drizzle-orm/libsql";
import { createClient } from "@libsql/client";
import { fetch as undiciFetch } from "undici";
import * as schema from "./schema";
import { env } from "@/lib/env";

// 環境変数から接続情報を取得 (Zod検証済み)
const url = env.TURSO_DATABASE_URL;
const authToken = env.TURSO_AUTH_TOKEN;

// libsql:// スキームをそのまま使用（WebSocket接続）
// すでにlibsql://で始まっている場合はそのまま、それ以外はlibsql://に変換
const connectionUrl = url.startsWith("libsql://") ? url : url.replace(/^https?:\/\//, "libsql://");

// Undici fetchラッパー：RequestオブジェクトをURLに変換
// Node.jsのネイティブFetchとの互換性問題を解決
const customFetch: typeof fetch = async (input, init?) => {
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
  logger: process.env.NODE_ENV === "development", // 開発環境のみログ出力
});

// 互換性のためのエクスポート
export { client as libsqlClient };
