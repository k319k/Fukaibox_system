"use client";

import { Button, Tag, Avatar, Tooltip } from "antd";
import { ArrowLeftOutlined, DeleteOutlined } from "@ant-design/icons";
import { Icon } from "@iconify/react";
import { useRouter } from "next/navigation";
import { Project, CookingStatus } from "@/types/kitchen";
import { PresenceUser } from "@/hooks/kitchen/usePresence";

interface KitchenHeaderProps {
    project: Project;
    isGicho: boolean;
    activeUsers: PresenceUser[];
    showFontSizeControl: boolean;
    editorFontSize: number;
    onEditorFontSizeChange: (size: number) => void;
    onDeleteProject: () => void;
    onStatusChange?: (status: CookingStatus) => void;
}

export default function KitchenHeader({
    project,
    isGicho,
    activeUsers = [],
    showFontSizeControl,
    editorFontSize,
    onEditorFontSizeChange,
    onDeleteProject,
    onStatusChange
}: KitchenHeaderProps) {
    const router = useRouter();

    const statusConfig: Record<CookingStatus | "draft", { label: string; className: string; icon: string }> = {
        "draft": { label: "調理中", className: "bg-[var(--md-sys-color-tertiary-container)] text-[var(--md-sys-color-on-tertiary-container)]", icon: "material-symbols:skillet" },
        "cooking": { label: "調理中", className: "bg-[var(--md-sys-color-tertiary-container)] text-[var(--md-sys-color-on-tertiary-container)]", icon: "material-symbols:skillet" },
        "image_upload": { label: "画像募集開始", className: "bg-[var(--md-sys-color-secondary-container)] text-[var(--md-sys-color-on-secondary-container)]", icon: "material-symbols:add-photo-alternate" },
        "image_selection": { label: "画像採用中", className: "bg-[var(--md-sys-color-primary-container)] text-[var(--md-sys-color-on-primary-container)]", icon: "material-symbols:verified" },
        "download": { label: "完成", className: "bg-[var(--color-giin-container)] text-[var(--color-giin)]", icon: "material-symbols:check-circle" },
        "archived": { label: "アーカイブ", className: "bg-[var(--md-sys-color-surface-container-high)] text-[var(--md-sys-color-on-surface-variant)]", icon: "material-symbols:archive" },
        // "completed" is duplicate of "download" in display? Or distinct?
        // Let's stick to CookingStatus type keys.
        // Actually, Project.status is CookingStatus.
        // "draft" might be legacy or future.
    };
    // Fix implementation below to map properly.
    const config = statusConfig[project.status] || statusConfig["draft"];

    return (
        <div className="mb-6 flex flex-col md:flex-row items-start justify-between gap-4">
            <div>
                <Button
                    size="small"
                    type="text"
                    icon={<ArrowLeftOutlined />}
                    onClick={() => router.push('/cooking')}
                    className="mb-2 text-[var(--md-sys-color-primary)]"
                >
                    一覧に戻る
                </Button>
                <div className="flex flex-col gap-2">
                    <h1 className="text-headline-medium font-bold flex items-center gap-3 text-[var(--md-sys-color-on-surface)]">
                        {project.title}
                        <Tag
                            className={`rounded-full border-none flex items-center gap-1 px-3 py-1 text-label-large ${config.className}`}
                        >
                            <Icon icon={config.icon} className="text-lg" />
                            {config.label}
                        </Tag>
                    </h1>
                    {/* Active Users Display */}
                    <div className="flex items-center gap-2 overflow-x-auto max-w-full pb-2 md:pb-0 h-8">
                        {activeUsers.length > 0 && (
                            <div className="flex items-center -space-x-2 mr-2">
                                {activeUsers.map((user) => (
                                    <Tooltip key={user.userId} title={`${user.userName || 'User'} (編集中)`}>
                                        <div className="relative hover:z-10 transition-all hover:scale-110">
                                            <Avatar
                                                size="small"
                                                src={user.userImage}
                                                icon={<Icon icon="mdi:account" />}
                                                className="border-2 border-[var(--md-sys-color-surface)] shadow-sm cursor-help"
                                            />
                                            <span className="absolute bottom-0 right-0 w-2 h-2 rounded-full bg-[var(--color-kitchen-online)] border border-[var(--md-sys-color-surface)]"></span>
                                        </div>
                                    </Tooltip>
                                ))}
                                <span className="ml-3 text-label-medium text-[var(--md-sys-color-on-surface-variant)] flex items-center gap-1">
                                    <span className="w-2 h-2 rounded-full bg-[var(--color-kitchen-online)] inline-block animate-pulse"></span>
                                    {activeUsers.length}人が参加中
                                </span>
                            </div>
                        )}
                    </div>
                </div>
                {project.description && (
                    <p className="text-body-medium text-[var(--md-sys-color-on-surface-variant)] mt-2">{project.description}</p>
                )}
            </div>

            <div className="flex flex-wrap gap-2 items-center justify-end">
                {/* 議長/権限者用 ステータス操作 */}
                {isGicho && onStatusChange && (
                    <>
                        {project.status !== "download" && (
                            <Button
                                size="small"
                                type="primary"
                                icon={<Icon icon="material-symbols:check-circle-outline" />}
                                onClick={() => onStatusChange("download")}
                                className="shadow-none"
                            >
                                完成にする
                            </Button>
                        )}
                        {project.status !== "archived" && (
                            <Button
                                size="small"
                                icon={<Icon icon="material-symbols:archive-outline" />}
                                onClick={() => onStatusChange("archived")}
                                className="border-[var(--md-sys-color-outline)] text-[var(--md-sys-color-on-surface-variant)]"
                            >
                                アーカイブ
                            </Button>
                        )}
                        {project.status === "archived" && (
                            <Button
                                size="small"
                                type="primary"
                                icon={<Icon icon="material-symbols:unarchive" />}
                                onClick={() => onStatusChange("cooking")}
                                className="shadow-none"
                            >
                                アーカイブ解除
                            </Button>
                        )}
                    </>
                )}

                {/* 文字サイズ変更 (調理タブのみ) */}
                {showFontSizeControl && (
                    <div className="flex items-center gap-1 bg-[var(--md-sys-color-surface-container-high)] rounded-lg p-1">
                        <Button
                            type="text"
                            size="small"
                            icon={<Icon icon="mdi:format-font-size-decrease" />}
                            onClick={() => onEditorFontSizeChange(Math.max(12, editorFontSize - 2))}
                        />
                        <span className="text-xs w-8 text-center">{editorFontSize}px</span>
                        <Button
                            type="text"
                            size="small"
                            icon={<Icon icon="mdi:format-font-size-increase" />}
                            onClick={() => onEditorFontSizeChange(Math.min(32, editorFontSize + 2))}
                        />
                    </div>
                )}

                {/* プロジェクト削除 (儀長のみ) */}
                {isGicho && (
                    <Button
                        danger
                        size="small"
                        icon={<DeleteOutlined />}
                        onClick={onDeleteProject}
                    >
                        削除
                    </Button>
                )}
            </div>
        </div>
    );
}
