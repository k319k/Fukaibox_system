import { drizzle } from "drizzle-orm/libsql";
import { createClient } from "@libsql/client/http";
import * as schema from "./schema";

const url = process.env.TURSO_DATABASE_URL || process.env.DATABASE_URL;
const authToken = process.env.TURSO_AUTH_TOKEN;

// ビルド時に変数がなくてもエラーで落とさないようにする
if (!url && process.env.NODE_ENV === "production") {
  console.warn("Warning: Database URL is not defined.");
}

// Use libSQL HTTP client (pure HTTP-only, no WebSocket) to avoid fetch compatibility issues
// Convert libsql:// to https:// for HTTP-only connection
const httpUrl = url?.replace(/^libsql:\/\//, 'https://');

export const client = createClient({
  url: httpUrl ?? ":memory:",
  authToken: authToken,
});

export const db = drizzle(client, { schema });
export { client as libsqlClient };
