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
    getVideosExtended,
} from "@/lib/youtube-api";
import { env } from "@/lib/env";
import crypto from "crypto";
import { addDays, startOfDay } from "date-fns";

// Batch size for concurrent API requests
const BATCH_SIZE = 5;

// Helper to batch process promises
async function batchProcess<T, R>(items: T[], batchSize: number, processItem: (item: T) => Promise<R>): Promise<R[]> {
    const results: R[] = [];
    for (let i = 0; i < items.length; i += batchSize) {
        const batch = items.slice(i, i + batchSize);
        const batchResults = await Promise.all(batch.map(processItem));
        results.push(...batchResults);
    }
    return results;
}

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
            console.error("getChannelAnalytics: No access token");
            return { success: false, error: "YouTube not connected" };
        }

        console.log(`getChannelAnalytics: Fetching for ${startDate} to ${endDate}`);
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
        console.log(`getChannelAnalytics: Success. Rows: ${analytics?.rows?.length || 0}`);

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

/**
 * 高度なアナリティクスデータを取得（example.ods完全再現用）
 */
export async function getAdvancedAnalytics() {
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
            console.error("getAdvancedAnalytics: No access token (System or User)");
            return { success: false, error: "YouTube not connected" };
        }

        // 1時間に1回のキャッシュ
        const getCachedAdvancedData = unstable_cache(
            async (token: string) => {
                // 1. 動画リスト取得（最新30件に削減してタイムアウト回避）
                console.log("getAdvancedAnalytics: Fetching videos...");
                const videos = await getVideosExtended(token, 30);
                console.log(`getAdvancedAnalytics: Got ${videos.length} videos`);
                if (videos.length === 0) return [];

                const videoIds = videos.map(v => v.videoId);
                const videoIdString = videoIds.join(",");

                // Lifetime analytics
                console.log("getAdvancedAnalytics: Fetching lifetime analytics...");
                const startDate = "2000-01-01";
                const today = new Date().toISOString().split("T")[0];

                const analyticsData = await getAnalytics(
                    token,
                    startDate,
                    today,
                    [
                        "views",
                        "subscribersGained",
                        "subscribersLost",
                        "averageViewPercentage",
                        "likes",
                        "dislikes",
                        "comments",
                        "shares",
                        "cardClicks",
                        "endScreenElementClicks",
                        "estimatedMinutesWatched"
                    ],
                    "video",
                    `video==${videoIdString}`,
                    "-views",
                    30
                );

                // 3. データのマージと計算
                console.log(`getAdvancedAnalytics: Analytics fetched. Rows: ${analyticsData.rows?.length || 0}`);
                const analyticsMap = new Map();
                if (analyticsData.rows) {
                    analyticsData.rows.forEach((row: any) => {
                        analyticsMap.set(row[0], {
                            views: row[1],
                            subscribersGained: row[2],
                            subscribersLost: row[3],
                            averageViewPercentage: row[4],
                            likes: row[5],
                            dislikes: row[6],
                            comments: row[7],
                            shares: row[8],
                            cardClicks: row[9],
                            endScreenElementClicks: row[10],
                            estimatedMinutesWatched: row[11],
                        });
                    });
                }

                // Batch size increased to 10 for faster execution
                console.log("getAdvancedAnalytics: Starting batch process...");
                return await batchProcess(videos, 10, async (video) => {
                    const index = videos.indexOf(video);
                    const analytics = analyticsMap.get(video.videoId) || {};

                    // Default values if analytics missing
                    const views = analytics.views || video.viewCount || 0;
                    const likes = analytics.likes || video.likeCount || 0;
                    const comments = analytics.comments || video.commentCount || 0;

                    // Calculated fields
                    const compressionRateSecPerChar = video.charCount > 0 ? video.durationSec / video.charCount : 0;
                    const compressionRateCharPerSec = video.durationSec > 0 ? video.charCount / video.durationSec : 0;
                    const engagementView = views + (likes * 10) + (comments * 20);

                    // Fetch Traffic Source & Demographics (Parallel within batch)
                    let trafficSourceData: any = {};
                    let demographicsData: any = {};

                    try {
                        const [tsRes, demoRes] = await Promise.all([
                            getAnalytics(token, startDate, today, ["views"], "insightTrafficSourceType", `video==${video.videoId}`, "-views"),
                            getAnalytics(token, startDate, today, ["viewerPercentage"], "ageGroup,gender", `video==${video.videoId}`)
                        ]);

                        // Map Traffic Source
                        if (tsRes.rows) {
                            const tsMap = new Map(tsRes.rows.map((r: any) => [r[0], r[1]]));
                            trafficSourceData = {
                                trafficSourceShorts: tsMap.get("SHORTS") || 0,
                                trafficSourceChannel: tsMap.get("CHANNEL") || 0,
                                trafficSourceBrowse: tsMap.get("BROWSE_FEATURES") || 0,
                                trafficSourceSearch: tsMap.get("YOUTUBE_SEARCH") || 0,
                                trafficSourceSound: tsMap.get("SOUND_PAGE") || 0,
                                trafficSourceOther: Array.from(tsMap.entries())
                                    .filter(([k]) => !["SHORTS", "CHANNEL", "BROWSE_FEATURES", "YOUTUBE_SEARCH", "SOUND_PAGE"].includes(k))
                                    .reduce((acc, [, v]) => acc + (v as number), 0)
                            };
                        }

                        // Map Demographics
                        if (demoRes.rows) {
                            let genderMale = 0, genderFemale = 0;
                            const ageMap = new Map<string, number>();

                            demoRes.rows.forEach((row: any) => {
                                const age = row[0];
                                const gender = row[1];
                                const pct = row[2];

                                if (gender === "male") genderMale += pct;
                                if (gender === "female") genderFemale += pct;

                                ageMap.set(age, (ageMap.get(age) || 0) + pct);
                            });

                            demographicsData = {
                                genderMale,
                                genderFemale,
                                age13_17: ageMap.get("age13-17") || 0,
                                age18_24: ageMap.get("age18-24") || 0,
                                age25_34: ageMap.get("age25-34") || 0,
                                age35_44: ageMap.get("age35-44") || 0,
                                age45_54: ageMap.get("age45-54") || 0,
                                age55_64: ageMap.get("age55-64") || 0,
                                age65_plus: ageMap.get("age65-") || 0,
                            };
                        }

                    } catch (e) {
                        // Fallback safely
                    }

                    return {
                        ...video,
                        publicId: `VID-${index + 1}`,
                        dayOfWeek: ["日", "月", "火", "水", "木", "金", "土"][new Date(video.publishedAt).getDay()],

                        // Analytics Override
                        views,
                        likes,
                        comments,
                        subscribersGained: analytics.subscribersGained || 0,
                        subscribersLost: analytics.subscribersLost || 0,
                        avgViewPercentage: analytics.averageViewPercentage || 0,
                        shares: analytics.shares || 0,
                        estimatedMinutesWatched: analytics.estimatedMinutesWatched || 0,
                        cardClicks: analytics.cardClicks || 0,
                        endScreenElementClicks: analytics.endScreenElementClicks || 0,

                        // Derived
                        compressionRateSecPerChar,
                        compressionRateCharPerSec,
                        engagementView,

                        // Detailed
                        ...trafficSourceData,
                        ...demographicsData
                    };
                });
            },
            ['youtube-advanced-analytics-v3-optimized'], // Changed key
            { revalidate: 3600 }
        );

        const data = await getCachedAdvancedData(accessToken);
        return { success: true, data };

    } catch (error: any) {
        console.error("Get advanced analytics error:", error);
        return { success: false, error: error.message };
    }
}

