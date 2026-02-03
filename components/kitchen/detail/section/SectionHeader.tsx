"use client";

import { Button, Tag, Spin } from "antd";
import { SaveOutlined, SendOutlined, EditOutlined, DeleteOutlined, CommentOutlined, LoadingOutlined } from "@ant-design/icons";
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
        <div className="flex flex-row justify-between items-center gap-2 pb-3 p-6">
            <div className="flex flex-wrap items-center gap-2">
                <Tag className="rounded-full bg-[#ffdad5] text-[#73342b] border-none flex items-center gap-1">
                    <Icon icon="mdi:numeric" />
                    セクション {index + 1}
                </Tag>
                {!(section.allowImageSubmission ?? true) && (
                    <Tag className="rounded-full bg-[#fbe7a6] text-[#564419] border-none flex items-center gap-1">
                        <Icon icon="mdi:image-off" />画像なし
                    </Tag>
                )}
                {isEditing && (
                    <Tag className="rounded-full bg-[#ffdad5] text-[#73342b] border-none flex items-center gap-1">
                        <Icon icon="mdi:pencil" />編集中
                    </Tag>
                )}
                {isProposing && (
                    <Tag className="rounded-full bg-[#fbe7a6] text-[#564419] border-none flex items-center gap-1">
                        <Icon icon="mdi:comment-edit" />推敲中
                    </Tag>
                )}
                {section.isGenerating && (
                    <Tag className="rounded-full bg-blue-100 text-blue-700 border-none flex items-center gap-1 animate-pulse">
                        <Icon icon="mdi:creation" className="animate-spin" />
                        画像生成中
                    </Tag>
                )}
            </div>

            <div className="flex gap-2">
                {isEditing ? (
                    <>
                        <motion.div whileTap={{ scale: 0.95 }}>
                            <Button
                                size="small"
                                shape="round"
                                className="bg-[#73342b] text-[#ffdad5] border-none"
                                icon={isSaving ? <LoadingOutlined /> : <SaveOutlined />}
                                onClick={onEditSave}
                                disabled={isSaving}
                            >保存</Button>
                        </motion.div>
                        <motion.div whileTap={{ scale: 0.95 }}>
                            <Button size="small" shape="round" type="text" onClick={onEditCancel} disabled={isSaving}>
                                キャンセル
                            </Button>
                        </motion.div>
                    </>
                ) : isProposing ? (
                    <>
                        <motion.div whileTap={{ scale: 0.95 }}>
                            <Button
                                size="small"
                                shape="round"
                                className="bg-[#564419] text-[#fbe7a6] border-none"
                                icon={isSaving ? <LoadingOutlined /> : <SendOutlined />}
                                onClick={onProposalSubmit}
                                disabled={isSaving}
                            >提案する</Button>
                        </motion.div>
                        <motion.div whileTap={{ scale: 0.95 }}>
                            <Button size="small" shape="round" type="text" onClick={onProposalCancel} disabled={isSaving}>
                                キャンセル
                            </Button>
                        </motion.div>
                    </>
                ) : (
                    <>
                        {!isProjectCompleted && (
                            <motion.div whileTap={{ scale: 0.9 }}>
                                <Button
                                    size="small"
                                    shape="circle"
                                    className="bg-[#ffdad5] text-[#73342b] border-none"
                                    icon={<EditOutlined />}
                                    onClick={onEditStart}
                                    title="編集"
                                />
                            </motion.div>
                        )}
                        {!isProjectCompleted && (
                            <motion.div whileTap={{ scale: 0.9 }}>
                                <Button
                                    size="small"
                                    shape="circle"
                                    className="bg-[#ffdad6] text-[#93000a] border-none"
                                    icon={<DeleteOutlined />}
                                    onClick={onDelete}
                                    title="削除"
                                />
                            </motion.div>
                        )}
                        {isGicho && !isProjectCompleted && (
                            <motion.div whileTap={{ scale: 0.9 }}>
                                <Button
                                    size="small"
                                    shape="circle"
                                    className="bg-[#fbe7a6] text-[#564419] border-none"
                                    icon={<CommentOutlined />}
                                    onClick={onProposalOpen}
                                    title="推敲提案"
                                />
                            </motion.div>
                        )}
                    </>
                )}
            </div>
        </div>
    );
}
