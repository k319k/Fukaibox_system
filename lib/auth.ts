import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { db } from "./db";
import * as schema from "./db/schema";
import { env } from "@/lib/env";

// 儀長のDiscord ID一覧
const GICHO_DISCORD_IDS = (env.GICHO_DISCORD_IDS || "").split(",").filter(Boolean);

// ロールID
const GIIN_ROLE_ID = env.GIIN_ROLE_ID || "";
const MEIYO_GIIN_ROLE_ID = env.MEIYO_GIIN_ROLE_ID || "";

export const auth = betterAuth({
    database: drizzleAdapter(db, {
        provider: "sqlite",
        schema: {
            user: schema.users,
            session: schema.sessions,
            account: schema.accounts,
            verification: schema.verifications,
        },
    }),
    emailAndPassword: {
        enabled: true,
    },
    socialProviders: {
        discord: {
            clientId: env.DISCORD_CLIENT_ID,
            clientSecret: env.DISCORD_CLIENT_SECRET,
        },
    },
    session: {
        expiresIn: 60 * 60 * 24 * 7, // 7日
        updateAge: 60 * 60 * 24, // 1日
    },
    secret: env.BETTER_AUTH_SECRET,
    baseURL: env.BETTER_AUTH_URL,
    trustedOrigins: [
        "http://localhost:3000",
        "http://127.0.0.1:3000",
        env.BETTER_AUTH_URL, // 本番URL
    ],
});

/**
 * Discord IDからロールを判定
 */
export function determineRoleFromDiscordId(discordId: string): schema.RoleType {
    if (GICHO_DISCORD_IDS.includes(discordId)) {
        return "gicho";
    }
    return "giin"; // Discordログインの場合は最低でも儀員
}

/**
 * Discordロールからロールを判定
 * Discord APIで取得したロール一覧を元に判定
 */
export function determineRoleFromDiscordRoles(
    discordId: string,
    roleIds: string[]
): schema.RoleType {
    // 儀長判定（Discord ID）
    if (GICHO_DISCORD_IDS.includes(discordId)) {
        return "gicho";
    }

    // 名誉儀員判定
    if (MEIYO_GIIN_ROLE_ID && roleIds.includes(MEIYO_GIIN_ROLE_ID)) {
        return "meiyo_giin";
    }

    // 儀員判定
    if (GIIN_ROLE_ID && roleIds.includes(GIIN_ROLE_ID)) {
        return "giin";
    }

    return "guest";
}

export type Auth = typeof auth;
