"use client";

import { useState, useMemo, useCallback } from "react";
import { Tabs, message, Input, Select, Empty } from "antd";
import { PlusOutlined, SearchOutlined } from "@ant-design/icons";
import { useRouter } from "next/navigation";
import { AppCard } from "../../../app/(main)/tools/gallery/app-card";
import { M3Button } from "@/components/ui/m3-button";
import { remixApp } from "@/app/actions/tools-data";

// Define a local type matching AppCard's requirements to avoid 'any'
interface GalleryApp {
    id: string;
    name: string;
    description: string | null;
    isPublic: boolean | null;
    viewCount: number | null;
    remixCount: number | null;
    remixFrom: string | null;
    updatedAt: Date;
    type?: string;
    createdBy?: string;
}

interface GalleryTabsProps {
    publicApps: GalleryApp[];
    myApps: GalleryApp[];
    isLoggedIn: boolean;
    onRun: (id: string) => void;
}

export function GalleryTabs({ publicApps, myApps, isLoggedIn, onRun }: GalleryTabsProps) {
    const router = useRouter();
    const [remixing, setRemixing] = useState<string | null>(null);

    // Filter & Search State
    const [searchTerm, setSearchTerm] = useState("");
    const [sortOrder, setSortOrder] = useState<"newest" | "popular" | "remixed">("newest");
    const [filterType, setFilterType] = useState<"all" | "react" | "html" | "python">("all");

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
        } catch (_e) { // Changed 'e' to '_e' to suppress unused var warning
            message.error("エラーが発生しました");
        } finally {
            setRemixing(null);
        }
    };

    const handleShare = (appId: string) => {
        // Safe check for window
        if (typeof window !== "undefined") {
            const url = `${window.location.origin}/tools/app/${appId}`;
            navigator.clipboard.writeText(url);
            message.success("リンクをコピーしました！");
        }
    };

    // Filtering Logic
    const filterApps = useCallback((apps: GalleryApp[]) => {
        return apps.filter(app => {
            const matchesSearch = (app.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                app.description?.toLowerCase().includes(searchTerm.toLowerCase()));
            const matchesType = filterType === "all" ||
                (filterType === "react" && (!app.type || app.type === "react" || app.type === "react-ts")) ||
                (filterType === "html" && app.type?.includes("html")) ||
                (filterType === "python" && app.type === "python");

            return matchesSearch && matchesType;
        }).sort((a, b) => {
            if (sortOrder === "newest") return new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime();
            if (sortOrder === "popular") return (b.viewCount || 0) - (a.viewCount || 0);
            if (sortOrder === "remixed") return (b.remixCount || 0) - (a.remixCount || 0);
            return 0;
        });
    }, [searchTerm, filterType, sortOrder]);

    const filteredPublicApps = useMemo(() => filterApps(publicApps), [publicApps, filterApps]);
    const filteredMyApps = useMemo(() => filterApps(myApps), [myApps, filterApps]);

    // Common Grid Renderer
    const renderGrid = (apps: GalleryApp[], isMyApps: boolean = false) => {
        if (apps.length === 0) {
            return (
                <div className="col-span-full py-20 flex flex-col items-center justify-center opacity-60">
                    <Empty description={isMyApps ? "プロジェクトがありません" : "該当するプロジェクトが見つかりません"} />
                    {isMyApps && (
                        <M3Button
                            variant="filled"
                            icon={<PlusOutlined />}
                            onClick={() => router.push('/tools/studio')}
                            className="mt-4"
                        >
                            新規作成
                        </M3Button>
                    )}
                </div>
            );
        }
        return (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 p-1">
                {apps.map(app => (
                    <AppCard
                        key={app.id}
                        app={app}
                        onRun={onRun}
                        onRemix={isLoggedIn ? handleRemix : undefined}
                        onShare={handleShare}
                        isRemixing={remixing === app.id}
                        isOwned={isMyApps}
                    />
                ))}
            </div>
        );
    };

    // Filters Bar
    const renderFilters = () => (
        <div className="flex flex-wrap gap-4 mb-6 items-center bg-[var(--md-sys-color-surface-container-low)] p-4 rounded-[var(--radius-lg)]">
            <Input
                prefix={<SearchOutlined className="text-[var(--md-sys-color-on-surface-variant)]" />}
                placeholder="検索..."
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                className="max-w-xs rounded-full bg-[var(--md-sys-color-surface)] border-none"
                style={{ flex: 1, minWidth: 200 }}
            />

            <Select
                value={filterType}
                onChange={setFilterType}
                options={[
                    { value: "all", label: "すべてのタイプ" },
                    { value: "react", label: "React Apps" },
                    { value: "html", label: "HTML / JS" },
                    { value: "python", label: "Python Tools" },
                ]}
                className="min-w-[150px]"
                variant="borderless"
                style={{ backgroundColor: 'var(--md-sys-color-surface)', borderRadius: 999 }}
            />

            <Select
                value={sortOrder}
                onChange={setSortOrder}
                options={[
                    { value: "newest", label: "新着順" },
                    { value: "popular", label: "人気順" },
                    { value: "remixed", label: "Remix数順" },
                ]}
                className="min-w-[150px]"
                variant="borderless"
                style={{ backgroundColor: 'var(--md-sys-color-surface)', borderRadius: 999 }}
            />
        </div>
    );

    const tabsItems = [
        {
            key: "public",
            label: "公開プロジェクト",
            children: (
                <div>
                    {renderFilters()}
                    {renderGrid(filteredPublicApps)}
                </div>
            )
        },
    ];

    if (isLoggedIn) {
        tabsItems.push({
            key: "my",
            label: "マイプロジェクト",
            children: (
                <div>
                    {renderFilters()}
                    {renderGrid(filteredMyApps, true)}
                </div>
            )
        });
    }

    return (
        <div className="w-full">
            <Tabs items={tabsItems} />
        </div>
    );
}
