"use client";

import { useState } from "react";
import { Tabs, message } from "antd";
import { PlusOutlined } from "@ant-design/icons";
import { useRouter } from "next/navigation";
import { AppCard } from "../../../app/(main)/tools/gallery/app-card";
import { M3Button } from "@/components/ui/m3-button";
import { remixApp } from "@/app/actions/tools-data";

interface GalleryTabsProps {
    publicApps: any[];
    myApps: any[];
    isLoggedIn: boolean;
    onRun: (id: string) => void;
}

export function GalleryTabs({ publicApps, myApps, isLoggedIn, onRun }: GalleryTabsProps) {
    const router = useRouter();
    const [remixing, setRemixing] = useState<string | null>(null);

    const handleRemix = async (appId: string) => {
        setRemixing(appId);
        try {
            const result = await remixApp(appId);
            if (result.success && result.appId) {
                message.success("Remixしました！スタジオで編集できます。");
                router.push(`/tools/studio?id=${result.appId}`);
            } else {
                message.error(result.error || "Remixに失敗しました");
            }
        } catch (e) {
            message.error("エラーが発生しました");
        } finally {
            setRemixing(null);
        }
    };

    const handleShare = (appId: string) => {
        const url = `${window.location.origin}/tools/app/${appId}`;
        navigator.clipboard.writeText(url);
        message.success("リンクをコピーしました！");
    };

    const tabs = [
        {
            key: "public",
            label: "公開プロジェクト",
            children: (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                    {publicApps.length === 0 ? (
                        <div className="col-span-full text-center py-20">
                            <p style={{ color: 'var(--md-sys-color-on-surface-variant)' }}>
                                公開プロジェクトはまだありません
                            </p>
                        </div>
                    ) : (
                        publicApps.map(app => (
                            <AppCard
                                key={app.id}
                                app={app}
                                onRun={onRun}
                                onRemix={isLoggedIn ? handleRemix : undefined}
                                onShare={handleShare}
                                isRemixing={remixing === app.id}
                            />
                        ))
                    )}
                </div>
            )
        },
    ];

    if (isLoggedIn) {
        tabs.push({
            key: "my",
            label: "マイプロジェクト",
            children: (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                    {myApps.length === 0 ? (
                        <div className="col-span-full text-center py-20">
                            <p style={{ color: 'var(--md-sys-color-on-surface-variant)' }}>
                                まだプロジェクトがありません
                            </p>
                            <M3Button
                                variant="filled"
                                icon={<PlusOutlined />}
                                onClick={() => router.push('/tools/studio')}
                                className="mt-4"
                            >
                                新規作成
                            </M3Button>
                        </div>
                    ) : (
                        myApps.map(app => (
                            <AppCard
                                key={app.id}
                                app={app}
                                onRun={onRun}
                                onRemix={handleRemix}
                                onShare={handleShare}
                                isRemixing={remixing === app.id}
                                isOwned
                            />
                        ))
                    )}
                </div>
            )
        });
    }

    return (
        <div>
            <div className="flex justify-between items-center mb-6">
                <div>
                    <h1 className="text-[var(--md-sys-color-on-surface)] text-3xl font-normal">Tools Gallery</h1>
                    <p className="text-[var(--md-sys-color-on-surface-variant)] mt-2">AI主導型アプリケーションプラットフォーム</p>
                </div>
                {isLoggedIn && (
                    <M3Button
                        variant="filled"
                        icon={<PlusOutlined />}
                        onClick={() => router.push('/tools/studio')}
                    >
                        新規作成
                    </M3Button>
                )}
            </div>

            <Tabs
                defaultActiveKey="public"
                items={tabs}
                className="m3-tabs"
            />
        </div>
    );
}
