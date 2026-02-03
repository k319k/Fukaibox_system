"use client";

import { useEffect, useState } from "react";
import { Card, Badge, Button } from "antd";
import { YoutubeOutlined, PlayCircleOutlined } from "@ant-design/icons";
import { checkFukaiLiveStatus } from "@/app/actions/youtube-public";
import { Icon } from "@iconify/react";

export default function LiveStatusWidget() {
    const [status, setStatus] = useState<{ isLive: boolean; video?: any } | null>(null);

    useEffect(() => {
        const check = async () => {
            const res = await checkFukaiLiveStatus();
            setStatus(res);
        };
        check();

        // 5分ごとにチェック (ポーリング)
        const interval = setInterval(check, 5 * 60 * 1000);
        return () => clearInterval(interval);
    }, []);

    if (!status?.isLive || !status.video) {
        return null; // ライブ中でなければ何も表示しない
    }

    return (
        <div className="w-full animate-in fade-in slide-in-from-top-4 duration-500 mb-6">
            <Card
                className="border-red-500 border-2 shadow-lg bg-red-50 dark:bg-red-950/20"
                bodyStyle={{ padding: '16px' }}
            >
                <div className="flex flex-col md:flex-row gap-4 items-center">
                    <div className="relative shrink-0">
                        <img
                            src={status.video.thumbnailUrl}
                            alt="Live Thumbnail"
                            className="w-48 h-27 object-cover rounded-md shadow-md"
                        />
                        <div className="absolute top-2 left-2">
                            <Badge count="LIVE NOW" color="red" />
                        </div>
                    </div>
                    <div className="flex-1 text-center md:text-left">
                        <h3 className="text-lg font-bold text-red-700 dark:text-red-400 flex items-center justify-center md:justify-start gap-2">
                            <Icon icon="mdi:broadcast" className="animate-pulse" />
                            YouTubeライブ配信中！
                        </h3>
                        <p className="font-semibold text-base mb-2 line-clamp-2">
                            {status.video.title}
                        </p>
                        <Button
                            type="primary"
                            danger
                            icon={<PlayCircleOutlined />}
                            href={`https://www.youtube.com/watch?v=${status.video.videoId}`}
                            target="_blank"
                            size="large"
                            className="w-full md:w-auto font-bold shadow-md"
                        >
                            視聴する
                        </Button>
                    </div>
                </div>
            </Card>
        </div>
    );
}
