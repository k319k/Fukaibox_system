"use server";

import { db } from "@/lib/db";
import { users, userPoints, userRoles } from "@/lib/db/schema";
import { eq, desc, sql } from "drizzle-orm";

export interface RankingUser {
    id: string;
    name: string;
    image: string | null;
    points: number;
    rank: number;
    role: string;
    discordUsername: string | null;
}

/**
 * トップN名のランキングを取得
 */
export async function getTopRankings(limit: number = 5): Promise<RankingUser[]> {
    try {
        // ユーザーとポイントを結合して取得
        const results = await db
            .select({
                id: users.id,
                name: users.name,
                image: users.image,
                points: userPoints.points,
            })
            .from(users)
            .leftJoin(userPoints, eq(users.id, userPoints.userId))
            .orderBy(desc(sql`COALESCE(${userPoints.points}, 0)`))
            .limit(limit);

        // ロール情報を取得
        const roles = await db
            .select({
                userId: userRoles.userId,
                role: userRoles.role,
                discordUsername: userRoles.discordUsername,
            })
            .from(userRoles);

        const roleMap = new Map(roles.map(r => [r.userId, r]));

        // ランキングデータを構築
        return results.map((user, index) => {
            const role = roleMap.get(user.id);
            return {
                id: user.id,
                name: user.name,
                image: user.image,
                points: user.points ?? 0,
                rank: index + 1,
                role: role?.role || "guest",
                discordUsername: role?.discordUsername || null,
            };
        });
    } catch (error) {
        console.error("[getTopRankings] Error:", error);
        return [];
    }
}

/**
 * 現在のユーザーのランキング順位を取得
 */
export async function getCurrentUserRank(userId: string): Promise<{
    rank: number;
    points: number;
    totalUsers: number;
} | null> {
    try {
        // ユーザーのポイントを取得
        const userPoint = await db
            .select({ points: userPoints.points })
            .from(userPoints)
            .where(eq(userPoints.userId, userId))
            .limit(1);

        const currentPoints = userPoint[0]?.points ?? 0;

        // より高いポイントを持つユーザー数をカウント
        const higherRanked = await db
            .select({ count: sql<number>`COUNT(*)` })
            .from(userPoints)
            .where(sql`${userPoints.points} > ${currentPoints}`);

        const rank = (higherRanked[0]?.count ?? 0) + 1;

        // 総ユーザー数を取得
        const totalCount = await db
            .select({ count: sql<number>`COUNT(*)` })
            .from(users);

        return {
            rank,
            points: currentPoints,
            totalUsers: totalCount[0]?.count ?? 0,
        };
    } catch (error) {
        console.error("[getCurrentUserRank] Error:", error);
        return null;
    }
}

/**
 * 名誉儀員一覧を取得
 */
export async function getHonoraryMembers(): Promise<{
    id: string;
    name: string;
    image: string | null;
    discordUsername: string | null;
}[]> {
    try {
        const members = await db
            .select({
                id: users.id,
                name: users.name,
                image: users.image,
            })
            .from(users)
            .innerJoin(userRoles, eq(users.id, userRoles.userId))
            .where(eq(userRoles.role, "meiyo_giin"));

        // Discord名を取得
        const roles = await db
            .select({
                userId: userRoles.userId,
                discordUsername: userRoles.discordUsername,
            })
            .from(userRoles)
            .where(eq(userRoles.role, "meiyo_giin"));

        const discordMap = new Map(roles.map(r => [r.userId, r.discordUsername]));

        return members.map(m => ({
            ...m,
            discordUsername: discordMap.get(m.id) || null,
        }));
    } catch (error) {
        console.error("[getHonoraryMembers] Error:", error);
        return [];
    }
}
