import { useEffect, useState, useCallback } from "react";
import { updatePresenceStatus, getProjectPresence } from "@/app/actions/kitchen/presence";

export type PresenceStatus = "not_participating" | "participating" | "completed";

export type PresenceUser = {
    userId: string;
    lastSeenAt: Date;
    status: PresenceStatus | null;
    userName: string | null;
    userImage: string | null;
};

export function usePresence(projectId: string) {
    const [activeUsers, setActiveUsers] = useState<PresenceUser[]>([]);
    // 単純化のため、ユーザーIDは取得済みと仮定するか、ここで取得する。
    // クライアントサイドで自分のIDを知る方法が必要。
    // BetterAuthのuseSessionを使うか、KitchenDetailClientからpropで渡すのがベターだが、
    // ここでは簡易的にactiveUsersの中から自分を探すロジックはComponent側に任せる設計にする。

    const fetchPresence = useCallback(async () => {
        try {
            const users = await getProjectPresence(projectId);
            // DBはstatusをstringで返す可能性があるので型キャスト
            const formattedUsers = users.map(u => ({
                ...u,
                status: (u.status as PresenceStatus) || "not_participating"
            }));
            setActiveUsers(formattedUsers);
        } catch (error) {
            console.error("Failed to fetch presence:", error);
        }
    }, [projectId]);

    const sendHeartbeat = useCallback(async () => {
        try {
            // ステータス無しでハートビートだけ送る（最終アクセス日時更新）
            await updatePresenceStatus(projectId);
        } catch (error) {
            console.error("Failed to update presence:", error);
        }
    }, [projectId]);

    const updateStatus = useCallback(async (status: PresenceStatus) => {
        try {
            await updatePresenceStatus(projectId, status);
            // 即時反映のためにフェッチする
            fetchPresence();
        } catch (error) {
            console.error("Failed to update status:", error);
            alert("ステータスの更新に失敗しました");
        }
    }, [projectId, fetchPresence]);

    useEffect(() => {
        const init = async () => {
            await sendHeartbeat();
            await fetchPresence();
        };
        void init();

        // ハートビート (30秒ごと)
        const heartbeatInterval = setInterval(sendHeartbeat, 30000);

        // ポーリング (5秒ごと - リアルタイム性を高めるため短縮)
        const pollingInterval = setInterval(fetchPresence, 5000);

        return () => {
            clearInterval(heartbeatInterval);
            clearInterval(pollingInterval);
        };
    }, [projectId, sendHeartbeat, fetchPresence]);

    return { activeUsers, updateStatus };
}
