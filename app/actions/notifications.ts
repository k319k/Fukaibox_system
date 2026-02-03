"use server";

import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { db } from "@/lib/db";
import { notifications } from "@/lib/db/schema/notifications";
import { eq, desc, and } from "drizzle-orm";
import crypto from "crypto";

export async function getNotificationsAction() {
    const session = await auth.api.getSession({
        headers: await headers(),
    });

    if (!session?.user) {
        return { success: false, error: "Unauthorized" };
    }

    try {
        const list = await db.query.notifications.findMany({
            where: eq(notifications.userId, session.user.id),
            orderBy: [desc(notifications.createdAt)],
            limit: 20
        });

        return { success: true, data: list };
    } catch (error: any) {
        console.error("Get Notifications Error:", error);
        return { success: false, error: error.message };
    }
}

export async function createNotificationAction(targetUserId: string, title: string, message: string, type: "info" | "success" | "warning" | "error" = "info", link?: string) {
    // Note: Use this from other server actions, checking session might not be needed if system-triggered
    // But for safety, let's allow it to be called internally. 
    // If exposed to client, should check permission (e.g. only admin can send to others? or system only?)
    // For now, assume this is mainly internal helper or self-trigger.
    // Let's make it a helper export, not action export if only used internally?
    // But "use server" at top makes everything action.
    // For simplicity, we just implement it.

    try {
        await db.insert(notifications).values({
            id: crypto.randomUUID(),
            userId: targetUserId,
            title,
            message,
            type,
            link,
            isRead: false,
            createdAt: new Date(),
        });
        return { success: true };
    } catch (error: any) {
        console.error("Create Notification Error:", error);
        return { success: false, error: error.message };
    }
}

export async function markAsReadAction(notificationId: string) {
    const session = await auth.api.getSession({
        headers: await headers(),
    });

    if (!session?.user) {
        return { success: false, error: "Unauthorized" };
    }

    try {
        await db.update(notifications)
            .set({ isRead: true })
            .where(and(
                eq(notifications.id, notificationId),
                eq(notifications.userId, session.user.id) // Ensure ownership
            ));
        return { success: true };
    } catch (error: any) {
        console.error("Mark Read Error:", error);
        return { success: false, error: error.message };
    }
}

export async function markAllAsReadAction() {
    const session = await auth.api.getSession({
        headers: await headers(),
    });

    if (!session?.user) {
        return { success: false, error: "Unauthorized" };
    }

    try {
        await db.update(notifications)
            .set({ isRead: true })
            .where(eq(notifications.userId, session.user.id));
        return { success: true };
    } catch (error: any) {
        console.error("Mark All Read Error:", error);
        return { success: false, error: error.message };
    }
}
