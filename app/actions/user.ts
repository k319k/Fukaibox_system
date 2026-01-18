"use server";

import { db } from "@/lib/db";
import { users, sessions, userRoles } from "@/lib/db/schema";
import { eq, desc, gte } from "drizzle-orm";

/**
 * すべてのユーザーとアクティブ状態を取得
 * セッションのupdatedAtが5分以内ならアクティブと判定
 */
export async function getAllUsersWithStatus() {
    try {
        // 現在時刻
        const now = new Date();

        // すべてのユーザーを取得
        const allUsers = await db
            .select({
                id: users.id,
                name: users.name,
                image: users.image,
            })
            .from(users)
            .orderBy(desc(users.createdAt));

        // 有効なセッション（expiresAtが現在より後）を持つユーザーIDを取得
        const activeSessions = await db
            .select({
                userId: sessions.userId,
            })
            .from(sessions)
            .where(gte(sessions.expiresAt, now));

        const activeUserIds = new Set(activeSessions.map(s => s.userId));

        // ユーザーロール情報を取得
        const roles = await db
            .select({
                userId: userRoles.userId,
                discordUsername: userRoles.discordUsername,
                role: userRoles.role,
            })
            .from(userRoles);

        const roleMap = new Map(roles.map(r => [r.userId, r]));

        // ユーザー情報にアクティブ状態とDiscordニックネームを追加
        const usersWithStatus = allUsers.map(user => {
            const role = roleMap.get(user.id);
            return {
                id: user.id,
                name: user.name,
                image: user.image,
                isOnline: activeUserIds.has(user.id),
                discordUsername: role?.discordUsername || null,
                role: role?.role || "guest",
            };
        });

        // オンラインユーザーを先に表示
        usersWithStatus.sort((a, b) => {
            if (a.isOnline && !b.isOnline) return -1;
            if (!a.isOnline && b.isOnline) return 1;
            return 0;
        });

        return usersWithStatus;
    } catch (error) {
        console.error("[getAllUsersWithStatus] Error:", error);
        return [];
    }
}

/**
 * ユーザーのDiscordニックネームを取得
 */
export async function getDiscordNickname(userId: string) {
    try {
        const role = await db
            .select({
                discordUsername: userRoles.discordUsername,
            })
            .from(userRoles)
            .where(eq(userRoles.userId, userId))
            .limit(1);

        return role[0]?.discordUsername || null;
    } catch (error) {
        console.error("[getDiscordNickname] Error:", error);
        return null;
    }
}

/**
 * 画像アップロードユーザーのユーザー名Map作成用
 */
export async function getUserDisplayNames(userIds: string[]) {
    if (userIds.length === 0) return {};

    try {
        const usersData = await db
            .select({
                id: users.id,
                name: users.name,
            })
            .from(users);

        const roles = await db
            .select({
                userId: userRoles.userId,
                discordUsername: userRoles.discordUsername,
            })
            .from(userRoles);

        const roleMap = new Map(roles.map(r => [r.userId, r.discordUsername]));

        const result: Record<string, string> = {};
        for (const user of usersData) {
            if (userIds.includes(user.id)) {
                // Discordニックネームがあればそれを使用、なければユーザー名
                result[user.id] = roleMap.get(user.id) || user.name;
            }
        }

        return result;
    } catch (error) {
        console.error("[getUserDisplayNames] Error:", error);
        return {};
    }
}
