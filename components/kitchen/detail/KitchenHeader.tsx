"use client";

import { Button, Tag } from "antd";
import { ArrowLeftOutlined, DeleteOutlined, FontSizeOutlined } from "@ant-design/icons";
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
}

export default function KitchenHeader({
    project,
    isGicho,
    showFontSizeControl,
    editorFontSize,
    onEditorFontSizeChange,
    onDeleteProject
}: KitchenHeaderProps) {
    const router = useRouter();

    const statusConfig: Record<string, { label: string; color: string; bgColor: string; icon: string }> = {
        "draft": { label: "調理中", color: "#73342b", bgColor: "#ffdad5", icon: "mdi:pot-mix" },
        "cooking": { label: "調理中", color: "#73342b", bgColor: "#ffdad5", icon: "mdi:pot-mix" },
        "image_collection": { label: "画像収集中", color: "#564419", bgColor: "#fbe7a6", icon: "mdi:image-plus" },
        "image_selection": { label: "画像採用中", color: "#73342b", bgColor: "#ffdad5", icon: "mdi:check-decagram" },
        "completed": { label: "完成", color: "#10200a", bgColor: "#d7f0cb", icon: "mdi:check-circle" },
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
                    className="mb-2"
                >
                    一覧に戻る
                </Button>
                <h1 className="text-2xl font-bold flex items-center gap-2">
                    {project.title}
                    <Tag
                        className="rounded-full border-none flex items-center gap-1"
                        style={{ backgroundColor: config.bgColor, color: config.color }}
                    >
                        <Icon icon={config.icon} className="text-sm" />
                        {config.label}
                    </Tag>
                </h1>
                {project.description && (
                    <p className="text-[var(--md-sys-color-on-surface-variant)] mt-2 text-sm">{project.description}</p>
                )}
            </div>

            <div className="flex gap-2 items-center">
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
                        プロジェクト削除
                    </Button>
                )}
            </div>
        </div>
    );
}
