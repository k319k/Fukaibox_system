"use server";

import { db } from "@/lib/db";
import { toolsRatings, users } from "@/lib/db/schema";
import { eq, and, desc } from "drizzle-orm";
import { getSession } from "@/app/actions/auth";
import { z } from "zod";

// ==========================================
// 型定義
// ==========================================

export type ToolRating = {
    id: string;
    appId: string;
    userId: string;
    rating: number;
    comment: string | null;
    createdAt: Date;
    userName?: string;
    userImage?: string | null;
};

// ==========================================
// バリデーションスキーマ
// ==========================================

const ratingSchema = z.object({
    appId: z.string().min(1),
    rating: z.number().refine((val) => val === 1 || val === -1, {
        message: "評価は1（高評価）または-1（低評価）である必要があります",
    }),
    comment: z.string().max(500).optional(),
});

// ==========================================
// 評価操作
// ==========================================

/**
 * アプリの評価一覧を取得
 */
export async function getAppRatings(appId: string): Promise<ToolRating[]> {
    try {
        const ratings = await db
            .select({
                id: toolsRatings.id,
                appId: toolsRatings.appId,
                userId: toolsRatings.userId,
                rating: toolsRatings.rating,
                comment: toolsRatings.comment,
                createdAt: toolsRatings.createdAt,
                userName: users.name,
                userImage: users.image,
            })
            .from(toolsRatings)
            .leftJoin(users, eq(toolsRatings.userId, users.id))
            .where(eq(toolsRatings.appId, appId))
            .orderBy(desc(toolsRatings.createdAt));

        return ratings.map((r) => ({
            ...r,
            createdAt: new Date(r.createdAt as unknown as number),
        }));
    } catch (error) {
        console.error("Error fetching ratings:", error);
        return [];
    }
}

/**
 * ユーザーの評価を取得
 */
export async function getUserRating(appId: string): Promise<ToolRating | null> {
    const session = await getSession();
    if (!session?.user) {
        return null;
    }

    try {
        const ratings = await db
            .select()
            .from(toolsRatings)
            .where(
                and(
                    eq(toolsRatings.appId, appId),
                    eq(toolsRatings.userId, session.user.id)
                )
            )
            .limit(1);

        if (ratings.length === 0) {
            return null;
        }

        return {
            ...ratings[0],
            createdAt: new Date(ratings[0].createdAt as unknown as number),
        };
    } catch (error) {
        console.error("Error fetching user rating:", error);
        return null;
    }
}

/**
 * 評価を追加または更新
 */
export async function rateApp(data: z.infer<typeof ratingSchema>) {
    const session = await getSession();
    if (!session?.user) {
        return { success: false, error: "ログインが必要です" };
    }

    try {
        const validation = ratingSchema.safeParse(data);
        if (!validation.success) {
            return { success: false, error: validation.error.errors[0].message };
        }

        // 既存の評価を確認
        const existing = await db
            .select()
            .from(toolsRatings)
            .where(
                and(
                    eq(toolsRatings.appId, validation.data.appId),
                    eq(toolsRatings.userId, session.user.id)
                )
            )
            .limit(1);

        if (existing.length > 0) {
            // 更新
            await db
                .update(toolsRatings)
                .set({
                    rating: validation.data.rating,
                    comment: validation.data.comment || null,
                })
                .where(eq(toolsRatings.id, existing[0].id));
        } else {
            // 新規作成
            await db.insert(toolsRatings).values({
                id: crypto.randomUUID(),
                appId: validation.data.appId,
                userId: session.user.id,
                rating: validation.data.rating,
                comment: validation.data.comment || null,
                createdAt: new Date(),
            });
        }

        return { success: true };
    } catch (error) {
        console.error("Error rating app:", error);
        return { success: false, error: "評価の保存に失敗しました" };
    }
}

/**
 * 評価を削除
 */
export async function deleteRating(appId: string) {
    const session = await getSession();
    if (!session?.user) {
        return { success: false, error: "ログインが必要です" };
    }

    try {
        await db
            .delete(toolsRatings)
            .where(
                and(
                    eq(toolsRatings.appId, appId),
                    eq(toolsRatings.userId, session.user.id)
                )
            );

        return { success: true };
    } catch (error) {
        console.error("Error deleting rating:", error);
        return { success: false, error: "評価の削除に失敗しました" };
    }
}

/**
 * アプリの評価サマリーを取得
 */
export async function getAppRatingSummary(appId: string) {
    try {
        const ratings = await db
            .select({ rating: toolsRatings.rating })
            .from(toolsRatings)
            .where(eq(toolsRatings.appId, appId));

        const total = ratings.length;
        const likes = ratings.filter((r) => r.rating === 1).length;
        const dislikes = ratings.filter((r) => r.rating === -1).length;

        return { total, likes, dislikes };
    } catch (error) {
        console.error("Error fetching rating summary:", error);
        return { total: 0, likes: 0, dislikes: 0 };
    }
}
