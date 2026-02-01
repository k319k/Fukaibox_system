"use client";

import { Card, Avatar, Button } from "antd";
import { YoutubeOutlined, DisconnectOutlined, LinkOutlined } from "@ant-design/icons";
import { M3Button } from "@/components/ui/m3-button";
import { getYouTubeConnectUrl, disconnectYouTube } from "@/app/actions/youtube-manager";
import { message as antdMessage } from "antd";

interface ConnectionStatusProps {
    connectionStatus: any;
    onReconnect: () => void;
    compact?: boolean;
}

export function ConnectionStatus({ connectionStatus, onReconnect, compact = false }: ConnectionStatusProps) {
    const handleConnect = async () => {
        const result = await getYouTubeConnectUrl();
        if (result.success && result.url) {
            window.location.href = result.url;
        } else {
            antdMessage.error("認証URLの取得に失敗しました");
        }
    };

    const handleDisconnect = async () => {
        const result = await disconnectYouTube();
        if (result.success) {
            antdMessage.success("YouTube連携を解除しました");
            onReconnect();
        } else {
            antdMessage.error("連携解除に失敗しました");
        }
    };

    if (!connectionStatus.connected) {
        if (compact) return null;

        return (
            <Card
                className="shadow-sm"
                style={{
                    backgroundColor: "var(--md-sys-color-surface-container-low)",
                    borderColor: "var(--md-sys-color-outline-variant)",
                }}
            >
                <div className="flex flex-col items-center justify-center py-12">
                    <YoutubeOutlined style={{ fontSize: 64, color: "#FF0000", marginBottom: 24 }} />
                    <h3 className="text-[var(--md-sys-color-on-surface)] text-xl mb-2">
                        YouTubeアカウントを連携
                    </h3>
                    <p className="text-[var(--md-sys-color-on-surface-variant)] mb-6 text-center max-w-md">
                        YouTubeアカウントを連携すると、動画の予約投稿やアナリティクスを管理できます。
                    </p>
                    <M3Button
                        variant="filled"
                        icon={<LinkOutlined />}
                        onClick={handleConnect}
                    >
                        YouTubeと連携
                    </M3Button>
                    {connectionStatus.needsReconnect && (
                        <p className="text-[var(--md-sys-color-error)] mt-4 text-sm">
                            認証の有効期限が切れました。再度連携してください。
                        </p>
                    )}
                </div>
            </Card>
        );
    }

    if (compact) {
        return (
            <div className="flex items-center gap-3">
                <Avatar src={connectionStatus.channel?.thumbnailUrl} size={32} />
                <span className="text-[var(--md-sys-color-on-surface)]">
                    {connectionStatus.channel?.title}
                </span>
                <Button
                    type="text"
                    size="small"
                    icon={<DisconnectOutlined />}
                    onClick={handleDisconnect}
                    danger
                >
                    解除
                </Button>
            </div>
        );
    }

    return (
        <Card
            className="shadow-sm mb-6"
            style={{
                backgroundColor: "var(--md-sys-color-surface-container-low)",
                borderColor: "var(--md-sys-color-outline-variant)",
            }}
        >
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <Avatar src={connectionStatus.channel?.thumbnailUrl} size={64} />
                    <div>
                        <h3 className="text-[var(--md-sys-color-on-surface)] text-lg mb-1">
                            {connectionStatus.channel?.title}
                        </h3>
                        <div className="flex gap-4 text-sm text-[var(--md-sys-color-on-surface-variant)]">
                            <span>登録者: {connectionStatus.channel?.subscriberCount?.toLocaleString()}</span>
                            <span>動画: {connectionStatus.channel?.videoCount?.toLocaleString()}</span>
                            <span>総再生回数: {connectionStatus.channel?.viewCount?.toLocaleString()}</span>
                        </div>
                    </div>
                </div>
                <M3Button
                    variant="outlined"
                    icon={<DisconnectOutlined />}
                    onClick={handleDisconnect}
                >
                    連携解除
                </M3Button>
            </div>
        </Card>
    );
}
