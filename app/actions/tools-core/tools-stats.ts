"use server";

import { db } from "@/lib/db";
import { toolsApps } from "@/lib/db/schema";
import { eq } from "drizzle-orm";

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
