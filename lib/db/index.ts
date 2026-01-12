import { drizzle } from "drizzle-orm/libsql";
import { createClient } from "@libsql/client/web";
import * as schema from "./schema";

const url = process.env.TURSO_DATABASE_URL || process.env.DATABASE_URL;
const authToken = process.env.TURSO_AUTH_TOKEN;

// ビルド時に変数がなくてもエラーで落とさないようにする
if (!url && process.env.NODE_ENV === "production") {
  console.warn("Warning: Database URL is not defined.");
}

// Use libSQL web client (HTTP-only) to avoid Node.js fetch compatibility issues
// Convert libsql:// to https:// for HTTP-only connection
// Explicitly disable sync to avoid resp.body?.cancel issues
const httpUrl = url?.replace(/^libsql:\/\//, 'https://');

export const client = createClient({
  url: httpUrl ?? ":memory:",
  authToken: authToken,
  syncUrl: undefined, // Disable sync protocol to force async HTTP-only
});

export const db = drizzle(client, { schema });
export { client as libsqlClient };
