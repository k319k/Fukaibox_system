import { getYouTubeConnectionStatus, getScheduledVideos } from "@/app/actions/youtube-manager";
import { YouTubeClient } from "./youtube-client";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { redirect } from "next/navigation";

export const dynamic = "force-dynamic";

export default async function YouTubePage() {
    const session = await auth.api.getSession({
        headers: await headers(),
    });

    // 儀長ロールのみアクセス可能
    if (!session?.user || session.user.role !== "gicho") {
        redirect("/");
    }

    // YouTube連携状態取得
    const connectionStatus = await getYouTubeConnectionStatus();

    // 予約動画リスト取得
    const scheduledVideosResult = connectionStatus.connected
        ? await getScheduledVideos()
        : { success: true, videos: [] };

    return (
        <YouTubeClient
            initialConnectionStatus={connectionStatus}
            initialScheduledVideos={scheduledVideosResult.videos || []}
        />
    );
}
