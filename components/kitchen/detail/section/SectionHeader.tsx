"use client";

import { CardHeader, Button, Chip, Spinner } from "@heroui/react";
import { Icon } from "@iconify/react";
import { motion } from "framer-motion";
import { Section, UserRole } from "@/types/kitchen";
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
    index, section, projectStatus, userRole,
    isEditing, isProposing, isSaving,
    onEditStart, onEditCancel, onEditSave, onDelete,
    onProposalOpen, onProposalCancel, onProposalSubmit
}: SectionHeaderProps) {
    const isGicho = useMemo(() => userRole === "gicho" || userRole === "meiyo_giin", [userRole]);
    const isProjectCompleted = projectStatus === "completed";

    return (
        <CardHeader className="flex flex-row justify-between items-center gap-2 pb-3 p-6">
            <div className="flex flex-wrap items-center gap-2">
                <Chip size="sm" className="rounded-full bg-[#ffdad5] text-[#73342b]">
                    <Icon icon="mdi:numeric" className="mr-1" />
                    セクション {index + 1}
                </Chip>
                {!(section.allowImageSubmission ?? true) && (
                    <Chip size="sm" className="rounded-full bg-[#fbe7a6] text-[#564419]">
                        <Icon icon="mdi:image-off" className="mr-1" />画像なし
                    </Chip>
                )}
                {isEditing && (
                    <Chip size="sm" className="rounded-full bg-[#ffdad5] text-[#73342b]">
                        <Icon icon="mdi:pencil" className="mr-1" />編集中
                    </Chip>
                )}
                {isProposing && (
                    <Chip size="sm" className="rounded-full bg-[#fbe7a6] text-[#564419]">
                        <Icon icon="mdi:comment-edit" className="mr-1" />推敲中
                    </Chip>
                )}
            </div>

            <div className="flex gap-2">
                {isEditing ? (
                    <>
                        <motion.div whileTap={{ scale: 0.95 }}>
                            <Button
                                size="sm" className="rounded-full bg-[#73342b] text-[#ffdad5]"
                                startContent={isSaving ? <Spinner size="sm" color="white" /> : <Icon icon="mdi:content-save" />}
                                onPress={onEditSave} isDisabled={isSaving}
                            >保存</Button>
                        </motion.div>
                        <motion.div whileTap={{ scale: 0.95 }}>
                            <Button size="sm" className="rounded-full" variant="light" onPress={onEditCancel} isDisabled={isSaving}>
                                キャンセル
                            </Button>
                        </motion.div>
                    </>
                ) : isProposing ? (
                    <>
                        <motion.div whileTap={{ scale: 0.95 }}>
                            <Button
                                size="sm" className="rounded-full bg-[#564419] text-[#fbe7a6]"
                                startContent={isSaving ? <Spinner size="sm" color="white" /> : <Icon icon="mdi:send" />}
                                onPress={onProposalSubmit} isDisabled={isSaving}
                            >提案する</Button>
                        </motion.div>
                        <motion.div whileTap={{ scale: 0.95 }}>
                            <Button size="sm" className="rounded-full" variant="light" onPress={onProposalCancel} isDisabled={isSaving}>
                                キャンセル
                            </Button>
                        </motion.div>
                    </>
                ) : (
                    <>
                        {!isProjectCompleted && (
                            <motion.div whileTap={{ scale: 0.9 }}>
                                <Button
                                    size="sm" isIconOnly className="rounded-full bg-[#ffdad5] text-[#73342b]"
                                    onPress={onEditStart} title="編集"
                                ><Icon icon="mdi:pencil" /></Button>
                            </motion.div>
                        )}
                        {!isProjectCompleted && (
                            <motion.div whileTap={{ scale: 0.9 }}>
                                <Button
                                    size="sm" isIconOnly className="rounded-full bg-[#ffdad6] text-[#93000a]"
                                    onPress={onDelete} title="削除"
                                ><Icon icon="mdi:trash-can-outline" /></Button>
                            </motion.div>
                        )}
                        {isGicho && !isProjectCompleted && (
                            <motion.div whileTap={{ scale: 0.9 }}>
                                <Button
                                    size="sm" isIconOnly className="rounded-full bg-[#fbe7a6] text-[#564419]"
                                    onPress={onProposalOpen} title="推敲提案"
                                ><Icon icon="mdi:comment-edit-outline" /></Button>
                            </motion.div>
                        )}
                    </>
                )}
            </div>
        </CardHeader>
    );
}
