"use server";

import { db } from "@/lib/db";
import { cookingSections } from "@/lib/db/schema";
import { eq, asc, and, gte } from "drizzle-orm";
import { getSession } from "../auth";

/**
 * プロジェクトのセクション一覧を取得
 */
export async function getCookingSections(projectId: string) {
    const sections = await db
        .select()
        .from(cookingSections)
        .where(eq(cookingSections.projectId, projectId))
        .orderBy(asc(cookingSections.orderIndex));

    // referenceImageUrls はDBではJSON文字列として保存されるため、パースして配列に変換
    return sections.map(s => ({
        ...s,
        referenceImageUrls: s.referenceImageUrls
            ? (() => { try { return JSON.parse(s.referenceImageUrls); } catch { return []; } })()
            : null
    }));
}

/**
 * セクションのコンテンツを更新
 */
export async function updateCookingSection(
    sectionId: string,
    content: string,
    imageInstruction?: string,
    allowImageSubmission?: boolean,
    referenceImageUrl?: string,
    referenceImageUrls?: string[]
) {
    const updateData: Partial<typeof cookingSections.$inferInsert> = {
        content,
        updatedAt: new Date(),
    };

    if (imageInstruction !== undefined) {
        updateData.imageInstruction = imageInstruction;
    }

    if (allowImageSubmission !== undefined) {
        updateData.allowImageSubmission = allowImageSubmission;
    }

    if (referenceImageUrl !== undefined) {
        updateData.referenceImageUrl = referenceImageUrl;
    }

    if (referenceImageUrls !== undefined) {
        updateData.referenceImageUrls = JSON.stringify(referenceImageUrls);
    }

    await db
        .update(cookingSections)
        .set(updateData)
        .where(eq(cookingSections.id, sectionId));
}

/**
 * セクションの並び順を更新
 */
export async function reorderCookingSections(
    projectId: string,
    orderMap: { id: string; order: number }[]
) {
    // トランザクション的に各セクションのorderIndexを更新
    for (const item of orderMap) {
        await db
            .update(cookingSections)
            .set({
                orderIndex: item.order,
                updatedAt: new Date(),
            })
            .where(and(
                eq(cookingSections.id, item.id),
                eq(cookingSections.projectId, projectId)
            ));
    }
}

/**
 * 新しいセクションを指定位置に挿入
 */
export async function createCookingSection(projectId: string, targetOrderIndex: number, content: string = "") {
    const session = await getSession();
    if (!session?.user) throw new Error("Unauthorized");

    // 既存のセクションを取得し、挿入位置以降のインデックスをシフト
    const existingSections = await db
        .select()
        .from(cookingSections)
        .where(
            and(
                eq(cookingSections.projectId, projectId),
                gte(cookingSections.orderIndex, targetOrderIndex)
            )
        );

    // インデックス更新
    for (const section of existingSections) {
        await db
            .update(cookingSections)
            .set({ orderIndex: (section.orderIndex || 0) + 1 })
            .where(eq(cookingSections.id, section.id));
    }

    // 新規セクション作成
    const newSection = await db.insert(cookingSections).values({
        id: crypto.randomUUID(),
        projectId,
        orderIndex: targetOrderIndex,
        content,
        allowImageSubmission: true,
        createdAt: new Date(),
        updatedAt: new Date(),
    }).returning();

    return newSection[0];
}

/**
 * セクションを削除＆インデックス詰め
 */
export async function deleteCookingSection(sectionId: string, projectId: string) {
    const session = await getSession();
    if (!session?.user) throw new Error("Unauthorized");

    const targetSection = await db.query.cookingSections.findFirst({
        where: eq(cookingSections.id, sectionId),
    });

    if (!targetSection) throw new Error("Section not found");

    const deletedIndex = targetSection.orderIndex || 0;

    // 削除
    await db.delete(cookingSections).where(eq(cookingSections.id, sectionId));

    // インデックス詰め
    const followingSections = await db
        .select()
        .from(cookingSections)
        .where(
            and(
                eq(cookingSections.projectId, projectId),
                gte(cookingSections.orderIndex, deletedIndex + 1)
            )
        );

    for (const section of followingSections) {
        await db
            .update(cookingSections)
            .set({ orderIndex: (section.orderIndex || 1) - 1 })
            .where(eq(cookingSections.id, section.id));
    }

    return { success: true };
}
