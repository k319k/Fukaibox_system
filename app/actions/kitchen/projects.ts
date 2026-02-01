"use server";

import { db } from "@/lib/db";
import { cookingProjects, cookingSections, cookingImages, cookingProposals, type CookingStatus } from "@/lib/db/schema";
import { eq, desc } from "drizzle-orm";
import { getSession } from "../auth";
import { getCookingSections } from "./sections";

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
 * 台本全体からプロジェクト+セクションを一括作成
 */
export async function createProjectWithScript(
    title: string,
    description: string,
    fullScript: string
) {
    const session = await getSession();
    const createdBy = session?.user?.id || "anonymous";

    console.log("[createProjectWithScript] Request:", {
        title,
        fullScriptLength: fullScript.length,
        createdBy,
    });

    // 1. プロジェクト作成
    const newProject = await db.insert(cookingProjects).values({
        id: crypto.randomUUID(),
        title,
        description: description || "",
        status: "cooking",
        createdBy,
        createdAt: new Date(),
        updatedAt: new Date(),
    }).returning();

    const project = newProject[0];

    // 2. 改行*2で分割（\n\n または \r\n\r\n）
    const sections = fullScript
        .split(/\n\n+|\r\n\r\n+/)
        .map(s => s.trim())
        .filter(s => s.length > 0);

    console.log("[createProjectWithScript] Sections to create:", sections.length);

    // 3. セクション一括作成
    for (let i = 0; i < sections.length; i++) {
        await db.insert(cookingSections).values({
            id: crypto.randomUUID(),
            projectId: project.id,
            orderIndex: i,
            content: sections[i],
            imageInstruction: "",
            allowImageSubmission: true, // デフォルトで許可
            createdAt: new Date(),
            updatedAt: new Date(),
        });
    }

    console.log("[createProjectWithScript] Success:", project.id);
    return project;
}

/**
 * 既存プロジェクトに台本を設定し、セクションを一括作成
 * 既存のセクションがあれば削除して上書き
 */
/**
 * 既存プロジェクトに台本を設定し、セクションを一括作成
 * 既存のセクションがあれば削除して上書き
 */
export async function setProjectScript(projectId: string, fullScript: string) {
    try {
        const session = await getSession();
        if (!session?.user) {
            throw new Error("認証が必要です");
        }

        console.log("[setProjectScript] Start", { projectId, scriptLength: fullScript.length });

        // 改行*2で分割
        const sections = fullScript
            .split(/\n\n+|\r\n\r\n+/)
            .map(s => s.trim())
            .filter(s => s.length > 0);

        console.log("[setProjectScript] Parsed sections count:", sections.length);

        if (sections.length === 0) {
            // 空の場合は削除だけして終了
            await db.delete(cookingSections).where(eq(cookingSections.projectId, projectId));
            return [];
        }

        // 既存のセクションを削除
        await db.delete(cookingSections).where(eq(cookingSections.projectId, projectId));

        // セクションデータの準備
        const sectionData = sections.map((content, i) => ({
            id: crypto.randomUUID(),
            projectId,
            orderIndex: i,
            content,
            imageInstruction: "",
            allowImageSubmission: true,
            createdAt: new Date(),
            updatedAt: new Date(),
        }));

        // 一括作成 (SQLiteの変数制限を考慮してチャンク分割)
        // 1回あたり20件程度に分割して挿入
        const BATCH_SIZE = 20;
        const createdSections = [];

        for (let i = 0; i < sectionData.length; i += BATCH_SIZE) {
            const batch = sectionData.slice(i, i + BATCH_SIZE);
            const res = await db.insert(cookingSections).values(batch).returning();
            createdSections.push(...res);
        }

        console.log("[setProjectScript] Success. Created:", createdSections.length);
        return createdSections;

    } catch (error) {
        console.error("[setProjectScript] Critical Error:", error);
        // クライアントにエラー内容を伝えるためにErrorを投げ直す
        throw new Error(`Failed to set script: ${error instanceof Error ? error.message : String(error)}`);
    }
}

/**
 * 料理プロジェクトを削除（関連セクション・画像も削除）
 */
export async function deleteCookingProject(projectId: string) {
    const session = await getSession();
    if (!session?.user) {
        throw new Error("認証が必要です");
    }

    console.log("[deleteCookingProject] Starting deletion for project:", projectId);

    try {
        // 関連するセクションを取得
        const sections = await db
            .select({ id: cookingSections.id })
            .from(cookingSections)
            .where(eq(cookingSections.projectId, projectId));

        console.log("[deleteCookingProject] Found sections:", sections.length);

        // 各セクションの推敲提案を削除
        for (const section of sections) {
            await db.delete(cookingProposals).where(eq(cookingProposals.sectionId, section.id));
        }
        console.log("[deleteCookingProject] Deleted proposals");

        // 画像のsectionId参照を解除（set null）してから削除
        await db.update(cookingImages)
            .set({ sectionId: null })
            .where(eq(cookingImages.projectId, projectId));
        console.log("[deleteCookingProject] Cleared image section references");

        // 関連する画像を削除
        await db.delete(cookingImages).where(eq(cookingImages.projectId, projectId));
        console.log("[deleteCookingProject] Deleted images");

        // 関連するセクションを削除
        await db.delete(cookingSections).where(eq(cookingSections.projectId, projectId));
        console.log("[deleteCookingProject] Deleted sections");

        // プロジェクトを削除
        await db.delete(cookingProjects).where(eq(cookingProjects.id, projectId));
        console.log("[deleteCookingProject] Deleted project - Success");

        return { success: true };
    } catch (error) {
        console.error("[deleteCookingProject] Error:", error);
        throw new Error(`プロジェクトの削除に失敗しました: ${error instanceof Error ? error.message : String(error)}`);
    }
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
 * プロジェクトの台本テキストを生成（詳細版：セクション見出し・画像指示込み）
 */
export async function getProjectScript(projectId: string) {
    const project = await getCookingProject(projectId);
    const sections = await getCookingSections(projectId);

    if (!project) {
        throw new Error("Project not found");
    }

    let script = `# ${project.title}\n\n`;
    if (project.description) {
        script += `${project.description}\n\n`;
    }
    script += `---\n\n`;

    sections.forEach((section, index) => {
        script += `## セクション ${index + 1}\n\n`;
        script += `${section.content}\n\n`;
        if (section.imageInstruction) {
            script += `**画像指示**: ${section.imageInstruction}\n\n`;
        }
        script += `---\n\n`;
    });

    return script;
}

/**
 * プロジェクトの台本テキストを生成（本文のみ：セクション見出し・画像指示なし）
 */
export async function getProjectScriptBodyOnly(projectId: string) {
    const sections = await getCookingSections(projectId);

    // 全セクションの本文を空行で結合
    const bodyOnly = sections
        .map((s) => s.content || "")
        .filter((c) => c.trim())
        .join("\n\n");

    return bodyOnly;
}

