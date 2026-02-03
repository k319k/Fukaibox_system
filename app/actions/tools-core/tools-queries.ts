"use server";

import { db } from "@/lib/db";
import { toolsApps, toolsFiles, users } from "@/lib/db/schema";
import { auth } from "@/lib/auth";
import { eq, desc, and } from "drizzle-orm";
import { headers } from "next/headers";
import { ToolApp } from "./tools-types";

// --- Get Apps ---

export async function getToolsApps(filter: 'all' | 'mine' | 'public' = 'public') {
    try {
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
            conditions.push(eq(toolsApps.isPublic, true));
        }

        const apps = await db.query.toolsApps.findMany({
            where: and(...conditions),
            orderBy: [desc(toolsApps.updatedAt)],
        });

        return apps;
    } catch (e) {
        console.error(e);
        return [];
    }
}

export async function getToolsAppById(id: string): Promise<ToolApp | null> {
    try {
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

        const files = await db.select().from(toolsFiles).where(eq(toolsFiles.appId, id));

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
        return null;
    }
}

// --- Get My Apps ---

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
