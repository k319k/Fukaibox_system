"use server";

import { db } from "@/lib/db";
import { kitchenPresence, users } from "@/lib/db/schema";
import { eq, and, gt } from "drizzle-orm";
import { getSession } from "../auth";

/**
 * プレゼンス（最終アクセス日時・ステータス）を更新
 */
export async function updatePresenceStatus(projectId: string, status?: "not_participating" | "participating" | "completed") {
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
        const updateData: Partial<typeof kitchenPresence.$inferInsert> = {
            lastSeenAt: now,
        };
        if (status) {
            updateData.status = status;
        }

        await db
            .update(kitchenPresence)
            .set(updateData)
            .where(eq(kitchenPresence.id, existing[0].id));
    } else {
        // 新規作成
        await db.insert(kitchenPresence).values({
            id: crypto.randomUUID(),
            projectId,
            userId,
            lastSeenAt: now,
            status: status || "not_participating",
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
            status: kitchenPresence.status,
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
