"use server";

import { db } from "@/lib/db";
import { cookingImages, userRoles, cookingSections, users } from "@/lib/db/schema";
import { eq, desc, asc, and } from "drizzle-orm";
import { getSession } from "../auth";
import { generateUploadUrl, getPublicUrl } from "@/lib/r2";

/**
 * 画像アップロード用の署名付きURLを取得
 */
export async function getUploadUrl(filename: string, contentType: string, projectId: string) {
    try {
        const session = await getSession();

        // 詳細なデバッグログ
        console.log("[getUploadUrl] Request:", {
            filename,
            contentType,
            projectId,
            hasSession: !!session,
            hasUser: !!session?.user,
            userId: session?.user?.id,
        });

        if (!session?.user) {
            console.error("[getUploadUrl] No session or user found");
            throw new Error("認証が必要です。ログインしてください。");
        }

        // 正しい拡張子を取得
        const ext = filename.split('.').pop();
        const uniqueId = crypto.randomUUID();
        const key = `cooking-images/${projectId}/${uniqueId}.${ext}`;

        console.log("[getUploadUrl] Generating URL for key:", key);
        const url = await generateUploadUrl(key, contentType);
        console.log("[getUploadUrl] Success");

        return { url, key, publicUrl: getPublicUrl(key) };
    } catch (error) {
        console.error("[getUploadUrl] Error:", error);
        throw error;
    }
}

/**
 * 画像アップロード完了を確認し、DBに登録
 */
export async function confirmImageUpload(
    projectId: string,
    key: string,
    sectionId?: string | null
) {
    try {
        const session = await getSession();
        const userId = session?.user?.id || "anonymous";

        console.log("[confirmImageUpload] Request:", {
            projectId,
            key,
            sectionId,
            userId,
        });

        const publicUrl = getPublicUrl(key);

        const newImage = await db.insert(cookingImages).values({
            id: crypto.randomUUID(),
            projectId,
            sectionId: sectionId || null,
            uploadedBy: userId,
            imageUrl: publicUrl,
            createdAt: new Date(),
        }).returning();

        console.log("[confirmImageUpload] Success", newImage[0].id);
        return newImage[0];
    } catch (error) {
        console.error("[confirmImageUpload] Error:", error);
        throw error;
    }
}

/**
 * 画像のセクション割り当てを更新
 */
export async function updateImageSelection(
    imageId: string,
    sectionId: string | null,
    isSelected: boolean = true
) {
    await db
        .update(cookingImages)
        .set({
            sectionId,
            isSelected,
        })
        .where(eq(cookingImages.id, imageId));
}

/**
 * 画像のコメントを更新
 */
export async function updateCookingImageComment(
    imageId: string,
    comment: string
) {
    const session = await getSession();
    if (!session?.user) {
        throw new Error("Unauthorized");
    }

    const image = await db.query.cookingImages.findFirst({
        where: eq(cookingImages.id, imageId),
    });

    if (!image) {
        throw new Error("Image not found");
    }

    // 権限チェック: 自分の画像、または議長/名誉儀員のみ編集可能
    const userRoleRecord = await db.query.userRoles.findFirst({
        where: eq(userRoles.userId, session.user.id),
        columns: { role: true }
    });

    const isAuthorized = image.uploadedBy === session.user.id ||
        userRoleRecord?.role === "gicho" ||
        userRoleRecord?.role === "meiyo_giin";

    if (!isAuthorized) {
        throw new Error("Forbidden");
    }

    await db
        .update(cookingImages)
        .set({
            comment,
        })
        .where(eq(cookingImages.id, imageId));
}

/**
 * プロジェクトの選択済み画像を取得
 */
export async function getSelectedImages(projectId: string) {
    const images = await db
        .select({
            id: cookingImages.id,
            imageUrl: cookingImages.imageUrl,
            sectionId: cookingImages.sectionId,
            sectionIndex: cookingSections.orderIndex,
            uploaderName: users.name,
        })
        .from(cookingImages)
        .leftJoin(cookingSections, eq(cookingImages.sectionId, cookingSections.id))
        .leftJoin(users, eq(cookingImages.uploadedBy, users.id))
        .where(
            and(
                eq(cookingImages.projectId, projectId),
                eq(cookingImages.isSelected, true)
            )
        )
        .orderBy(asc(cookingSections.orderIndex));

    return images;
}

/**
 * 料理画像を削除
 */
export async function deleteCookingImage(imageId: string) {
    const session = await getSession();
    if (!session?.user) {
        throw new Error("Unauthorized");
    }

    const image = await db.query.cookingImages.findFirst({
        where: eq(cookingImages.id, imageId),
    });

    if (!image) {
        throw new Error("Image not found");
    }

    // 権限チェック: 自分の画像、または議長/名誉儀員のみ削除可能
    const userRoleRecord = await db.query.userRoles.findFirst({
        where: eq(userRoles.userId, session.user.id),
        columns: { role: true }
    });

    const isAuthorized = image.uploadedBy === session.user.id ||
        userRoleRecord?.role === "gicho" ||
        userRoleRecord?.role === "meiyo_giin";

    if (!isAuthorized) {
        throw new Error("Forbidden");
    }

    await db.delete(cookingImages).where(eq(cookingImages.id, imageId));

    // TODO: R2からの削除 (キー管理が必要)
    return { success: true };
}

/**
 * 画像をセクションに追加
 */
export async function addCookingImage(
    sectionId: string,
    imageUrl: string,
    projectId: string,
    uploadedBy?: string
) {
    const session = await getSession();
    const userId = uploadedBy || session?.user?.id || "anonymous";

    const newImage = await db.insert(cookingImages).values({
        id: crypto.randomUUID(),
        sectionId,
        projectId,
        uploadedBy: userId,
        imageUrl,
        createdAt: new Date(),
    }).returning();

    return newImage[0];
}

/**
 * プロジェクトの全画像を取得
 */
export async function getCookingImages(projectId: string) {
    const images = await db
        .select()
        .from(cookingImages)
        .where(eq(cookingImages.projectId, projectId))
        .orderBy(desc(cookingImages.createdAt));

    return images;
}
