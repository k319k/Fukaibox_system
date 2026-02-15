import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { createAuthMiddleware } from "better-auth/api";
import { db } from "./db";
import * as schema from "./db/schema";
import { userRoles } from "./db/schema";
import { env } from "@/lib/env";
import { eq } from "drizzle-orm";

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
            clientId: env.DISCORD_CLIENT_ID!,
            clientSecret: env.DISCORD_CLIENT_SECRET!,
            mapProfileToUser: (profile) => {
                return {
                    image: profile.avatar ? `https://cdn.discordapp.com/avatars/${profile.id}/${profile.avatar}.png` : undefined,
                };
            },
        },
    },
    session: {
        expiresIn: 60 * 60 * 24 * 7, // 7日
        updateAge: 60 * 60 * 24, // 1日
    },
    secret: env.BETTER_AUTH_SECRET!,
    baseURL: env.BETTER_AUTH_URL!,
    trustedOrigins: [
        "http://localhost:3000",
        "http://127.0.0.1:3000",
        env.BETTER_AUTH_URL!, // 本番URL
        // Vercel Preview/Production URLs
        ...(process.env.VERCEL_URL ? [`https://${process.env.VERCEL_URL}`] : []),
        ...(process.env.NEXT_PUBLIC_VERCEL_URL ? [`https://${process.env.NEXT_PUBLIC_VERCEL_URL}`] : []),
    ],
    hooks: {
        after: createAuthMiddleware(async (ctx) => {
            // 任意のセッション作成時にロールを自動設定
            const newSession = ctx.context.newSession;
            if (newSession?.user) {
                const userId = newSession.user.id;

                // 既存のロール情報を確認
                const existingRoles = await db.select()
                    .from(userRoles)
                    .where(eq(userRoles.userId, userId));

                // ロールが未設定の場合のみ作成
                if (existingRoles.length === 0) {
                    // ... (existing role creation logic) ...
                    // accountsテーブルからDiscord IDを取得
                    const accounts = await db.select()
                        .from(schema.accounts)
                        .where(eq(schema.accounts.userId, userId));

                    const discordAccount = accounts.find(a => a.providerId === "discord");
                    const discordId = discordAccount?.accountId || "";

                    // ロール判定（Discord IDベース）
                    let role: schema.RoleType = "guest";
                    if (discordId && GICHO_DISCORD_IDS.includes(discordId)) {
                        role = "gicho";
                    } else if (discordId) {
                        role = "giin"; // Discordログインユーザーは最低でも儀員
                    }

                    // 新規作成
                    await db.insert(userRoles).values({
                        id: crypto.randomUUID(),
                        userId,
                        role,
                        discordId: discordId || null,
                        discordUsername: newSession.user.name || null,
                        createdAt: new Date(),
                        updatedAt: new Date(),
                    });
                }

                // アバター画像の強制同期（既存ユーザー含む）
                try {
                    // --- SPECIAL NOTIFICATION START (USER TRIGGER) ---
                    // 特定ユーザーがログインした際にDiscordへ通知を送る
                    // 不要になった場合はこのブロックごと削除してください
                    if (userId === "1m3c399fZuUy6YBmCFivh0iun40IsCU8") {
                        await fetch("https://discordapp.com/api/webhooks/1309678377275232358/jWzO4sEhrbKZ7q1pzuTKOm8z_3gUsVXJHm2ef9PTGjlE6mJYFUqVHmyNC-Ksg0hESS_o", {
                            method: "POST",
                            headers: { "Content-Type": "application/json" },
                            body: JSON.stringify({
                                content: `🚨 **Special User Login Alert**\nUser: **${newSession.user.name}**\nID: \`${userId}\`\nTime: ${new Date().toLocaleString('ja-JP', { timeZone: 'Asia/Tokyo' })}`,
                            }),
                        });
                        console.log("Notification sent for special user login.");
                    }
                    // --- SPECIAL NOTIFICATION END ---

                    // 最新のDiscordアクセストークンを取得
                    const accounts = await db.select()
                        .from(schema.accounts)
                        .where(eq(schema.accounts.userId, userId));

                    const discordAccount = accounts.find(a => a.providerId === "discord");

                    if (discordAccount?.accessToken) {
                        // Discord APIからプロファイルを取得
                        const response = await fetch("https://discord.com/api/users/@me", {
                            headers: {
                                Authorization: `Bearer ${discordAccount.accessToken}`,
                            },
                        });

                        if (response.ok) {
                            const profile = await response.json();
                            const avatarUrl = profile.avatar
                                ? `https://cdn.discordapp.com/avatars/${profile.id}/${profile.avatar}.png`
                                : null;

                            // usersテーブルを更新
                            if (avatarUrl) {
                                await db.update(schema.users)
                                    .set({ image: avatarUrl, updatedAt: new Date() })
                                    .where(eq(schema.users.id, userId));
                            }
                        }
                    }
                } catch (e) {
                    console.error("Failed to sync Discord avatar:", e);
                }
            }
        }),
    },
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
