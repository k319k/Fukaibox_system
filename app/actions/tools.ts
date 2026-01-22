"use server";

import { db } from "@/lib/db";
import { toolsApps, toolsFiles, toolsRatings, users } from "@/lib/db/schema";
import { eq, desc, and, sql } from "drizzle-orm";
import { getSession } from "@/app/actions/auth";
import { z } from "zod";

// ==========================================
// 型定義
// ==========================================

export type ToolApp = {
    id: string;
    name: string;
    description: string | null;
    category: string | null;
    type: "embed" | "link" | "react" | "html";
    embedUrl: string | null;
    isPublic: boolean;
    createdBy: string;
    createdAt: Date;
    updatedAt: Date;
    creatorName?: string;
    creatorImage?: string | null;
    ratingCount?: number;
    avgRating?: number;
};

export type ToolFile = {
    id: string;
    appId: string;
    filename: string;
    content: string;
    createdAt: Date;
    updatedAt: Date;
};

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

const createAppSchema = z.object({
    name: z.string().min(1, "名前を入力してください").max(100),
    description: z.string().max(500).optional(),
    category: z.string().max(50).optional(),
    type: z.enum(["embed", "link", "react", "html"]),
    embedUrl: z.string().url().optional().nullable(),
    isPublic: z.boolean().default(false),
});

const updateAppSchema = createAppSchema.partial().extend({
    id: z.string().min(1),
});

// ==========================================
// CRUD操作
// ==========================================

/**
 * 公開されているツール一覧を取得
 */
export async function getPublicApps(category?: string): Promise<ToolApp[]> {
    try {
        const apps = await db
            .select({
                id: toolsApps.id,
                name: toolsApps.name,
                description: toolsApps.description,
                category: toolsApps.category,
                type: toolsApps.type,
                embedUrl: toolsApps.embedUrl,
                isPublic: toolsApps.isPublic,
                createdBy: toolsApps.createdBy,
                createdAt: toolsApps.createdAt,
                updatedAt: toolsApps.updatedAt,
                creatorName: users.name,
                creatorImage: users.image,
            })
            .from(toolsApps)
            .leftJoin(users, eq(toolsApps.createdBy, users.id))
            .where(
                category
                    ? and(eq(toolsApps.isPublic, true), eq(toolsApps.category, category))
                    : eq(toolsApps.isPublic, true)
            )
            .orderBy(desc(toolsApps.createdAt));

        return apps.map((app) => ({
            ...app,
            isPublic: app.isPublic ?? false,
            type: app.type as "embed" | "link" | "react" | "html",
            createdAt: new Date(app.createdAt as unknown as number),
            updatedAt: new Date(app.updatedAt as unknown as number),
        }));
    } catch (error) {
        console.error("Error fetching public apps:", error);
        return [];
    }
}

/**
 * ユーザーのツール一覧を取得（自分のアプリ）
 */
export async function getMyApps(): Promise<ToolApp[]> {
    const session = await getSession();
    if (!session?.user) {
        return [];
    }

    try {
        const apps = await db
            .select()
            .from(toolsApps)
            .where(eq(toolsApps.createdBy, session.user.id))
            .orderBy(desc(toolsApps.createdAt));

        return apps.map((app) => ({
            ...app,
            isPublic: app.isPublic ?? false,
            type: app.type as "embed" | "link" | "react" | "html",
            createdAt: new Date(app.createdAt as unknown as number),
            updatedAt: new Date(app.updatedAt as unknown as number),
        }));
    } catch (error) {
        console.error("Error fetching user apps:", error);
        return [];
    }
}

/**
 * ツールの詳細を取得
 */
export async function getAppById(appId: string): Promise<ToolApp | null> {
    try {
        const apps = await db
            .select({
                id: toolsApps.id,
                name: toolsApps.name,
                description: toolsApps.description,
                category: toolsApps.category,
                type: toolsApps.type,
                embedUrl: toolsApps.embedUrl,
                isPublic: toolsApps.isPublic,
                createdBy: toolsApps.createdBy,
                createdAt: toolsApps.createdAt,
                updatedAt: toolsApps.updatedAt,
                creatorName: users.name,
                creatorImage: users.image,
            })
            .from(toolsApps)
            .leftJoin(users, eq(toolsApps.createdBy, users.id))
            .where(eq(toolsApps.id, appId))
            .limit(1);

        if (apps.length === 0) {
            return null;
        }

        const app = apps[0];
        return {
            ...app,
            isPublic: app.isPublic ?? false,
            type: app.type as "embed" | "link" | "react" | "html",
            createdAt: new Date(app.createdAt as unknown as number),
            updatedAt: new Date(app.updatedAt as unknown as number),
        };
    } catch (error) {
        console.error("Error fetching app:", error);
        return null;
    }
}

/**
 * 新規ツールを作成
 */
export async function createApp(data: z.infer<typeof createAppSchema>) {
    const session = await getSession();
    if (!session?.user) {
        return { success: false, error: "ログインが必要です" };
    }

    try {
        const validation = createAppSchema.safeParse(data);
        if (!validation.success) {
            return { success: false, error: validation.error.errors[0].message };
        }

        const id = crypto.randomUUID();
        const now = new Date();

        await db.insert(toolsApps).values({
            id,
            name: validation.data.name,
            description: validation.data.description || null,
            category: validation.data.category || null,
            type: validation.data.type,
            embedUrl: validation.data.embedUrl || null,
            isPublic: validation.data.isPublic,
            createdBy: session.user.id,
            createdAt: now,
            updatedAt: now,
        });

        return { success: true, appId: id };
    } catch (error) {
        console.error("Error creating app:", error);
        return { success: false, error: "ツールの作成に失敗しました" };
    }
}

/**
 * ツールを更新
 */
export async function updateApp(data: z.infer<typeof updateAppSchema>) {
    const session = await getSession();
    if (!session?.user) {
        return { success: false, error: "ログインが必要です" };
    }

    try {
        const validation = updateAppSchema.safeParse(data);
        if (!validation.success) {
            return { success: false, error: validation.error.errors[0].message };
        }

        // 所有者確認
        const existing = await db
            .select()
            .from(toolsApps)
            .where(eq(toolsApps.id, validation.data.id))
            .limit(1);

        if (existing.length === 0) {
            return { success: false, error: "ツールが見つかりません" };
        }

        if (existing[0].createdBy !== session.user.id) {
            return { success: false, error: "編集権限がありません" };
        }

        const updateData: Partial<typeof toolsApps.$inferInsert> = {
            updatedAt: new Date(),
        };

        if (validation.data.name !== undefined) updateData.name = validation.data.name;
        if (validation.data.description !== undefined) updateData.description = validation.data.description;
        if (validation.data.category !== undefined) updateData.category = validation.data.category;
        if (validation.data.type !== undefined) updateData.type = validation.data.type;
        if (validation.data.embedUrl !== undefined) updateData.embedUrl = validation.data.embedUrl;
        if (validation.data.isPublic !== undefined) updateData.isPublic = validation.data.isPublic;

        await db.update(toolsApps).set(updateData).where(eq(toolsApps.id, validation.data.id));

        return { success: true };
    } catch (error) {
        console.error("Error updating app:", error);
        return { success: false, error: "ツールの更新に失敗しました" };
    }
}

/**
 * ツールを削除
 */
export async function deleteApp(appId: string) {
    const session = await getSession();
    if (!session?.user) {
        return { success: false, error: "ログインが必要です" };
    }

    try {
        // 所有者確認
        const existing = await db
            .select()
            .from(toolsApps)
            .where(eq(toolsApps.id, appId))
            .limit(1);

        if (existing.length === 0) {
            return { success: false, error: "ツールが見つかりません" };
        }

        if (existing[0].createdBy !== session.user.id) {
            return { success: false, error: "削除権限がありません" };
        }

        await db.delete(toolsApps).where(eq(toolsApps.id, appId));

        return { success: true };
    } catch (error) {
        console.error("Error deleting app:", error);
        return { success: false, error: "ツールの削除に失敗しました" };
    }
}

/**
 * カテゴリ一覧を取得
 */
export async function getCategories(): Promise<string[]> {
    try {
        const results = await db
            .selectDistinct({ category: toolsApps.category })
            .from(toolsApps)
            .where(eq(toolsApps.isPublic, true));

        return results
            .map((r) => r.category)
            .filter((c): c is string => c !== null);
    } catch (error) {
        console.error("Error fetching categories:", error);
        return [];
    }
}
