"use server";

import { getLiveStatus } from "@/lib/youtube-api";
import { env } from "@/lib/env";

/**
 * 封解講義チャンネルのライブ配信状態を確認する
 * (API Keyを使用するため、認証不要)
 */
export async function checkFukaiLiveStatus() {
    try {
        const channelId = env.YOUTUBE_FUKAIKOUGI_CHANNEL_ID;
        if (!channelId) {
            console.error("YOUTUBE_FUKAIKOUGI_CHANNEL_ID is not set");
            return { isLive: false };
        }

        const liveInfo = await getLiveStatus(channelId);

        if (liveInfo) {
            return {
                isLive: true,
                video: liveInfo
            };
        }

        return { isLive: false };
    } catch (error) {
        console.error("Check Live Status Error:", error);
        return { isLive: false };
    }
}
