"use client";

import { useEffect, useState } from "react";
import { Card, Button, Spin, message, Result, Segmented } from "antd";
import { GoogleOutlined, ReloadOutlined, UploadOutlined, CalendarOutlined, DisconnectOutlined } from "@ant-design/icons";
import { Icon } from "@iconify/react";
import { getYouTubeConnectionStatus, getYouTubeConnectUrl, disconnectYouTube, getChannelAnalytics, getScheduledVideos } from "@/app/actions/youtube-manager";
import AnalyticsPanel from "@/components/youtube/analytics-panel";
import UploadModal from "@/components/youtube/upload-modal";
import { M3Button } from "@/components/ui/m3-button";
import { format, subDays } from "date-fns";

export default function YouTubeManagerPage() {
    const [status, setStatus] = useState<any>(null); // { connected: boolean, channel: any }
    const [loading, setLoading] = useState(true);
    const [analyicsData, setAnalyticsData] = useState<any>(null);
    const [analyicsLoading, setAnalyticsLoading] = useState(false);
    const [analyticsPeriod, setAnalyticsPeriod] = useState<string>("30d");

    // Scheduled Videos
    const [schedules, setSchedules] = useState<any[]>([]);
    const [schedulesLoading, setSchedulesLoading] = useState(false);

    // Upload Modal
    const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);

    useEffect(() => {
        fetchStatus();
    }, []);

    useEffect(() => {
        if (status?.connected) {
            fetchAnalytics(analyticsPeriod);
            fetchSchedules();
        }
    }, [status?.connected, analyticsPeriod]);

    const fetchStatus = async () => {
        setLoading(true);
        try {
            const res = await getYouTubeConnectionStatus();
            if (res.success) {
                setStatus(res);
            } else {
                if (res.error === "Unauthorized") {
                    // Handled by layout usually, but just in case
                }
            }
        } catch (e) {
            console.error(e);
        } finally {
            setLoading(false);
        }
    };

    const fetchAnalytics = async (period: string) => {
        setAnalyticsLoading(true);
        try {
            const endDate = format(new Date(), "yyyy-MM-dd");
            let startDate = format(subDays(new Date(), 30), "yyyy-MM-dd");

            if (period === '7d') startDate = format(subDays(new Date(), 7), "yyyy-MM-dd");
            if (period === '90d') startDate = format(subDays(new Date(), 90), "yyyy-MM-dd");

            const res = await getChannelAnalytics(startDate, endDate);
            if (res.success) {
                setAnalyticsData(res.data);
            }
        } catch (e) {
            console.error(e);
        } finally {
            setAnalyticsLoading(false);
        }
    };

    const fetchSchedules = async () => {
        setSchedulesLoading(true);
        try {
            const res = await getScheduledVideos();
            if (res.success) {
                setSchedules(res.videos || []);
            }
        } catch (e) {
            console.error(e);
        } finally {
            setSchedulesLoading(false);
        }
    };

    const handleConnect = async () => {
        try {
            const res = await getYouTubeConnectUrl();
            if (res.success && res.url) {
                window.location.href = res.url;
            } else {
                message.error("連携URLの取得に失敗しました");
            }
        } catch (e) {
            message.error("エラーが発生しました");
        }
    };

    const handleDisconnect = async () => {
        if (!confirm("YouTube連携を解除しますか？")) return;
        try {
            const res = await disconnectYouTube();
            if (res.success) {
                message.success("連携を解除しました");
                setStatus({ connected: false });
            } else {
                message.error(res.error || "解除に失敗しました");
            }
        } catch (e) {
            message.error("エラーが発生しました");
        }
    };

    const handleUploadComplete = () => {
        setIsUploadModalOpen(false);
        fetchSchedules(); // Refresh list
    };

    if (loading) {
        return <div className="flex justify-center items-center h-[50vh]"><Spin size="large" /></div>;
    }

    if (!status?.connected) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[60vh] gap-6">
                <Result
                    icon={<GoogleOutlined className="text-red-500" />}
                    title="YouTubeと連携されていません"
                    subTitle="アナリティクスの確認や動画の予約投稿を行うには、YouTubeチャンネルと連携してください。"
                    extra={
                        <M3Button
                            variant="filled"
                            onClick={handleConnect}
                            icon={<GoogleOutlined />}
                            size="large"
                        >
                            YouTubeと連携する
                        </M3Button>
                    }
                />
            </div>
        );
    }

    return (
        <div className="max-w-7xl mx-auto p-4 md:p-8 space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
            {/* Header */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div className="flex items-center gap-4">
                    {status.channel?.thumbnailUrl && (
                        <img
                            src={status.channel.thumbnailUrl}
                            alt="Channel Icon"
                            className="w-16 h-16 rounded-full border-2 border-[var(--md-sys-color-primary)] shadow-md"
                        />
                    )}
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight text-[var(--md-sys-color-on-background)] flex items-center gap-2">
                            {status.channel?.title || "YouTube Channel"}
                            <span className="text-xs bg-red-100 text-red-700 px-2 py-0.5 rounded-full border border-red-200">Official</span>
                        </h1>
                        <p className="text-[var(--md-sys-color-on-surface-variant)] text-sm flex gap-4 mt-1">
                            <span>登録者: {Number(status.channel?.subscriberCount).toLocaleString()}人</span>
                            <span>•</span>
                            <span>動画数: {Number(status.channel?.videoCount).toLocaleString()}本</span>
                        </p>
                    </div>
                </div>

                <div className="flex gap-2">
                    <M3Button
                        variant="tonal"
                        onClick={fetchStatus}
                        icon={<ReloadOutlined />}
                        className="!h-10"
                    >
                        更新
                    </M3Button>
                    <M3Button
                        variant="outlined"
                        onClick={handleDisconnect}
                        icon={<DisconnectOutlined />}
                        className="!h-10 text-red-500 border-red-200 hover:bg-red-50"
                    >
                        解除
                    </M3Button>
                </div>
            </div>

            {/* Actions */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Card
                    className="md:col-span-2 shadow-sm border-[var(--md-sys-color-outline-variant)] bg-gradient-to-br from-[var(--md-sys-color-surface)] to-[var(--md-sys-color-surface-container)]"
                    bodyStyle={{ padding: 0 }}
                >
                    <div className="p-6">
                        <AnalyticsPanel
                            data={analyicsData}
                            loading={analyicsLoading}
                            period={analyticsPeriod}
                            onPeriodChange={setAnalyticsPeriod}
                        />
                    </div>
                </Card>

                <div className="space-y-6">
                    <Card className="shadow-sm border-none bg-indigo-50/50 dark:bg-indigo-950/20">
                        <div className="flex flex-col items-center text-center gap-4 py-4">
                            <div className="w-16 h-16 rounded-full bg-indigo-100 dark:bg-indigo-900/50 flex items-center justify-center">
                                <UploadOutlined className="text-2xl text-indigo-600 dark:text-indigo-300" />
                            </div>
                            <div>
                                <h3 className="tex-lg font-bold">動画をアップロード</h3>
                                <p className="text-xs text-gray-500 mt-1">MP4ファイルをアップロードして<br />公開予約を設定します。</p>
                            </div>
                            <M3Button
                                variant="filled"
                                icon={<UploadOutlined />}
                                onClick={() => setIsUploadModalOpen(true)}
                                className="w-full bg-indigo-600 hover:bg-indigo-700"
                            >
                                新規アップロード
                            </M3Button>
                        </div>
                    </Card>

                    <Card
                        title={<div className="flex items-center gap-2"><CalendarOutlined /> 予約リスト</div>}
                        className="shadow-sm border-[var(--md-sys-color-outline-variant)]"
                        extra={<Button type="link" size="small">すべて見る</Button>}
                    >
                        {schedulesLoading ? <div className="text-center py-4"><Spin /></div> : (
                            schedules.length === 0 ? (
                                <div className="text-center py-8 text-gray-400 text-sm">予約中の動画はありません</div>
                            ) : (
                                <div className="space-y-3">
                                    {schedules.map(video => (
                                        <div key={video.id} className="flex gap-3 items-start p-2 hover:bg-black/5 rounded group relative">
                                            <div className="w-10 h-10 bg-gray-200 rounded flex-shrink-0 flex items-center justify-center text-xs text-gray-400">
                                                No Img
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <p className="text-sm font-medium truncate">{video.title}</p>
                                                <p className="text-xs text-gray-500">
                                                    {format(new Date(video.scheduledDate), "M月d日 HH:mm")} 公開
                                                </p>
                                            </div>
                                            <div className="text-xs px-2 py-0.5 rounded bg-orange-100 text-orange-700 border border-orange-200">
                                                Pending
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )
                        )}
                    </Card>
                </div>
            </div>

            <UploadModal
                visible={isUploadModalOpen}
                onClose={() => setIsUploadModalOpen(false)}
            />
        </div>
    );
}
