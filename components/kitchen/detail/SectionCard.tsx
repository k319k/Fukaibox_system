"use client";

import { Card, Divider, Button } from "antd";
import { Icon } from "@iconify/react";
import { motion } from "framer-motion";
import { Section, UserRole } from "@/types/kitchen";
import SectionHeader from "./section/SectionHeader";
import NormalView from "./section/NormalView";
import EditForm from "./section/EditForm";
import ProposalForm from "./section/ProposalForm";

interface SectionCardProps {
    section: Section;
    index: number;
    projectStatus: string;
    userRole: UserRole;
    fontSize: number;
    isEditing: boolean;
    isProposing: boolean;
    isSaving: boolean;
    editContent: string;
    editImageInstruction: string;
    editReferenceImageUrl: string;
    editAllowSubmission: boolean;
    proposalContent: string;
    onEditStart: (section: Section) => void;
    onEditCancel: () => void;
    onEditSave: () => void;
    onDelete: (id: string) => void;
    onProposalOpen: (section: Section) => void;
    onProposalCancel: () => void;
    onProposalSubmit: () => void;
    onEditContentChange: (val: string) => void;
    onEditImageInstructionChange: (val: string) => void;
    onEditReferenceImageUrlChange: (val: string) => void;
    onEditAllowSubmissionChange: (val: boolean) => void;
    onProposalContentChange: (val: string) => void;
    onUploadReferenceImage: (file: File) => Promise<string | null>;
}

export default function SectionCard({
    section, index, projectStatus, userRole, fontSize,
    isEditing, isProposing, isSaving,
    editContent, editImageInstruction, editReferenceImageUrl, editAllowSubmission, proposalContent,
    onEditStart, onEditCancel, onEditSave, onDelete,
    onProposalOpen, onProposalCancel, onProposalSubmit,
    onEditContentChange, onEditImageInstructionChange, onEditReferenceImageUrlChange, onEditAllowSubmissionChange,
    onProposalContentChange, onUploadReferenceImage
}: SectionCardProps) {
    const isGicho = userRole === 'gicho';
    // 推敲提案中はWarning Container色で包む
    const cardBg = isProposing ? "bg-[#fbe7a6]" : "bg-[var(--md-sys-color-surface-container-lowest)]";

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.2, delay: index * 0.05 }}
        >
            <Card className={`${cardBg} border-none shadow-none hover-glow transition-all duration-200 rounded-[var(--radius-lg)]`} styles={{ body: { padding: 0 } }}>
                <SectionHeader
                    index={index} section={section} projectStatus={projectStatus} userRole={userRole}
                    isEditing={isEditing} isProposing={isProposing} isSaving={isSaving}
                    onEditStart={() => onEditStart(section)} onEditCancel={onEditCancel} onEditSave={onEditSave}
                    onDelete={() => onDelete(section.id)}
                    onProposalOpen={() => onProposalOpen(section)} onProposalCancel={onProposalCancel} onProposalSubmit={onProposalSubmit}
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
                            content={editContent} imageInstruction={editImageInstruction}
                            referenceImageUrl={editReferenceImageUrl} allowImageSubmission={editAllowSubmission} fontSize={fontSize}
                            onContentChange={onEditContentChange} onImageInstructionChange={onEditImageInstructionChange}
                            onReferenceImageUrlChange={onEditReferenceImageUrlChange} onAllowSubmissionChange={onEditAllowSubmissionChange}
                            onUploadReferenceImage={onUploadReferenceImage}
                        />
                    ) : isProposing ? (
                        <ProposalForm content={proposalContent} fontSize={fontSize} onContentChange={onProposalContentChange} />
                    ) : (
                        <NormalView section={section} fontSize={fontSize} />
                    )}
                </div>
            </Card>
        </motion.div>
    );
}
