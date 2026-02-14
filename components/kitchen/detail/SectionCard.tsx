"use client";

import { Card, Divider, Button } from "antd";
import { Icon } from "@iconify/react";
import { motion } from "framer-motion";
import { Section, UserRole } from "@/types/kitchen";
import SectionHeader from "./section/SectionHeader";
import NormalView from "./section/NormalView";
import EditForm from "./section/EditForm";
import ProposalForm from "./section/ProposalForm";
import { useSectionEdit } from "./SectionEditContext";

interface SectionCardProps {
    section: Section;
    index: number;
    projectStatus: string;
    userRole: UserRole;
    fontSize: number;
    onDelete: (id: string) => void;
}

export default function SectionCard({
    section, index, projectStatus, userRole, fontSize, onDelete
}: SectionCardProps) {
    const ctx = useSectionEdit();

    const isGicho = userRole === 'gicho';
    const isEditing = ctx.editingSection?.id === section.id;
    const isProposing = ctx.proposalSection?.id === section.id;

    // 推敲提案中はWarning Container色で包む
    const cardBg = isProposing ? "bg-[var(--color-kitchen-proposal-bg)]" : "bg-[var(--md-sys-color-surface-container-lowest)]";

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.2, delay: index * 0.05 }}
        >
            <Card className={`${cardBg} border-none shadow-none hover-glow transition-all duration-200 rounded-[var(--radius-lg)]`} styles={{ body: { padding: 0 } }}>
                <SectionHeader
                    index={index} section={section} projectStatus={projectStatus} userRole={userRole}
                    isEditing={isEditing} isProposing={isProposing} isSaving={ctx.isSaving}
                    onEditStart={() => ctx.onEditStart(section)} onEditCancel={ctx.onEditCancel} onEditSave={ctx.onEditSave}
                    onDelete={() => onDelete(section.id)}
                    onProposalOpen={() => ctx.onProposalOpen(section)} onProposalCancel={ctx.onProposalCancel} onProposalSubmit={ctx.onProposalSubmit}
                />
                {/* Delete Button (Gicho Only) - Fixed Position within relative header */}
                {isGicho && (
                    <div className="absolute right-0 top-1/2 -translate-y-1/2">
                        <Button
                            danger
                            type="text"
                            shape="circle"
                            icon={<Icon icon="mdi:trash-can-outline" className="text-xl" />}
                            onClick={() => onDelete(section.id)}
                            className="opacity-0 group-hover:opacity-100 transition-opacity"
                        />
                    </div>
                )}
                <Divider className="my-0 bg-[var(--md-sys-color-outline-variant)]/30" />
                <div className="pt-4 p-6">
                    {isEditing ? (
                        <EditForm
                            content={ctx.editContent} imageInstruction={ctx.editImageInstruction}
                            referenceImageUrl={ctx.editReferenceImageUrl} referenceImageUrls={ctx.editReferenceImageUrls} allowImageSubmission={ctx.editAllowSubmission} fontSize={fontSize}
                            onContentChange={ctx.onEditContentChange} onImageInstructionChange={ctx.onEditImageInstructionChange}
                            onReferenceImageUrlChange={ctx.onEditReferenceImageUrlChange} onReferenceImageUrlsChange={ctx.onEditReferenceImageUrlsChange} onAllowSubmissionChange={ctx.onEditAllowSubmissionChange}
                            onUploadReferenceImage={ctx.onUploadReferenceImage}
                        />
                    ) : isProposing ? (
                        <ProposalForm content={ctx.proposalContent} fontSize={fontSize} onContentChange={ctx.onProposalContentChange} />
                    ) : (
                        <NormalView section={section} fontSize={fontSize} />
                    )}
                </div>
            </Card>
        </motion.div>
    );
}
