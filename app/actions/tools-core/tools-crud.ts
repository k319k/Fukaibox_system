"use server";

import { db } from "@/lib/db";
import { toolsApps, toolsFiles } from "@/lib/db/schema";
import { auth } from "@/lib/auth";
import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { headers } from "next/headers";
import { SaveToolsAppData } from "./tools-types";

// --- Save App ---

export async function saveToolsApp(appId: string | null, data: SaveToolsAppData) {
    const session = await auth.api.getSession({
        headers: await headers()
    });
    if (!session?.user?.id) {
        return { success: false, error: "Unauthorized" };
    }

    try {
        let savedAppId = appId;
        const appType = (data.type as "embed" | "link" | "react" | "html") || "react";

        if (!appId) {
            const [newApp] = await db.insert(toolsApps).values({
                id: crypto.randomUUID(),
                name: data.title,
                description: data.description || "",
                category: data.category || null,
                type: appType,
                embedUrl: data.embedUrl || null,
                createdBy: session.user.id,
                isPublic: data.isPublic ?? false,
                createdAt: new Date(),
                updatedAt: new Date(),
            }).returning();
            savedAppId = newApp.id;
        } else {
            const existing = await db.query.toolsApps.findFirst({
                where: eq(toolsApps.id, appId)
            });
            if (!existing || existing.createdBy !== session.user.id) {
                return { success: false, error: "App not found or unauthorized" };
            }

            await db.update(toolsApps).set({
                name: data.title,
                description: data.description || "",
                category: data.category || null,
                type: appType,
                embedUrl: data.embedUrl || null,
                isPublic: data.isPublic ?? existing.isPublic,
                updatedAt: new Date(),
            }).where(eq(toolsApps.id, appId));
        }

        if (!savedAppId) throw new Error("Failed to resolve App ID");

        await db.delete(toolsFiles).where(eq(toolsFiles.appId, savedAppId));

        const fileEntries = Object.entries(data.files).map(([filename, content]) => ({
            id: crypto.randomUUID(),
            appId: savedAppId!,
            filename,
            content,
            createdAt: new Date(),
            updatedAt: new Date(),
        }));

        if (fileEntries.length > 0) {
            await db.insert(toolsFiles).values(fileEntries);
        }

        revalidatePath("/tools");
        revalidatePath("/tools/gallery");

        return { success: true, appId: savedAppId };
    } catch (e: any) {
        console.error("Save Tools App Error:", e);
        return { success: false, error: e.message };
    }
}

// --- Publish App ---

export async function publishToolsApp(appId: string, isPublic: boolean) {
    const session = await auth.api.getSession({
        headers: await headers()
    });
    if (!session?.user?.id) return { success: false, error: "Unauthorized" };

    try {
        const existing = await db.query.toolsApps.findFirst({
            where: eq(toolsApps.id, appId)
        });
        if (!existing || existing.createdBy !== session.user.id) {
            return { success: false, error: "Not authorized" };
        }

        await db.update(toolsApps)
            .set({ isPublic: isPublic, updatedAt: new Date() })
            .where(eq(toolsApps.id, appId));

        revalidatePath("/tools");
        revalidatePath(`/tools/app/${appId}`);
        return { success: true };
    } catch (e: any) {
        return { success: false, error: e.message };
    }
}

// --- Delete App ---

export async function deleteToolsApp(appId: string) {
    const session = await auth.api.getSession({
        headers: await headers()
    });
    if (!session?.user?.id) return { success: false, error: "Unauthorized" };

    try {
        const existing = await db.query.toolsApps.findFirst({
            where: eq(toolsApps.id, appId)
        });
        if (!existing || existing.createdBy !== session.user.id) {
            return { success: false, error: "Not authorized" };
        }

        await db.delete(toolsApps).where(eq(toolsApps.id, appId));

        revalidatePath("/tools");
        return { success: true };
    } catch (e: any) {
        return { success: false, error: e.message };
    }
}
