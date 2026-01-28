"use client";

import { Button, Typography, Tag, message } from "antd";
import { ArrowLeftOutlined, ShareAltOutlined, GlobalOutlined } from "@ant-design/icons";
import Link from "next/link";
import { publishToolsApp } from "@/app/actions/tools-data";
import { useState } from "react";
import { useSession } from "@/lib/auth-client";

const { Text } = Typography;

interface RuntimeHeaderProps {
    title: string;
    author: string;
    appId: string;
    isPublic: boolean;
}

export function RuntimeHeader({ title, author, appId, isPublic: initialIsPublic }: RuntimeHeaderProps) {
    const { data: session } = useSession();
    const [isPublic, setIsPublic] = useState(initialIsPublic);
    const isOwner = session?.user?.id === author;

    const handlePublishToggle = async () => {
        const newState = !isPublic;
        try {
            const res = await publishToolsApp(appId, newState);
            if (res.success) {
                setIsPublic(newState);
                message.success(newState ? "公開しました" : "非公開にしました");
            } else {
                message.error("更新失敗: " + res.error);
            }
        } catch {
            message.error("エラーが発生しました");
        }
    };

    return (
        <div className="h-14 border-b border-zinc-800 bg-zinc-900 flex items-center px-4 justify-between shrink-0">
            <div className="flex items-center gap-4">
                <Link href="/tools/gallery">
                    <Button type="text" icon={<ArrowLeftOutlined />} className="text-zinc-400 hover:text-white" />
                </Link>
                <div>
                    <Text className="text-zinc-100 font-medium text-base block leading-none">{title}</Text>
                    {isPublic ? (
                        <Tag color="blue" className="mt-1 text-[10px] leading-3 border-none bg-blue-900/50 text-blue-300">Public</Tag>
                    ) : (
                        <Tag color="purple" className="mt-1 text-[10px] leading-3 border-none bg-purple-900/50 text-purple-300">Private</Tag>
                    )}
                </div>
            </div>

            <div className="flex gap-2">
                {isOwner && (
                    <Button
                        size="small"
                        icon={<GlobalOutlined />}
                        onClick={handlePublishToggle}
                        type={isPublic ? "default" : "primary"}
                        ghost={isPublic}
                    >
                        {isPublic ? "非公開にする" : "公開する"}
                    </Button>
                )}
                <Button size="small" icon={<ShareAltOutlined />} onClick={() => {
                    navigator.clipboard.writeText(window.location.href);
                    message.success("URLをコピーしました");
                }}>
                    共有
                </Button>
            </div>
        </div>
    );
}
