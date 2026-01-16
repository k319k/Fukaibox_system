"use server";

import { db } from "@/lib/db";
import { cookingProjects, cookingSections, cookingImages, cookingProposals, type CookingStatus } from "@/lib/db/schema";
import { eq, desc, asc, and } from "drizzle-orm";
import { getSession } from "./auth";

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
export async function createCookingProject(title: string, description?: string) {
    // セッションからユーザーIDを取得
    const session = await getSession();
    const createdBy = session?.user?.id || "anonymous";

    const newProject = await db.insert(cookingProjects).values({
        id: crypto.randomUUID(),
        title,
        description: description || "",
        status: "cooking",
        createdBy,
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
        id: crypto.randomUUID(),
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
        .orderBy(asc(cookingSections.orderIndex));

    return sections;
}

/**
 * セクションのコンテンツを更新
 */
export async function updateCookingSection(
    sectionId: string,
    content: string,
    imageInstruction?: string
) {
    await db
        .update(cookingSections)
        .set({
            content,
            imageInstruction: imageInstruction ?? undefined,
            updatedAt: new Date(),
        })
        .where(eq(cookingSections.id, sectionId));
}

/**
 * セクションを削除
 */
export async function deleteCookingSection(sectionId: string) {
    await db
        .delete(cookingSections)
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
 * 画像をセクションに追加
 */
export async function addCookingImage(
    sectionId: string,
    imageUrl: string,
    uploadedBy?: string
) {
    const session = await getSession();
    const userId = uploadedBy || session?.user?.id || "anonymous";

    const newImage = await db.insert(cookingImages).values({
        id: crypto.randomUUID(),
        sectionId,
        uploadedBy: userId,
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
    proposedBy?: string
) {
    const session = await getSession();
    const userId = proposedBy || session?.user?.id || "anonymous";

    const newProposal = await db.insert(cookingProposals).values({
        id: crypto.randomUUID(),
        sectionId,
        proposedBy: userId,
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
 * プロジェクト内の全推敲提案を取得
 */
export async function getAllProposalsForProject(projectId: string) {
    // まずプロジェクトのセクションを取得
    const sections = await getCookingSections(projectId);
    const sectionIds = sections.map(s => s.id);

    if (sectionIds.length === 0) {
        return [];
    }

    // 各セクションの提案を取得
    const allProposals = [];
    for (const sectionId of sectionIds) {
        const proposals = await getCookingProposals(sectionId);
        allProposals.push(...proposals.map(p => ({
            ...p,
            sectionId,
        })));
    }

    return allProposals;
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

/**
 * 推敲提案を承認し、元のセクションに適用
 */
export async function applyCookingProposal(proposalId: string) {
    // 提案を取得
    const proposals = await db
        .select()
        .from(cookingProposals)
        .where(eq(cookingProposals.id, proposalId));

    const proposal = proposals[0];
    if (!proposal) {
        throw new Error("Proposal not found");
    }

    // セクションのコンテンツを更新
    await db
        .update(cookingSections)
        .set({
            content: proposal.proposedContent,
            updatedAt: new Date(),
        })
        .where(eq(cookingSections.id, proposal.sectionId));

    // 提案のステータスを承認済みに更新
    await updateProposalStatus(proposalId, "approved");
}
