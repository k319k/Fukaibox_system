"use server";

import { db } from "@/lib/db";
import { kitchenPresence, users } from "@/lib/db/schema";
import { eq, and, gt } from "drizzle-orm";
import { getSession } from "../auth";

/**
 * プレゼンス（最終アクセス日時）を更新
 */
export async function updatePresence(projectId: string) {
    const session = await getSession();
    if (!session?.user?.id) {
        return;
    }

    const userId = session.user.id;
    const now = new Date();

    // 既存のエントリを確認
    const existing = await db
        .select()
        .from(kitchenPresence)
        .where(
            and(
                eq(kitchenPresence.projectId, projectId),
                eq(kitchenPresence.userId, userId)
            )
        );

    if (existing.length > 0) {
        // 更新
        await db
            .update(kitchenPresence)
            .set({ lastSeenAt: now })
            .where(eq(kitchenPresence.id, existing[0].id));
    } else {
        // 新規作成
        await db.insert(kitchenPresence).values({
            id: crypto.randomUUID(),
            projectId,
            userId,
            lastSeenAt: now,
        });
    }
}

/**
 * プロジェクトの現在のアクティブユーザーを取得
 * (過去60秒以内にアクセスのあったユーザー)
 */
export async function getProjectPresence(projectId: string) {
    const now = new Date();
    const oneMinuteAgo = new Date(now.getTime() - 60 * 1000);

    const activePresences = await db
        .select({
            userId: kitchenPresence.userId,
            lastSeenAt: kitchenPresence.lastSeenAt,
            userName: users.name,
            userImage: users.image,
        })
        .from(kitchenPresence)
        .innerJoin(users, eq(kitchenPresence.userId, users.id))
        .where(
            and(
                eq(kitchenPresence.projectId, projectId),
                gt(kitchenPresence.lastSeenAt, oneMinuteAgo)
            )
        );

    return activePresences;
}
