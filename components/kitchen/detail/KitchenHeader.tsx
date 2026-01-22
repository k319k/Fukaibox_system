"use client";

import { Button, Tag } from "antd";
import { ArrowLeftOutlined, DeleteOutlined } from "@ant-design/icons";
import { Icon } from "@iconify/react";
import { useRouter } from "next/navigation";
import { Project } from "@/types/kitchen";

interface KitchenHeaderProps {
    project: Project;
    isGicho: boolean;
    showFontSizeControl: boolean;
    editorFontSize: number;
    onEditorFontSizeChange: (size: number) => void;
    onDeleteProject: () => void;
    onStatusChange?: (status: string) => void;
}

export default function KitchenHeader({
    project,
    isGicho,
    showFontSizeControl,
    editorFontSize,
    onEditorFontSizeChange,
    onDeleteProject,
    onStatusChange
}: KitchenHeaderProps) {
    const router = useRouter();

    const statusConfig: Record<string, { label: string; className: string; icon: string }> = {
        "draft": { label: "調理中", className: "bg-[var(--md-sys-color-tertiary-container)] text-[var(--md-sys-color-on-tertiary-container)]", icon: "material-symbols:skillet" },
        "cooking": { label: "調理中", className: "bg-[var(--md-sys-color-tertiary-container)] text-[var(--md-sys-color-on-tertiary-container)]", icon: "material-symbols:skillet" },
        "image_collection": { label: "画像収集中", className: "bg-[var(--md-sys-color-primary-container)] text-[var(--md-sys-color-on-primary-container)]", icon: "material-symbols:add-photo-alternate" },
        "image_selection": { label: "画像採用中", className: "bg-[var(--md-sys-color-primary-container)] text-[var(--md-sys-color-on-primary-container)]", icon: "material-symbols:verified" },
        "download": { label: "完成", className: "bg-[var(--color-giin-container)] text-[var(--color-giin)]", icon: "material-symbols:check-circle" },
        "completed": { label: "完成", className: "bg-[var(--color-giin-container)] text-[var(--color-giin)]", icon: "material-symbols:check-circle" },
        "archived": { label: "アーカイブ", className: "bg-[var(--md-sys-color-surface-container-high)] text-[var(--md-sys-color-on-surface-variant)]", icon: "material-symbols:archive" },
    };
    const config = statusConfig[project.status] || statusConfig["draft"];

    return (
        <div className="mb-6 flex flex-col md:flex-row items-start justify-between gap-4">
            <div>
                <Button
                    size="small"
                    type="text"
                    icon={<ArrowLeftOutlined />}
                    onClick={() => router.push('/kitchen')}
                    className="mb-2 text-[var(--md-sys-color-primary)]"
                >
                    一覧に戻る
                </Button>
                <h1 className="text-headline-medium font-bold flex items-center gap-3 text-[var(--md-sys-color-on-surface)]">
                    {project.title}
                    <Tag
                        className={`rounded-full border-none flex items-center gap-1 px-3 py-1 text-label-large ${config.className}`}
                    >
                        <Icon icon={config.icon} className="text-lg" />
                        {config.label}
                    </Tag>
                </h1>
                {project.description && (
                    <p className="text-body-medium text-[var(--md-sys-color-on-surface-variant)] mt-2">{project.description}</p>
                )}
            </div>

            <div className="flex flex-wrap gap-2 items-center justify-end">
                {/* 議長/権限者用 ステータス操作 */}
                {isGicho && onStatusChange && (
                    <>
                        {project.status !== "download" && project.status !== "completed" && (
                            <Button
                                size="small"
                                icon={<Icon icon="material-symbols:check-circle-outline" />}
                                onClick={() => onStatusChange("download")}
                                className="text-[var(--md-sys-color-primary)] border-[var(--md-sys-color-outline)]"
                            >
                                完成にする
                            </Button>
                        )}
                        {project.status !== "archived" && (
                            <Button
                                size="small"
                                icon={<Icon icon="material-symbols:archive-outline" />}
                                onClick={() => onStatusChange("archived")}
                                className="text-[var(--md-sys-color-on-surface-variant)] border-[var(--md-sys-color-outline)]"
                            >
                                アーカイブ
                            </Button>
                        )}
                        {project.status === "archived" && (
                            <Button
                                size="small"
                                icon={<Icon icon="material-symbols:unarchive" />}
                                onClick={() => onStatusChange("cooking")}
                                className="text-[var(--md-sys-color-primary)] border-[var(--md-sys-color-outline)]"
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
