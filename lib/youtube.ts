import { z } from "zod";

// チャンネルID定数
export const YOUTUBE_CHANNELS = {
    TOKINO_HIROBA: "UCH44llT2aUCdbXPB_gUGQaQ", // トキノヒロバ（ライブ配信）
    FUKAI_KOUGI: "UCblyunXbUNdId1mJt3QzX8Q", // 芒星界域封解公儀（Shorts）
} as const;

// YouTube動画情報の型定義
export const YouTubeVideoSchema = z.object({
    videoId: z.string(),
    title: z.string(),
    channelName: z.string(),
    publishedAt: z.string(),
    thumbnailUrl: z.string(),
    videoUrl: z.string(),
    description: z.string().optional(),
    viewCount: z.number().optional(),
});

export type YouTubeVideo = z.infer<typeof YouTubeVideoSchema>;

/**
 * YouTube RSSフィードを取得
 */
export async function fetchYouTubeRSS(channelId: string): Promise<string> {
    const url = `https://www.youtube.com/feeds/videos.xml?channel_id=${channelId}`;
    const response = await fetch(url, {
        next: { revalidate: 300 }, // 5分キャッシュ
    });

    if (!response.ok) {
        throw new Error(`Failed to fetch RSS feed: ${response.status}`);
    }

    return response.text();
}

/**
 * RSS XMLから動画エントリーを解析
 */
export function parseVideoEntries(xml: string, limit: number = 5): YouTubeVideo[] {
    const videos: YouTubeVideo[] = [];

    // 正規表現でエントリーを抽出
    const entryRegex = /<entry>([\s\S]*?)<\/entry>/g;
    let match;

    while ((match = entryRegex.exec(xml)) !== null && videos.length < limit) {
        const entry = match[1];

        // 各フィールドを抽出
        const videoId = extractTag(entry, "yt:videoId");
        const title = extractTag(entry, "title");
        const channelName = extractTag(entry, "name");
        const publishedAt = extractTag(entry, "published");
        const description = extractMediaTag(entry, "media:description");
        const viewCountStr = extractAttribute(entry, "media:statistics", "views");

        // サムネイルURL
        const thumbnailMatch = entry.match(/<media:thumbnail url="([^"]+)"/);
        const thumbnailUrl = thumbnailMatch?.[1] || `https://i.ytimg.com/vi/${videoId}/hqdefault.jpg`;

        // 動画URL（ShortsかどうかはURLから判断）
        const linkMatch = entry.match(/<link rel="alternate" href="([^"]+)"/);
        const videoUrl = linkMatch?.[1] || `https://www.youtube.com/watch?v=${videoId}`;

        if (videoId && title) {
            videos.push({
                videoId,
                title: decodeHTMLEntities(title),
                channelName: channelName || "",
                publishedAt,
                thumbnailUrl,
                videoUrl,
                description: description ? decodeHTMLEntities(description) : undefined,
                viewCount: viewCountStr ? parseInt(viewCountStr, 10) : undefined,
            });
        }
    }

    return videos;
}

/**
 * XMLタグの中身を抽出
 */
function extractTag(xml: string, tag: string): string {
    const regex = new RegExp(`<${tag}>([\\s\\S]*?)<\\/${tag}>`);
    const match = xml.match(regex);
    return match?.[1]?.trim() || "";
}

/**
 * media:タグの中身を抽出
 */
function extractMediaTag(xml: string, tag: string): string {
    const regex = new RegExp(`<${tag}>([\\s\\S]*?)<\\/${tag}>`);
    const match = xml.match(regex);
    return match?.[1]?.trim() || "";
}

/**
 * 属性値を抽出
 */
function extractAttribute(xml: string, tag: string, attr: string): string {
    const regex = new RegExp(`<${tag}[^>]*${attr}="([^"]+)"`);
    const match = xml.match(regex);
    return match?.[1] || "";
}

/**
 * HTMLエンティティをデコード
 */
function decodeHTMLEntities(text: string): string {
    return text
        .replace(/&amp;/g, "&")
        .replace(/&lt;/g, "<")
        .replace(/&gt;/g, ">")
        .replace(/&quot;/g, '"')
        .replace(/&#39;/g, "'");
}

/**
 * 日付を相対時間に変換（例: "2時間前"）
 */
export function formatRelativeTime(isoDate: string): string {
    const date = new Date(isoDate);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffSec = Math.floor(diffMs / 1000);
    const diffMin = Math.floor(diffSec / 60);
    const diffHour = Math.floor(diffMin / 60);
    const diffDay = Math.floor(diffHour / 24);

    if (diffDay > 0) return `${diffDay}日前`;
    if (diffHour > 0) return `${diffHour}時間前`;
    if (diffMin > 0) return `${diffMin}分前`;
    return "たった今";
}

/**
 * 日付をフォーマット（例: "2026.01.16"）
 */
export function formatDate(isoDate: string): string {
    const date = new Date(isoDate);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    return `${year}.${month}.${day}`;
}
