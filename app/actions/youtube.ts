"use server";

import {
    fetchYouTubeRSS,
    parseVideoEntries,
    YOUTUBE_CHANNELS,
    type YouTubeVideo,
} from "@/lib/youtube";

/**
 * トキノヒロバの最新動画を取得
 */
export async function getLatestStreams(limit: number = 3): Promise<YouTubeVideo[]> {
    try {
        const xml = await fetchYouTubeRSS(YOUTUBE_CHANNELS.TOKINO_HIROBA);
        return parseVideoEntries(xml, limit);
    } catch (error) {
        console.error("Failed to fetch streams:", error);
        return [];
    }
}

/**
 * 封解公儀の最新Shorts動画を取得
 */
export async function getLatestShorts(limit: number = 4): Promise<YouTubeVideo[]> {
    try {
        const xml = await fetchYouTubeRSS(YOUTUBE_CHANNELS.FUKAI_KOUGI);
        return parseVideoEntries(xml, limit);
    } catch (error) {
        console.error("Failed to fetch shorts:", error);
        return [];
    }
}
