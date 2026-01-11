"use server";

import { db } from "@/lib/db";
import { cookingProjects, cookingSections, cookingImages, cookingProposals, type CookingStatus } from "@/lib/db/schema";
import { eq, desc } from "drizzle-orm";

/**
 * 料理プロジェクト一覧を取得
 */
export async function getCookingProjects() {
    try {
        const projects = await db
            .select()
            .from(cookingProjects)
            .orderBy(desc(cookingProjects.createdAt));

        return projects;
    } catch (error) {
        console.error("Error fetching cooking projects:", error);
        return [];
    }
}

/**
 * 料理プロジェクトを作成
 */
export async function createCookingProject(title: string, description?: string, createdBy?: string) {
    const newProject = await db.insert(cookingProjects).values({
        id: `${Date.now()}-${Math.random().toString(36).substring(7)}`,
        title,
        description: description || "",
        status: "cooking",
        createdBy: createdBy || "system",
        createdAt: new Date(),
        updatedAt: new Date(),
    }).returning();

    return newProject[0];
}

/**
 * 特定の料理プロジェクトを取得
 */
export async function getCookingProject(projectId: string) {
    const project = await db
        .select()
        .from(cookingProjects)
        .where(eq(cookingProjects.id, projectId));

    return project[0] || null;
}

/**
 * 料理プロジェクトのステータスを更新
 */
export async function updateCookingProjectStatus(projectId: string, status: CookingStatus) {
    await db
        .update(cookingProjects)
        .set({
            status,
            updatedAt: new Date(),
        })
        .where(eq(cookingProjects.id, projectId));
}

/**
 * セクションを作成
 */
export async function createCookingSection(
    projectId: string,
    orderIndex: number,
    content: string,
    imageInstruction?: string
) {
    const newSection = await db.insert(cookingSections).values({
        id: `${Date.now()}-${Math.random().toString(36).substring(7)}`,
        projectId,
        orderIndex,
        content,
        imageInstruction: imageInstruction || "",
        createdAt: new Date(),
        updatedAt: new Date(),
    }).returning();

    return newSection[0];
}

/**
 * プロジェクトのセクション一覧を取得
 */
export async function getCookingSections(projectId: string) {
    const sections = await db
        .select()
        .from(cookingSections)
        .where(eq(cookingSections.projectId, projectId))
        .orderBy(cookingSections.orderIndex);

    return sections;
}

/**
 * セクションのコンテンツを更新
 */
export async function updateCookingSection(sectionId: string, content: string) {
    await db
        .update(cookingSections)
        .set({
            content,
            updatedAt: new Date(),
        })
        .where(eq(cookingSections.id, sectionId));
}

/**
 * 画像をセクションに追加
 */
export async function addCookingImage(
    sectionId: string,
    imageUrl: string,
    uploadedBy: string
) {
    const newImage = await db.insert(cookingImages).values({
        id: `${Date.now()}-${Math.random().toString(36).substring(7)}`,
        sectionId,
        uploadedBy,
        imageUrl,
        createdAt: new Date(),
    }).returning();

    return newImage[0];
}

/**
 * セクションの画像一覧を取得
 */
export async function getCookingImages(sectionId: string) {
    const images = await db
        .select()
        .from(cookingImages)
        .where(eq(cookingImages.sectionId, sectionId));

    return images;
}

/**
 * 推敲提案を作成
 */
export async function createCookingProposal(
    sectionId: string,
    proposedContent: string,
    proposedBy: string
) {
    const newProposal = await db.insert(cookingProposals).values({
        id: `${Date.now()}-${Math.random().toString(36).substring(7)}`,
        sectionId,
        proposedBy,
        proposedContent,
        status: "pending",
        createdAt: new Date(),
        updatedAt: new Date(),
    }).returning();

    return newProposal[0];
}

/**
 * セクションの推敲提案一覧を取得
 */
export async function getCookingProposals(sectionId: string) {
    const proposals = await db
        .select()
        .from(cookingProposals)
        .where(eq(cookingProposals.sectionId, sectionId))
        .orderBy(desc(cookingProposals.createdAt));

    return proposals;
}

/**
 * 推敲提案のステータスを更新
 */
export async function updateProposalStatus(
    proposalId: string,
    status: "pending" | "approved" | "rejected"
) {
    await db
        .update(cookingProposals)
        .set({
            status,
            updatedAt: new Date(),
        })
        .where(eq(cookingProposals.id, proposalId));
}
