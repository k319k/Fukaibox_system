"use server";

import { headers } from "next/headers";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { userRoles, users as userSchema } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import type { RoleType } from "@/lib/db/schema";
import { z } from "zod";

const registerSchema = z.object({
    email: z.string().email("有効なメールアドレスを入力してください"),
    password: z.string().min(8, "パスワードは8文字以上である必要があります"),
    name: z.string().min(1, "名前を入力してください"),
});

/**
 * 現在のセッションを取得
 */
export async function getSession() {
    try {
        const session = await auth.api.getSession({
            headers: await headers(),
        });

        // デバッグログ（本番環境での問題特定用）
        console.log("[getSession] Session check:", {
            hasSession: !!session,
            hasUser: !!session?.user,
            userId: session?.user?.id,
            userName: session?.user?.name,
        });

        return session;
    } catch (error) {
        console.error("[getSession] Error:", error);
        return null;
    }
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
        // Zod検証
        const validation = registerSchema.safeParse({ email, password, name });
        if (!validation.success) {
            return {
                success: false,
                error: validation.error.errors[0].message
            };
        }

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
    } catch (error: any) { // Type assertion for error handling
        console.error("Guest registration error:", error);
        // Better auth error handiling
        const errorMessage = error?.body?.message || error?.message || "登録に失敗しました";
        return { success: false, error: errorMessage };
    }
}

/**
 * ゲストユーザーを自動生成して登録（ワンクリックログイン用）
 */
export async function createGuestUser() {
    try {
        const randomId = crypto.randomUUID().slice(0, 8);
        const email = `guest-${randomId}@example.com`;
        const password = `guest-${crypto.randomUUID()}`; // Secure random password
        const name = `Guest-${randomId}`;

        const result = await registerGuest(email, password, name);

        if (result.success && result.user) {
            return { success: true, email, password };
        } else {
            return { success: false, error: result.error };
        }
    } catch (error) {
        console.error("Auto guest creation error:", error);
        return { success: false, error: "ゲストアカウントの作成に失敗しました" };
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

    // DBから最新のユーザー情報を取得（imageを含む）
    const userFromDb = await db
        .select({
            image: userSchema.image,
        })
        .from(userSchema)
        .where(eq(userSchema.id, session.user.id))
        .limit(1);

    const userImage = userFromDb[0]?.image || null;

    console.log("[getCurrentUserWithRole] User image from DB:", {
        userId: session.user.id,
        hasImage: !!userImage,
        imageUrl: userImage?.substring(0, 50),
    });

    return {
        ...session.user,
        image: userImage, // DBから取得したimageを使用
        role: role?.role || "guest",
        discordId: role?.discordId,
        discordUsername: role?.discordUsername,
    };
}
