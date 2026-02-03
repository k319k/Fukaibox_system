"use server";

import { db } from "@/lib/db";
import { cookingProposals, cookingSections } from "@/lib/db/schema";
import { eq, desc } from "drizzle-orm";
import { getSession } from "../auth";
import { getCookingSections } from "./sections";

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

    await updateProposalStatus(proposalId, "approved");
}
