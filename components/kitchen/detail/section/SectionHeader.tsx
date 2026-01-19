"use client";

import { CardHeader, Button, Chip, Spinner } from "@heroui/react";
import { Icon } from "@iconify/react";
import { Section, UserRole, Project } from "@/types/kitchen";
import { useMemo } from "react";

interface SectionHeaderProps {
    index: number;
    section: Section;
    projectStatus: string;
    userRole: UserRole;

    isEditing: boolean;
    isProposing: boolean;
    isSaving: boolean;

    onEditStart: () => void;
    onEditCancel: () => void;
    onEditSave: () => void;
    onDelete: () => void;

    onProposalOpen: () => void;
    onProposalCancel: () => void;
    onProposalSubmit: () => void;
}

export default function SectionHeader({
    index,
    section,
    projectStatus,
    userRole,
    isEditing,
    isProposing,
    isSaving,
    onEditStart,
    onEditCancel,
    onEditSave,
    onDelete,
    onProposalOpen,
    onProposalCancel,
    onProposalSubmit
}: SectionHeaderProps) {

    const isGicho = useMemo(() => {
        return userRole === "gicho" || userRole === "meiyo_giin";
    }, [userRole]);

    const isProjectCompleted = projectStatus === "completed";

    return (
        <CardHeader className="flex flex-row justify-between items-center gap-2 pb-3">
            <div className="flex flex-wrap items-center gap-2">
                <Chip size="sm" color="primary" variant="flat">
                    <Icon icon="mdi:numeric" className="mr-1" />
                    セクション {index + 1}
                </Chip>
                {!(section.allowImageSubmission ?? true) && (
                    <Chip size="sm" color="warning" variant="flat">
                        <Icon icon="mdi:image-off" className="mr-1" />
                        画像なし
                    </Chip>
                )}
                {isEditing && (
                    <Chip size="sm" color="secondary" variant="flat">
                        <Icon icon="mdi:pencil" className="mr-1" />
                        編集中
                    </Chip>
                )}
            </div>

            <div className="flex gap-2">
                {isEditing ? (
                    <>
                        <Button
                            size="sm" color="primary" variant="solid"
                            startContent={isSaving ? <Spinner size="sm" color="white" /> : <Icon icon="mdi:content-save" />}
                            onPress={onEditSave}
                            isDisabled={isSaving}
                        >
                            保存
                        </Button>
                        <Button
                            size="sm" color="danger" variant="light"
                            onPress={onEditCancel}
                            isDisabled={isSaving}
                        >
                            キャンセル
                        </Button>
                    </>
                ) : isProposing ? (
                    <>
                        <Button
                            size="sm" color="secondary" variant="solid"
                            startContent={isSaving ? <Spinner size="sm" color="white" /> : <Icon icon="mdi:send" />}
                            onPress={onProposalSubmit}
                            isDisabled={isSaving}
                        >
                            提案する
                        </Button>
                        <Button
                            size="sm" color="danger" variant="light"
                            onPress={onProposalCancel}
                            isDisabled={isSaving}
                        >
                            キャンセル
                        </Button>
                    </>
                ) : (
                    <>
                        {/* 編集ボタン: プロジェクト完了でない場合のみ */}
                        {!isProjectCompleted && (
                            <Button
                                size="sm" color="primary" variant="ghost" isIconOnly
                                onPress={onEditStart}
                                title="編集"
                            >
                                <Icon icon="mdi:pencil" />
                            </Button>
                        )}

                        {/* 削除ボタン: プロジェクト完了でない場合のみ */}
                        {!isProjectCompleted && (
                            <Button
                                size="sm" color="danger" variant="light" isIconOnly
                                onPress={onDelete}
                                title="削除"
                            >
                                <Icon icon="mdi:trash-can-outline" />
                            </Button>
                        )}

                        {/* 推敲ボタン: 儀長のみ、プロジェクト完了でない場合 */}
                        {isGicho && !isProjectCompleted && (
                            <Button
                                size="sm" color="secondary" variant="ghost" isIconOnly
                                onPress={onProposalOpen}
                                title="推敲提案"
                            >
                                <Icon icon="mdi:comment-edit-outline" />
                            </Button>
                        )}
                    </>
                )}
            </div>
        </CardHeader>
    );
}
