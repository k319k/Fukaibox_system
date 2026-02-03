"use server";

import { db } from "@/lib/db";
import { users, userPoints, pointHistory, userRoles } from "@/lib/db/schema";
import { eq, desc, sql } from "drizzle-orm";
import { revalidatePath } from "next/cache";

export interface PointHistoryEntry {
    id: string;
    userId: string;
    userName: string;
    amount: number;
    reason: string;
    createdAt: Date;
}

export interface UserWithPoints {
    id: string;
    name: string;
    image: string | null;
    points: number;
    role: string;
    discordUsername: string | null;
}

/**
 * 点数履歴を取得
 */
export async function getPointHistory(limit: number = 20): Promise<PointHistoryEntry[]> {
    try {
        const history = await db
            .select({
                id: pointHistory.id,
                userId: pointHistory.userId,
                amount: pointHistory.amount,
                reason: pointHistory.reason,
                createdAt: pointHistory.createdAt,
            })
            .from(pointHistory)
            .orderBy(desc(pointHistory.createdAt))
            .limit(limit);

        // ユーザー名を取得
        const userIds = [...new Set(history.map(h => h.userId))];
        if (userIds.length === 0) return [];

        const usersData = await db
            .select({ id: users.id, name: users.name })
            .from(users);
        const userMap = new Map(usersData.map(u => [u.id, u.name]));

        return history.map(h => ({
            ...h,
            userName: userMap.get(h.userId) || "不明",
        }));
    } catch (error) {
        console.error("[getPointHistory] Error:", error);
        return [];
    }
}

/**
 * 全ユーザーとポイントを取得
 */
export async function getAllUsersWithPoints(): Promise<UserWithPoints[]> {
    try {
        const allUsers = await db
            .select({
                id: users.id,
                name: users.name,
                image: users.image,
            })
            .from(users)
            .orderBy(users.name);

        const points = await db
            .select({
                userId: userPoints.userId,
                points: userPoints.points,
            })
            .from(userPoints);
        const pointsMap = new Map(points.map(p => [p.userId, p.points]));

        const roles = await db
            .select({
                userId: userRoles.userId,
                role: userRoles.role,
                discordUsername: userRoles.discordUsername,
            })
            .from(userRoles);
        const roleMap = new Map(roles.map(r => [r.userId, r]));

        return allUsers.map(user => {
            const role = roleMap.get(user.id);
            return {
                id: user.id,
                name: user.name,
                image: user.image,
                points: pointsMap.get(user.id) ?? 0,
                role: role?.role || "guest",
                discordUsername: role?.discordUsername || null,
            };
        });
    } catch (error) {
        console.error("[getAllUsersWithPoints] Error:", error);
        return [];
    }
}

/**
 * ユーザーの点数を変更
 */
export async function modifyUserPoints(
    userId: string,
    amount: number,
    reason: string
): Promise<{ success: boolean; error?: string }> {
    try {
        // 既存のポイントを取得
        const existing = await db
            .select({ points: userPoints.points })
            .from(userPoints)
            .where(eq(userPoints.userId, userId))
            .limit(1);

        const currentPoints = existing[0]?.points ?? 0;
        const newPoints = currentPoints + amount;

        if (existing[0]) {
            // 更新
            await db
                .update(userPoints)
                .set({
                    points: newPoints,
                    updatedAt: new Date(),
                })
                .where(eq(userPoints.userId, userId));
        } else {
            // 新規作成
            await db.insert(userPoints).values({
                id: crypto.randomUUID(),
                userId,
                points: newPoints,
                createdAt: new Date(),
                updatedAt: new Date(),
            });
        }

        // 履歴を記録
        await db.insert(pointHistory).values({
            id: crypto.randomUUID(),
            userId,
            amount,
            reason,
            createdAt: new Date(),
        });

        revalidatePath("/admin");
        revalidatePath("/");

        return { success: true };
    } catch (error) {
        console.error("[modifyUserPoints] Error:", error);
        return { success: false, error: "点数の変更に失敗しました" };
    }
}
