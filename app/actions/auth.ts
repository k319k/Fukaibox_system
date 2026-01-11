"use server";

import { headers } from "next/headers";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { userRoles } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import type { RoleType } from "@/lib/db/schema";

/**
 * 現在のセッションを取得
 */
export async function getSession() {
    const session = await auth.api.getSession({
        headers: await headers(),
    });
    return session;
}

/**
 * 現在のユーザーのロール情報を取得
 */
export async function getUserRole(userId: string) {
    const roles = await db
        .select()
        .from(userRoles)
        .where(eq(userRoles.userId, userId))
        .limit(1);

    return roles[0] || null;
}

/**
 * ユーザーのロール情報を更新
 * @param userId ユーザーID
 * @param role 新しいロール
 * @param discordId Discord ID（オプション）
 * @param discordUsername Discord ユーザー名（オプション）
 */
export async function updateUserRole(
    userId: string,
    role: RoleType,
    discordId?: string,
    discordUsername?: string
) {
    // 既存のロール情報を確認
    const existing = await getUserRole(userId);

    if (existing) {
        // 更新
        await db
            .update(userRoles)
            .set({
                role,
                discordId: discordId || existing.discordId,
                discordUsername: discordUsername || existing.discordUsername,
                updatedAt: new Date(),
            })
            .where(eq(userRoles.userId, userId));
    } else {
        // 新規作成
        await db.insert(userRoles).values({
            id: crypto.randomUUID(),
            userId,
            role,
            discordId,
            discordUsername,
            createdAt: new Date(),
            updatedAt: new Date(),
        });
    }
}

/**
 * ゲストユーザーを登録
 * @param email メールアドレス
 * @param password パスワード
 * @param name 名前
 */
export async function registerGuest(email: string, password: string, name: string) {
    try {
        // better-authのsignUpを使用
        const result = await auth.api.signUpEmail({
            body: {
                email,
                password,
                name,
            },
        });

        if (result.user) {
            // ゲストロールを設定
            await updateUserRole(result.user.id, "guest");
        }

        return { success: true, user: result.user };
    } catch (error) {
        console.error("Guest registration error:", error);
        return { success: false, error: "登録に失敗しました" };
    }
}

/**
 * 現在のユーザー情報とロールを取得
 */
export async function getCurrentUserWithRole() {
    const session = await getSession();
    if (!session?.user) {
        return null;
    }

    const role = await getUserRole(session.user.id);

    return {
        ...session.user,
        role: role?.role || "guest",
        discordId: role?.discordId,
        discordUsername: role?.discordUsername,
    };
}
