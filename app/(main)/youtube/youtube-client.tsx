"use client";

import { useState, useEffect, useCallback } from "react";
import { Tabs, message } from "antd";
import { BarChartOutlined, CalendarOutlined } from "@ant-design/icons";
import { ConnectionStatus } from "@/components/youtube/connection-status";
import { AnalyticsPanel } from "@/components/youtube/analytics-panel";
import { SchedulePanel } from "@/components/youtube/schedule-panel";
import { getChannelAnalytics } from "@/app/actions/youtube-manager";
import { subDays, format } from "date-fns";

interface YouTubeClientProps {
    initialConnectionStatus: any;
    initialScheduledVideos: any[];
}

export function YouTubeClient({ initialConnectionStatus, initialScheduledVideos }: YouTubeClientProps) {
    const [connectionStatus, setConnectionStatus] = useState(initialConnectionStatus);
    const [scheduledVideos, setScheduledVideos] = useState(initialScheduledVideos);

    // Analytics state
    const [analyticsData, setAnalyticsData] = useState<any>(null);
    const [analyticsLoading, setAnalyticsLoading] = useState(false);
    const [period, setPeriod] = useState("30d");

    // URL paramsからメッセージを表示
    useEffect(() => {
        const params = new URLSearchParams(window.location.search);
        if (params.get("connected") === "true") {
            message.success("YouTubeアカウントを連携しました");
            window.history.replaceState({}, "", "/youtube");
            window.location.reload();
        } else if (params.get("error")) {
            message.error("YouTube連携に失敗しました");
            window.history.replaceState({}, "", "/youtube");
        }
    }, []);

    // アナリティクスデータ取得
    const fetchAnalytics = useCallback(async (p: string) => {
        setAnalyticsLoading(true);
        try {
            const days = p === "7d" ? 7 : p === "90d" ? 90 : 30;
            const endDate = format(new Date(), "yyyy-MM-dd");
            const startDate = format(subDays(new Date(), days), "yyyy-MM-dd");

            const result = await getChannelAnalytics(startDate, endDate);
            if (result.success) {
                setAnalyticsData(result.data);
            } else {
                console.error("Analytics fetch failed:", result.error);
                setAnalyticsData(null);
            }
        } catch (error) {
            console.error("Analytics fetch error:", error);
            setAnalyticsData(null);
        } finally {
            setAnalyticsLoading(false);
        }
    }, []);

    // 接続済みの場合、初回データ取得
    useEffect(() => {
        if (connectionStatus.connected) {
            fetchAnalytics(period);
        }
    }, [connectionStatus.connected]); // eslint-disable-line react-hooks/exhaustive-deps

    const handlePeriodChange = (val: string) => {
        setPeriod(val);
        fetchAnalytics(val);
    };

    const handleReconnect = () => {
        window.location.reload();
    };

    if (!connectionStatus.connected) {
        return (
            <div className="min-h-screen bg-[var(--md-sys-color-surface)] p-8">
                <div className="max-w-7xl mx-auto">
                    <h1 className="text-[var(--md-sys-color-on-surface)] text-3xl font-normal mb-2">
                        YouTube Manager
                    </h1>
                    <p className="text-[var(--md-sys-color-on-surface-variant)] mb-8">
                        動画の予約投稿とアナリティクスを管理
                    </p>

                    <ConnectionStatus
                        connectionStatus={connectionStatus}
                        onReconnect={handleReconnect}
                    />
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[var(--md-sys-color-surface)] p-8">
            <div className="max-w-7xl mx-auto">
                <div className="mb-8 flex justify-between items-center">
                    <div>
                        <h1 className="text-[var(--md-sys-color-on-surface)] text-3xl font-normal mb-2">
                            YouTube Manager
                        </h1>
                        <p className="text-[var(--md-sys-color-on-surface-variant)]">
                            {connectionStatus.channel?.title} の管理
                        </p>
                    </div>
                    <ConnectionStatus
                        connectionStatus={connectionStatus}
                        onReconnect={handleReconnect}
                        compact
                    />
                </div>

                <Tabs
                    defaultActiveKey="analytics"
                    items={[
                        {
                            key: "analytics",
                            label: (
                                <span>
                                    <BarChartOutlined /> アナリティクス
                                </span>
                            ),
                            children: (
                                <AnalyticsPanel
                                    data={analyticsData}
                                    loading={analyticsLoading}
                                    period={period}
                                    onPeriodChange={handlePeriodChange}
                                />
                            ),
                        },
                        {
                            key: "schedule",
                            label: (
                                <span>
                                    <CalendarOutlined /> 予約投稿
                                </span>
                            ),
                            children: (
                                <SchedulePanel
                                    initialVideos={scheduledVideos}
                                    onUpdate={(videos) => setScheduledVideos(videos)}
                                />
                            ),
                        },
                    ]}
                    style={{ backgroundColor: "var(--md-sys-color-surface-container-low)" }}
                    className="rounded-[var(--radius-lg)]"
                />
            </div>
        </div>
    );
}
