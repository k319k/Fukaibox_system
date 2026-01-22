"use client";

import { useEffect, useState, useCallback } from "react";
import { updatePresence, getProjectPresence } from "@/app/actions/kitchen/presence";

export type PresenceUser = {
    userId: string;
    lastSeenAt: Date;
    userName: string | null;
    userImage: string | null;
};

export function usePresence(projectId: string) {
    const [activeUsers, setActiveUsers] = useState<PresenceUser[]>([]);

    const fetchPresence = useCallback(async () => {
        try {
            const users = await getProjectPresence(projectId);
            setActiveUsers(users);
        } catch (error) {
            console.error("Failed to fetch presence:", error);
        }
    }, [projectId]);

    const sendHeartbeat = useCallback(async () => {
        try {
            await updatePresence(projectId);
        } catch (error) {
            console.error("Failed to update presence:", error);
        }
    }, [projectId]);

    useEffect(() => {
        // 初回ロード
        sendHeartbeat();
        fetchPresence();

        // ハートビート (30秒ごと)
        const heartbeatInterval = setInterval(sendHeartbeat, 30000);

        // ポーリング (10秒ごと)
        const pollingInterval = setInterval(fetchPresence, 10000);

        return () => {
            clearInterval(heartbeatInterval);
            clearInterval(pollingInterval);
        };
    }, [projectId, sendHeartbeat, fetchPresence]);

    return { activeUsers };
}
