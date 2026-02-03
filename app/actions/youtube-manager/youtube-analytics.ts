"use server";

import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { getAnalytics, getVideoStats } from "@/lib/youtube-api";
import { getValidAccessToken } from "./youtube-connection";

// =============================================
// アナリティクス
// =============================================

/**
 * チャンネル統計を取得
 */
export async function getChannelAnalytics(startDate: string, endDate: string) {
    const session = await auth.api.getSession({
        headers: await headers(),
    });

    if (!session?.user) {
        return { success: false, error: "Unauthorized" };
    }

    try {
        const accessToken = await getValidAccessToken(session.user.id);
        if (!accessToken) {
            return { success: false, error: "YouTube not connected" };
        }

        const analytics = await getAnalytics(accessToken, startDate, endDate);

        return { success: true, data: analytics };
    } catch (error: any) {
        console.error("Get channel analytics error:", error);
        return { success: false, error: error.message };
    }
}

/**
 * 動画統計を取得
 */
export async function getVideoAnalytics(videoId: string) {
    const session = await auth.api.getSession({
        headers: await headers(),
    });

    if (!session?.user) {
        return { success: false, error: "Unauthorized" };
    }

    try {
        const accessToken = await getValidAccessToken(session.user.id);
        if (!accessToken) {
            return { success: false, error: "YouTube not connected" };
        }

        const stats = await getVideoStats(accessToken, videoId);

        return { success: true, data: stats };
    } catch (error: any) {
        console.error("Get video analytics error:", error);
        return { success: false, error: error.message };
    }
}
