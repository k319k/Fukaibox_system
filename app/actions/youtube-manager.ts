"use server";

import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { unstable_cache } from "next/cache";
import { db } from "@/lib/db";
import { youtubeTokens, youtubeScheduledVideos } from "@/lib/db/schema/youtube";
import { eq, and, gte, lte } from "drizzle-orm";
import {
    getAuthUrl,
    exchangeCodeForTokens,
    refreshAccessToken,
    getChannelInfo,
    uploadVideo,
    scheduleVideo as scheduleVideoApi,
    getVideos,
    getVideoStats,
    getAnalytics,
    getSystemAccessToken,
} from "@/lib/youtube-api";
import { env } from "@/lib/env";
import crypto from "crypto";
import { addDays, startOfDay } from "date-fns";

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

    // 1. 環境変数のシステムトークンを優先
    if (env.YOUTUBE_REFRESH_TOKEN) {
        try {
            const accessToken = await getSystemAccessToken();

            // チャンネル情報取得（キャッシュ利用）
            const getCachedChannelInfo = unstable_cache(
                async (token: string) => getChannelInfo(token),
                ['youtube-channel-info'],
                { revalidate: 3600 } // 1時間キャッシュ
            );

            const channelInfo = await getCachedChannelInfo(accessToken);
            return { success: true, connected: true, channel: channelInfo };
        } catch (error: any) {
            console.error("System token connection error:", error);
            // システムトークンがエラーでもDBトークンを試す（後方互換）
        }
    }

    try {
        const token = await db.query.youtubeTokens.findFirst({
            where: eq(youtubeTokens.userId, session.user.id),
        });

        if (!token) {
            return { success: true, connected: false };
        }

        // トークンの有効期限チェック
        const now = new Date();
        if (token.expiresAt < now) {
            // リフレッシュを試みる
            try {
                const refreshed = await refreshAccessToken(token.refreshToken);
                await db.update(youtubeTokens)
                    .set({
                        accessToken: refreshed.accessToken,
                        expiresAt: refreshed.expiresAt,
                        updatedAt: new Date(),
                    })
                    .where(eq(youtubeTokens.id, token.id));

                // チャンネル情報取得（キャッシュ利用）
                const getCachedChannelInfo = unstable_cache(
                    async (token: string) => getChannelInfo(token),
                    ['youtube-channel-info'],
                    { revalidate: 3600 } // 1時間キャッシュ
                );
                const channelInfo = await getCachedChannelInfo(refreshed.accessToken);
                return { success: true, connected: true, channel: channelInfo };
            } catch (e) {
                // リフレッシュ失敗 → 再連携が必要
                return { success: true, connected: false, needsReconnect: true };
            }
        }

        // チャンネル情報取得（キャッシュ利用）
        const getCachedChannelInfo = unstable_cache(
            async (token: string) => getChannelInfo(token),
            ['youtube-channel-info'],
            { revalidate: 3600 } // 1時間キャッシュ
        );
        const channelInfo = await getCachedChannelInfo(token.accessToken);
        return { success: true, connected: true, channel: channelInfo };
    } catch (error: any) {
        console.error("Get YouTube connection status error:", error);
        return { success: false, error: error.message, connected: false };
    }
}

/**
 * アクセストークンを取得（内部用）
 */
async function getValidAccessToken(userId: string): Promise<string | null> {
    const token = await db.query.youtubeTokens.findFirst({
        where: eq(youtubeTokens.userId, userId),
    });

    if (!token) return null;

    const now = new Date();
    if (token.expiresAt < now) {
        // リフレッシュ
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

// =============================================
// 予約投稿管理
// =============================================

/**
 * 予約投稿を作成（重複回避ロジック付き）
 */
export async function scheduleVideoUpload(data: {
    title: string;
    description?: string;
    scheduledDate: Date;
    cookingProjectId?: string;
}) {
    const session = await auth.api.getSession({
        headers: await headers(),
    });

    if (!session?.user) {
        return { success: false, error: "Unauthorized" };
    }

    try {
        const targetDate = startOfDay(data.scheduledDate);

        // 重複チェック & シフトロジック
        await resolveScheduleConflicts(targetDate, session.user.id);

        // 予約作成
        const scheduledVideo = {
            id: crypto.randomUUID(),
            title: data.title,
            description: data.description || null,
            scheduledDate: targetDate,
            status: "pending" as const,
            filePath: null,
            thumbnailPath: null,
            cookingProjectId: data.cookingProjectId || null,
            createdBy: session.user.id,
            createdAt: new Date(),
            updatedAt: new Date(),
        };

        await db.insert(youtubeScheduledVideos).values(scheduledVideo);

        return { success: true, id: scheduledVideo.id };
    } catch (error: any) {
        console.error("Schedule video error:", error);
        return { success: false, error: error.message };
    }
}

/**
 * スケジュール衝突を解決（再帰的シフト）
 */
async function resolveScheduleConflicts(targetDate: Date, userId: string) {
    const existingVideo = await db.query.youtubeScheduledVideos.findFirst({
        where: and(
            eq(youtubeScheduledVideos.createdBy, userId),
            eq(youtubeScheduledVideos.scheduledDate, targetDate)
        ),
    });

    if (existingVideo) {
        // 1日後へシフト
        const nextDate = addDays(targetDate, 1);

        // 再帰的に次の日もチェック
        await resolveScheduleConflicts(nextDate, userId);

        // シフト実行
        await db.update(youtubeScheduledVideos)
            .set({
                scheduledDate: nextDate,
                updatedAt: new Date(),
            })
            .where(eq(youtubeScheduledVideos.id, existingVideo.id));

        console.log(`Shifted video "${existingVideo.title}" from ${targetDate} to ${nextDate}`);
    }
}

/**
 * 予約リストを取得
 */
export async function getScheduledVideos(startDate?: Date, endDate?: Date) {
    const session = await auth.api.getSession({
        headers: await headers(),
    });

    if (!session?.user) {
        return { success: false, error: "Unauthorized", videos: [] };
    }

    try {
        let conditions = [eq(youtubeScheduledVideos.createdBy, session.user.id)];

        if (startDate) {
            conditions.push(gte(youtubeScheduledVideos.scheduledDate, startDate));
        }
        if (endDate) {
            conditions.push(lte(youtubeScheduledVideos.scheduledDate, endDate));
        }

        const videos = await db.query.youtubeScheduledVideos.findMany({
            where: and(...conditions),
            orderBy: (table, { asc }) => [asc(table.scheduledDate)],
        });

        return { success: true, videos };
    } catch (error: any) {
        console.error("Get scheduled videos error:", error);
        return { success: false, error: error.message, videos: [] };
    }
}

/**
 * 予約を更新
 */
export async function updateScheduledVideo(videoId: string, newDate: Date) {
    const session = await auth.api.getSession({
        headers: await headers(),
    });

    if (!session?.user) {
        return { success: false, error: "Unauthorized" };
    }

    try {
        const targetDate = startOfDay(newDate);

        // 重複チェック & シフトロジック
        await resolveScheduleConflicts(targetDate, session.user.id);

        await db.update(youtubeScheduledVideos)
            .set({
                scheduledDate: targetDate,
                updatedAt: new Date(),
            })
            .where(and(
                eq(youtubeScheduledVideos.id, videoId),
                eq(youtubeScheduledVideos.createdBy, session.user.id)
            ));

        return { success: true };
    } catch (error: any) {
        console.error("Update scheduled video error:", error);
        return { success: false, error: error.message };
    }
}

/**
 * 予約を削除
 */
export async function deleteScheduledVideo(videoId: string) {
    const session = await auth.api.getSession({
        headers: await headers(),
    });

    if (!session?.user) {
        return { success: false, error: "Unauthorized" };
    }

    try {
        await db.delete(youtubeScheduledVideos)
            .where(and(
                eq(youtubeScheduledVideos.id, videoId),
                eq(youtubeScheduledVideos.createdBy, session.user.id)
            ));

        return { success: true };
    } catch (error: any) {
        console.error("Delete scheduled video error:", error);
        return { success: false, error: error.message };
    }
}

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
        let accessToken: string | null = null;
        if (env.YOUTUBE_REFRESH_TOKEN) {
            accessToken = await getSystemAccessToken();
        } else {
            accessToken = await getValidAccessToken(session.user.id);
        }

        if (!accessToken) {
            return { success: false, error: "YouTube not connected" };
        }

        // アナリティクス取得（キャッシュ利用）
        // Metrics: views,estimatedMinutesWatched,averageViewDuration,averageViewPercentage,subscribersGained,subscribersLost,likes,dislikes,comments,shares,cardClicks,endScreenElementClicks
        const getCachedAnalytics = unstable_cache(
            async (token: string, start: string, end: string) => getAnalytics(token, start, end, [
                "views",
                "estimatedMinutesWatched",
                "averageViewDuration",
                "averageViewPercentage",
                "subscribersGained",
                "subscribersLost",
                "likes",
                "dislikes",
                "comments",
                "shares",
                "cardClicks",
                "endScreenElementClicks"
            ]),
            ['youtube-analytics-extended-v1'], // Changed key to invalidate old cache
            { revalidate: 3600 } // 1時間キャッシュ
        );

        const analytics = await getCachedAnalytics(accessToken, startDate, endDate);

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
        let accessToken: string | null = null;
        if (env.YOUTUBE_REFRESH_TOKEN) {
            accessToken = await getSystemAccessToken();
        } else {
            accessToken = await getValidAccessToken(session.user.id);
        }

        if (!accessToken) {
            return { success: false, error: "YouTube not connected" };
        }

        // 動画統計取得（キャッシュ利用）
        const getCachedVideoStats = unstable_cache(
            async (token: string, vId: string) => getVideoStats(token, vId),
            ['youtube-video-stats'],
            { revalidate: 3600 } // 1時間キャッシュ
        );
        const stats = await getCachedVideoStats(accessToken, videoId);

        return { success: true, data: stats };
    } catch (error: any) {
        console.error("Get video analytics error:", error);
        return { success: false, error: error.message };
    }
}
