import { createClient } from "@libsql/client";
import { drizzle } from "drizzle-orm/libsql";
import * as schema from "./schema";

const url = process.env.TURSO_DATABASE_URL || process.env.DATABASE_URL;
const authToken = process.env.TURSO_AUTH_TOKEN;

// ビルド時に変数がなくてもエラーで落とさないようにする
if (!url && process.env.NODE_ENV === "production") {
  console.warn("Warning: Database URL is not defined.");
}

// Use HTTP-only connection to avoid resp.body?.cancel and URL parsing errors
// Force HTTP by converting wss:// to https:// if present
const httpUrl = url?.replace(/^wss:\/\//, 'https://').replace(/^ws:\/\//, 'http://');

export const client = createClient({
  url: httpUrl ?? ":memory:",
  authToken: authToken,
});

export const db = drizzle(client, { schema });
export { client as libsqlClient };
