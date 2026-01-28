"use server";

import { db } from "@/lib/db";
import { toolsApps, toolsFiles } from "@/lib/db/schema";
import { auth } from "@/lib/auth"; // BetterAuth session
import { eq, desc, and } from "drizzle-orm";
import { revalidatePath } from "next/cache";

export type SaveToolsAppData = {
    title: string;
    description?: string;
    files: Record<string, string>; // filename -> content
    type?: "react-ts" | "react" | "vanilla-ts" | "vanilla";
};

// --- Save App ---

export async function saveToolsApp(appId: string | null, data: SaveToolsAppData) {
    const session = await auth();
    if (!session?.user?.id) {
        return { success: false, error: "Unauthorized" };
    }

    try {
        let savedAppId = appId;
        const type = "react"; // Schema expects "react" | "link" | "html" | "embed"

        // 1. Create or Update App Metadata
        if (!appId) {
            // Create New
            const [newApp] = await db.insert(toolsApps).values({
                id: crypto.randomUUID(),
                name: data.title, // Schema uses 'name'
                description: data.description || "",
                type: type,
                createdBy: session.user.id,
                isPublic: false,
                createdAt: new Date(),
                updatedAt: new Date(),
            }).returning();
            savedAppId = newApp.id;
        } else {
            // Update Existing
            // Verify ownership
            const existing = await db.query.toolsApps.findFirst({
                where: eq(toolsApps.id, appId)
            });
            if (!existing || existing.createdBy !== session.user.id) {
                return { success: false, error: "App not found or unauthorized" };
            }

            await db.update(toolsApps).set({
                name: data.title,
                description: data.description || "",
                // type: type, // Usually type doesn't change
                updatedAt: new Date(),
            }).where(eq(toolsApps.id, appId));
        }

        if (!savedAppId) throw new Error("Failed to resolve App ID");

        // 2. Save Files
        // Simple strategy: Delete all existing files for this app and re-insert.
        // For production, diffing would be better, but this is cleaner for MVP.
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
    const session = await auth();
    if (!session?.user?.id) return { success: false, error: "Unauthorized" };

    try {
        // Ownership check
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

// --- Get Apps ---

export async function getToolsApps(filter: 'all' | 'mine' | 'public' = 'public') {
    try {
        // Need to join user info? For now just fetch apps.
        // Drizzle query
        let conditions = [];

        if (filter === 'public') {
            conditions.push(eq(toolsApps.isPublic, true));
        } else if (filter === 'mine') {
            const session = await auth();
            if (!session?.user?.id) return [];
            conditions.push(eq(toolsApps.createdBy, session.user.id));
        } else {
            // Admin view or all? Restrict to public for safety if 'all' requested by anon
            // Assuming 'all' means all public for now
            conditions.push(eq(toolsApps.isPublic, true));
        }

        const apps = await db.query.toolsApps.findMany({
            where: and(...conditions),
            orderBy: [desc(toolsApps.updatedAt)],
            with: {
                // files: true, // Don't fetch files for list view
                // We might want author info later
            }
        });

        return apps;
    } catch (e) {
        console.error(e);
        return [];
    }
}

export async function getToolsAppById(id: string) {
    try {
        const app = await db.query.toolsApps.findFirst({
            where: eq(toolsApps.id, id),
            with: {
                // files: true // fetching files via relations might fail if not defined in schema relations, so separate query
            }
        });

        if (!app) return null;

        // Fetch files manually or via relation if defined.
        // I didn't verify relation definition in schema split step, assuming standard definition might be missing explicit relations API.
        // Safer to just query files separately or use relation if I defined it.
        // I defined foreign keys in schema, but `relations` construct is needed for `with`.
        // Let's query normally.

        const files = await db.select().from(toolsFiles).where(eq(toolsFiles.appId, id));

        // Convert to Record<string, string>
        const filesRecord: Record<string, string> = {};
        files.forEach(f => {
            filesRecord[f.filename] = f.content;
        });

        return { ...app, files: filesRecord };

    } catch (e) {
        console.error(e);
        return null;
    }
}
