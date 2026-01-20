"use client";

import { Button, Chip } from "@heroui/react";
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

    return (
        <div className="mb-6 flex flex-col md:flex-row items-start justify-between gap-4">
            <div>
                <Button
                    size="sm"
                    variant="light"
                    startContent={<Icon icon="mdi:arrow-left" />}
                    onPress={() => router.push('/kitchen')}
                    className="mb-2"
                >
                    一覧に戻る
                </Button>
                <h1 className="text-2xl font-bold flex items-center gap-2">
                    {project.title}
                    {(() => {
                        const statusConfig: Record<string, { label: string; color: "primary" | "secondary" | "success" | "warning"; icon: string }> = {
                            "draft": { label: "調理中", color: "primary", icon: "mdi:pot-mix" },
                            "cooking": { label: "調理中", color: "primary", icon: "mdi:pot-mix" },
                            "image_collection": { label: "画像収集中", color: "warning", icon: "mdi:image-plus" },
                            "image_selection": { label: "画像採用中", color: "secondary", icon: "mdi:check-decagram" },
                            "completed": { label: "完成", color: "success", icon: "mdi:check-circle" },
                        };
                        const config = statusConfig[project.status] || statusConfig["draft"];
                        return (
                            <Chip size="sm" color={config.color} variant="flat" startContent={<Icon icon={config.icon} className="text-sm" />}>
                                {config.label}
                            </Chip>
                        );
                    })()}
                </h1>
                {project.description && (
                    <p className="text-foreground-muted mt-2 text-sm">{project.description}</p>
                )}
            </div>

            <div className="flex gap-2 items-center">
                {/* 文字サイズ変更 (調理タブのみ) */}
                {showFontSizeControl && (
                    <div className="flex items-center gap-1 bg-default-100 rounded-lg p-1">
                        <Button
                            isIconOnly size="sm" variant="light"
                            onPress={() => onEditorFontSizeChange(Math.max(12, editorFontSize - 2))}
                        >
                            <Icon icon="mdi:format-font-size-decrease" />
                        </Button>
                        <span className="text-xs w-8 text-center">{editorFontSize}px</span>
                        <Button
                            isIconOnly size="sm" variant="light"
                            onPress={() => onEditorFontSizeChange(Math.min(32, editorFontSize + 2))}
                        >
                            <Icon icon="mdi:format-font-size-increase" />
                        </Button>
                    </div>
                )}

                {/* プロジェクト削除 (儀長のみ) */}
                {isGicho && (
                    <Button
                        color="danger" variant="ghost" size="sm"
                        startContent={<Icon icon="mdi:trash-can" />}
                        onPress={onDeleteProject}
                    >
                        プロジェクト削除
                    </Button>
                )}
            </div>
        </div>
    );
}
