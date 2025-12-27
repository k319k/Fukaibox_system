// Database client for Turso/LibSQL (Cloudflare Workers)
// .server suffix ensures this only runs on the server
import { drizzle } from "drizzle-orm/libsql";
import { createClient } from "@libsql/client/web";
import * as schema from "./schema";

// Type definition for Cloudflare environment bindings
export interface Env {
    TURSO_DATABASE_URL: string;
    TURSO_AUTH_TOKEN: string;
    DISCORD_CLIENT_ID: string;
    DISCORD_CLIENT_SECRET: string;
    DISCORD_REDIRECT_URI: string;
    FRONTEND_URL: string;
    JWT_SECRET: string;
    GICHO_DISCORD_IDS: string;
    R2_ACCOUNT_ID?: string;
    R2_ACCESS_KEY_ID?: string;
    R2_SECRET_ACCESS_KEY?: string;
    R2_BUCKET_NAME?: string;
}

// Create database client from Cloudflare context
export function createDb(env: Env) {
    const client = createClient({
        url: env.TURSO_DATABASE_URL,
        authToken: env.TURSO_AUTH_TOKEN,
    });

    return drizzle(client, { schema });
}

// Type alias for the database instance
export type Database = ReturnType<typeof createDb>;
