"use server";

import { db } from "@/lib/db";
import { toolsApps, toolsFiles } from "@/lib/db/schema";
import { auth } from "@/lib/auth";
import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { headers } from "next/headers";

// --- Remix App ---

export async function remixApp(originalAppId: string) {
    const session = await auth.api.getSession({
        headers: await headers()
    });
    if (!session?.user?.id) {
        return { success: false, error: "Unauthorized" };
    }

    try {
        const original = await db.query.toolsApps.findFirst({
            where: eq(toolsApps.id, originalAppId),
            with: {
                files: true,
            }
        });

        if (!original) {
            return { success: false, error: "Original app not found" };
        }

        if (!original.isPublic && original.createdBy !== session.user.id) {
            return { success: false, error: "Not authorized to remix this app" };
        }

        const newAppId = crypto.randomUUID();
        await db.insert(toolsApps).values({
            id: newAppId,
            name: `${original.name} (Remix)`,
            description: original.description,
            category: original.category,
            type: original.type,
            embedUrl: original.embedUrl,
            createdBy: session.user.id,
            isPublic: false,
            remixFrom: originalAppId,
            createdAt: new Date(),
            updatedAt: new Date(),
        }).returning();

        if (original.files && original.files.length > 0) {
            const fileEntries = original.files.map(file => ({
                id: crypto.randomUUID(),
                appId: newAppId,
                filename: file.filename,
                content: file.content,
                createdAt: new Date(),
                updatedAt: new Date(),
            }));
            await db.insert(toolsFiles).values(fileEntries);
        }

        await db.update(toolsApps)
            .set({
                remixCount: (original.remixCount || 0) + 1
            })
            .where(eq(toolsApps.id, originalAppId));

        revalidatePath("/tools");
        revalidatePath("/tools/gallery");
        revalidatePath(`/tools/app/${originalAppId}`);

        return { success: true, appId: newAppId };
    } catch (e: any) {
        console.error("Remix App Error:", e);
        return { success: false, error: e.message };
    }
}

// --- Get Remix Tree ---

export async function getRemixTree(appId: string) {
    try {
        const result: any = { app: null, children: [], parent: null };

        const app = await db.query.toolsApps.findFirst({
            where: eq(toolsApps.id, appId),
            with: {
                creator: {
                    columns: {
                        name: true,
                        image: true,
                    }
                }
            }
        });

        if (!app) return result;

        result.app = {
            ...app,
            creatorName: app.creator?.name,
            creatorImage: app.creator?.image,
        };

        if (app.remixFrom) {
            const parent = await db.query.toolsApps.findFirst({
                where: eq(toolsApps.id, app.remixFrom),
                with: {
                    creator: {
                        columns: {
                            name: true,
                            image: true,
                        }
                    }
                }
            });
            if (parent) {
                result.parent = {
                    ...parent,
                    creatorName: parent.creator?.name,
                    creatorImage: parent.creator?.image,
                };
            }
        }

        const children = await db.query.toolsApps.findMany({
            where: eq(toolsApps.remixFrom, appId),
            with: {
                creator: {
                    columns: {
                        name: true,
                        image: true,
                    }
                }
            }
        });

        result.children = children.map(child => ({
            ...child,
            creatorName: child.creator?.name,
            creatorImage: child.creator?.image,
        }));

        return result;
    } catch (e) {
        console.error("Get Remix Tree Error:", e);
        return { app: null, children: [], parent: null };
    }
}
