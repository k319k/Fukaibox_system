import { google } from "googleapis";
import { env } from "./env";

const youtube = google.youtube({
    version: "v3",
    auth: env.YOUTUBE_API_KEY,
});

const OAuth2 = google.auth.OAuth2;

// OAuth2クライアントの初期化
export function getOAuth2Client() {
    return new OAuth2(
        env.YOUTUBE_CLIENT_ID,
        env.YOUTUBE_CLIENT_SECRET,
        env.YOUTUBE_REDIRECT_URI
    );
}

// OAuth認証URL生成
export function getAuthUrl() {
    const oauth2Client = getOAuth2Client();

    return oauth2Client.generateAuthUrl({
        access_type: "offline",
        scope: [
            "https://www.googleapis.com/auth/youtube.upload",
            "https://www.googleapis.com/auth/youtube.readonly",
            "https://www.googleapis.com/auth/yt-analytics.readonly",
        ],
        prompt: "consent", // リフレッシュトークンを必ず取得
    });
}

// 認証コードをトークンに交換
export async function exchangeCodeForTokens(code: string) {
    const oauth2Client = getOAuth2Client();
    const { tokens } = await oauth2Client.getToken(code);

    if (!tokens.access_token || !tokens.refresh_token) {
        throw new Error("Failed to obtain tokens");
    }

    return {
        accessToken: tokens.access_token,
        refreshToken: tokens.refresh_token,
        expiresAt: tokens.expiry_date ? new Date(tokens.expiry_date) : new Date(Date.now() + 3600 * 1000),
    };
}

// トークンリフレッシュ
export async function refreshAccessToken(refreshToken: string) {
    const oauth2Client = getOAuth2Client();
    oauth2Client.setCredentials({ refresh_token: refreshToken });

    const { credentials } = await oauth2Client.refreshAccessToken();

    if (!credentials.access_token) {
        throw new Error("Failed to refresh access token");
    }

    return {
        accessToken: credentials.access_token,
        expiresAt: credentials.expiry_date ? new Date(credentials.expiry_date) : new Date(Date.now() + 3600 * 1000),
    };
}

// 環境変数のリフレッシュトークンからアクセストークンを取得
export async function getSystemAccessToken() {
    if (!env.YOUTUBE_REFRESH_TOKEN) {
        throw new Error("YOUTUBE_REFRESH_TOKEN is not set in environment variables");
    }
    const { accessToken } = await refreshAccessToken(env.YOUTUBE_REFRESH_TOKEN);
    return accessToken;
}

// アクセストークンを使用してOAuth2クライアントを設定
function setCredentials(accessToken: string) {
    const oauth2Client = getOAuth2Client();
    oauth2Client.setCredentials({ access_token: accessToken });
    return google.youtube({ version: "v3", auth: oauth2Client });
}

// チャンネル情報取得
export async function getChannelInfo(accessToken: string) {
    const youtubeClient = setCredentials(accessToken);

    const response = await youtubeClient.channels.list({
        part: ["snippet", "statistics"],
        mine: true,
    });

    const channel = response.data.items?.[0];
    if (!channel) {
        throw new Error("No channel found");
    }

    return {
        id: channel.id!,
        title: channel.snippet?.title || "",
        thumbnailUrl: channel.snippet?.thumbnails?.default?.url || "",
        subscriberCount: parseInt(channel.statistics?.subscriberCount || "0"),
        viewCount: parseInt(channel.statistics?.viewCount || "0"),
        videoCount: parseInt(channel.statistics?.videoCount || "0"),
    };
}

// 動画アップロード
export async function uploadVideo(
    accessToken: string,
    videoFile: Buffer | ReadableStream,
    metadata: {
        title: string;
        description?: string;
        categoryId?: string;
        tags?: string[];
        privacyStatus?: "public" | "private" | "unlisted";
    }
) {
    const youtubeClient = setCredentials(accessToken);

    const response = await youtubeClient.videos.insert({
        part: ["snippet", "status"],
        requestBody: {
            snippet: {
                title: metadata.title,
                description: metadata.description || "",
                categoryId: metadata.categoryId || "22", // People & Blogs
                tags: metadata.tags || [],
            },
            status: {
                privacyStatus: metadata.privacyStatus || "private",
            },
        },
        media: {
            body: videoFile as any,
        },
    });

    return {
        videoId: response.data.id!,
        title: response.data.snippet?.title || "",
        publishedAt: response.data.snippet?.publishedAt || "",
    };
}

// 動画スケジュール設定
export async function scheduleVideo(
    accessToken: string,
    videoId: string,
    publishAt: Date
) {
    const youtubeClient = setCredentials(accessToken);

    await youtubeClient.videos.update({
        part: ["status"],
        requestBody: {
            id: videoId,
            status: {
                privacyStatus: "private",
                publishAt: publishAt.toISOString(),
            },
        },
    });
}

// 動画リスト取得
export async function getVideos(accessToken: string, maxResults: number = 10) {
    const youtubeClient = setCredentials(accessToken);

    const response = await youtubeClient.search.list({
        part: ["snippet"],
        forMine: true,
        type: ["video"],
        maxResults,
        order: "date",
    });

    return response.data.items?.map(item => ({
        videoId: item.id?.videoId || "",
        title: item.snippet?.title || "",
        description: item.snippet?.description || "",
        thumbnailUrl: item.snippet?.thumbnails?.default?.url || "",
        publishedAt: item.snippet?.publishedAt || "",
    })) || [];
}

// 動画統計取得
export async function getVideoStats(accessToken: string, videoId: string) {
    const youtubeClient = setCredentials(accessToken);

    const response = await youtubeClient.videos.list({
        part: ["statistics", "contentDetails"],
        id: [videoId],
    });

    const video = response.data.items?.[0];
    if (!video) {
        throw new Error("Video not found");
    }

    return {
        viewCount: parseInt(video.statistics?.viewCount || "0"),
        likeCount: parseInt(video.statistics?.likeCount || "0"),
        commentCount: parseInt(video.statistics?.commentCount || "0"),
        duration: video.contentDetails?.duration || "",
    };
}

// アナリティクスデータ取得（YouTube Analytics API）
export async function getAnalytics(
    accessToken: string,
    startDate: string, // YYYY-MM-DD
    endDate: string,
    metrics: string[] = ["views", "estimatedMinutesWatched", "averageViewDuration"]
) {
    const oauth2Client = getOAuth2Client();
    oauth2Client.setCredentials({ access_token: accessToken });

    const youtubeAnalytics = google.youtubeAnalytics({ version: "v2", auth: oauth2Client });

    const response = await youtubeAnalytics.reports.query({
        ids: "channel==MINE",
        startDate,
        endDate,
        metrics: metrics.join(","),
        dimensions: "day",
    });

    return response.data;
}
