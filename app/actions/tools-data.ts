"use server";

import { db } from "@/lib/db";
import { toolsApps, toolsFiles, users } from "@/lib/db/schema";
import { auth } from "@/lib/auth"; // BetterAuth session
import { eq, desc, and } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { env } from "@/lib/env";
import { headers } from "next/headers";
import jwt from "jsonwebtoken";

export type SaveToolsAppData = {
    title: string;
    description?: string;
    category?: string;
    files: Record<string, string>; // filename -> content
    type?: "react-ts" | "react" | "vanilla-ts" | "vanilla" | "embed" | "link" | "html";
    embedUrl?: string | null;
    isPublic?: boolean;
};

export type ToolApp = {
    id: string;
    name: string;
    description: string | null;
    category: string | null;
    type: "embed" | "link" | "react" | "html";
    embedUrl: string | null;
    isPublic: boolean | null;
    viewCount: number | null;
    playCount: number | null;
    createdBy: string;
    createdAt: Date;
    updatedAt: Date;
    creatorName?: string | null;
    creatorImage?: string | null;
    files?: Record<string, string>;
};

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

        // 1. Create or Update App Metadata
        if (!appId) {
            // Create New
            const [newApp] = await db.insert(toolsApps).values({
                id: crypto.randomUUID(),
                name: data.title, // Schema uses 'name'
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
                category: data.category || null,
                type: appType,
                embedUrl: data.embedUrl || null,
                isPublic: data.isPublic ?? existing.isPublic,
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
    const session = await auth.api.getSession({
        headers: await headers()
    });
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

// --- Get Apps ---

export async function getToolsApps(filter: 'all' | 'mine' | 'public' = 'public') {
    try {
        // Need to join user info? For now just fetch apps.
        // Drizzle query
        const conditions = [];

        if (filter === 'public') {
            conditions.push(eq(toolsApps.isPublic, true));
        } else if (filter === 'mine') {
            const session = await auth.api.getSession({
                headers: await headers()
            });
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

// Return type promise ToolApp | null manually constructed
export async function getToolsAppById(id: string): Promise<ToolApp | null> {
    try {
        // Left Join to get Creator info
        const result = await db
            .select({
                app: toolsApps,
                creatorName: users.name,
                creatorImage: users.image,
            })
            .from(toolsApps)
            .leftJoin(users, eq(toolsApps.createdBy, users.id))
            .where(eq(toolsApps.id, id))
            .limit(1);

        if (result.length === 0) return null;

        const { app, creatorName, creatorImage } = result[0];

        // Fetch files
        const files = await db.select().from(toolsFiles).where(eq(toolsFiles.appId, id));

        // Convert to Record<string, string>
        const filesRecord: Record<string, string> = {};
        files.forEach(f => {
            filesRecord[f.filename] = f.content;
        });

        return {
            ...app,
            creatorName,
            creatorImage,
            files: filesRecord
        };

    } catch (e) {
        console.error(e);
        return null; // Return null on error
    }
}

// --- Auth / Token ---

export async function mintSupabaseToken() {
    const session = await auth.api.getSession({
        headers: await headers()
    });

    if (!session?.user) {
        return null;
    }

    const secret = env.SUPABASE_JWT_SECRET;

    if (!secret) {
        console.warn("SUPABASE_JWT_SECRET is not set. Authenticated Realtime features will fall back to anon/unavailable.");
        return null;
    }

    // Creating a custom JWT that Supabase Auth (GoTrue) will verify
    const payload = {
        aud: "authenticated",
        role: "authenticated",
        sub: session.user.id,
        email: session.user.email,
        app_metadata: {
            provider: "fukai_box",
            providers: ["fukai_box"]
        },
        user_metadata: {
            name: session.user.name,
            image: session.user.image,
        },
        exp: Math.floor(Date.now() / 1000) + 60 * 60 * 24, // 24 hours
    };

    return jwt.sign(payload, secret);
}

// --- Get My Apps (User's own apps) ---

export async function getMyApps() {
    const session = await auth.api.getSession({
        headers: await headers()
    });
    if (!session?.user?.id) return [];

    try {
        console.log(`[getMyApps] Fetching apps for user: ${session.user.id}`);
        const apps = await db.query.toolsApps.findMany({
            where: eq(toolsApps.createdBy, session.user.id),
            orderBy: [desc(toolsApps.updatedAt)],
            with: {
                creator: {
                    columns: {
                        name: true,
                        image: true,
                    }
                }
            }
        });
        console.log(`[getMyApps] Found ${apps.length} apps`);

        return apps.map(app => ({
            ...app,
            creatorName: app.creator?.name,
            creatorImage: app.creator?.image,
        }));
    } catch (e) {
        console.error("Get My Apps Error:", e);
        return [];
    }
}

// --- Get Public Apps ---

export async function getPublicApps() {
    try {
        const apps = await db.query.toolsApps.findMany({
            where: eq(toolsApps.isPublic, true),
            orderBy: [desc(toolsApps.viewCount), desc(toolsApps.updatedAt)],
            with: {
                creator: {
                    columns: {
                        name: true,
                        image: true,
                    }
                }
            }
        });

        return apps.map(app => ({
            ...app,
            creatorName: app.creator?.name,
            creatorImage: app.creator?.image,
        }));
    } catch (e: unknown) {
        console.error("Get Public Apps Error:", e);
        return [];
    }
}

// --- Remix App ---

export async function remixApp(originalAppId: string) {
    const session = await auth.api.getSession({
        headers: await headers()
    });
    if (!session?.user?.id) {
        return { success: false, error: "Unauthorized" };
    }

    try {
        // Get original app
        const original = await db.query.toolsApps.findFirst({
            where: eq(toolsApps.id, originalAppId),
            with: {
                files: true,
            }
        });

        if (!original) {
            return { success: false, error: "Original app not found" };
        }

        // Check if public or owned by user
        if (!original.isPublic && original.createdBy !== session.user.id) {
            return { success: false, error: "Not authorized to remix this app" };
        }

        // Create new app
        const newAppId = crypto.randomUUID();
        await db.insert(toolsApps).values({
            id: newAppId,
            name: `${original.name} (Remix)`,
            description: original.description,
            category: original.category,
            type: original.type,
            embedUrl: original.embedUrl,
            createdBy: session.user.id,
            isPublic: false, // Start as private
            remixFrom: originalAppId,
            createdAt: new Date(),
            updatedAt: new Date(),
        }).returning();

        // Copy files
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

        // Increment remix count on original
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

        // Get current app
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

        // Get parent (if remixed)
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

        // Get children (apps remixed from this one)
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

// --- Increment View Count ---

export async function incrementViewCount(appId: string) {
    try {
        const app = await db.query.toolsApps.findFirst({
            where: eq(toolsApps.id, appId)
        });
        if (!app) return { success: false };

        await db.update(toolsApps)
            .set({ viewCount: (app.viewCount || 0) + 1 })
            .where(eq(toolsApps.id, appId));

        return { success: true };
    } catch (e) {
        console.error("Increment View Count Error:", e);
        return { success: false };
    }
}
