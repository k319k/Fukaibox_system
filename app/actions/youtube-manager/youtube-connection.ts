"use server";

import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { db } from "@/lib/db";
import { youtubeTokens } from "@/lib/db/schema/youtube";
import { eq } from "drizzle-orm";
import {
    getAuthUrl,
    refreshAccessToken,
    getChannelInfo,
} from "@/lib/youtube-api";

// =============================================
// YouTube連携管理
// =============================================

/**
 * YouTube連携URLを取得
 */
export async function getYouTubeConnectUrl() {
    const session = await auth.api.getSession({
        headers: await headers(),
    });

    if (!session?.user) {
        return { success: false, error: "Unauthorized" };
    }

    try {
        const url = getAuthUrl();
        return { success: true, url };
    } catch (error: any) {
        console.error("Get YouTube connect URL error:", error);
        return { success: false, error: error.message };
    }
}

/**
 * YouTube連携を解除
 */
export async function disconnectYouTube() {
    const session = await auth.api.getSession({
        headers: await headers(),
    });

    if (!session?.user) {
        return { success: false, error: "Unauthorized" };
    }

    try {
        await db.delete(youtubeTokens).where(eq(youtubeTokens.userId, session.user.id));
        return { success: true };
    } catch (error: any) {
        console.error("Disconnect YouTube error:", error);
        return { success: false, error: error.message };
    }
}

/**
 * YouTube連携状態を取得
 */
export async function getYouTubeConnectionStatus() {
    const session = await auth.api.getSession({
        headers: await headers(),
    });

    if (!session?.user) {
        return { success: false, error: "Unauthorized", connected: false };
    }

    try {
        const token = await db.query.youtubeTokens.findFirst({
            where: eq(youtubeTokens.userId, session.user.id),
        });

        if (!token) {
            return { success: true, connected: false };
        }

        const now = new Date();
        if (token.expiresAt < now) {
            try {
                const refreshed = await refreshAccessToken(token.refreshToken);
                await db.update(youtubeTokens)
                    .set({
                        accessToken: refreshed.accessToken,
                        expiresAt: refreshed.expiresAt,
                        updatedAt: new Date(),
                    })
                    .where(eq(youtubeTokens.id, token.id));

                const channelInfo = await getChannelInfo(refreshed.accessToken);
                return { success: true, connected: true, channel: channelInfo };
            } catch (e) {
                return { success: true, connected: false, needsReconnect: true };
            }
        }

        const channelInfo = await getChannelInfo(token.accessToken);
        return { success: true, connected: true, channel: channelInfo };
    } catch (error: any) {
        console.error("Get YouTube connection status error:", error);
        return { success: false, error: error.message, connected: false };
    }
}

/**
 * アクセストークンを取得（共有用）
 */
export async function getValidAccessToken(userId: string): Promise<string | null> {
    const token = await db.query.youtubeTokens.findFirst({
        where: eq(youtubeTokens.userId, userId),
    });

    if (!token) return null;

    const now = new Date();
    if (token.expiresAt < now) {
        const refreshed = await refreshAccessToken(token.refreshToken);
        await db.update(youtubeTokens)
            .set({
                accessToken: refreshed.accessToken,
                expiresAt: refreshed.expiresAt,
                updatedAt: new Date(),
            })
            .where(eq(youtubeTokens.id, token.id));
        return refreshed.accessToken;
    }

    return token.accessToken;
}
