"use client";

import { Card, CardBody, Divider } from "@heroui/react";
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

    // States
    isEditing: boolean;
    isProposing: boolean;
    isSaving: boolean;

    editContent: string;
    editImageInstruction: string;
    editReferenceImageUrl: string;
    editAllowSubmission: boolean;

    proposalContent: string;

    // Actions
    onEditStart: (section: Section) => void;
    onEditCancel: () => void;
    onEditSave: () => void;
    onDelete: (id: string) => void;

    onProposalOpen: (section: Section) => void;
    onProposalCancel: () => void;
    onProposalSubmit: () => void;

    // State Setters
    onEditContentChange: (val: string) => void;
    onEditImageInstructionChange: (val: string) => void;
    onEditReferenceImageUrlChange: (val: string) => void;
    onEditAllowSubmissionChange: (val: boolean) => void;
    onProposalContentChange: (val: string) => void;
}

export default function SectionCard({
    section,
    index,
    projectStatus,
    userRole,
    fontSize,
    isEditing,
    isProposing,
    isSaving,
    editContent,
    editImageInstruction,
    editReferenceImageUrl,
    editAllowSubmission,
    proposalContent,
    onEditStart,
    onEditCancel,
    onEditSave,
    onDelete,
    onProposalOpen,
    onProposalCancel,
    onProposalSubmit,
    onEditContentChange,
    onEditImageInstructionChange,
    onEditReferenceImageUrlChange,
    onEditAllowSubmissionChange,
    onProposalContentChange
}: SectionCardProps) {

    return (
        <Card className="card-elevated" radius="lg">
            <SectionHeader
                index={index}
                section={section}
                projectStatus={projectStatus}
                userRole={userRole}
                isEditing={isEditing}
                isProposing={isProposing}
                isSaving={isSaving}
                onEditStart={() => onEditStart(section)}
                onEditCancel={onEditCancel}
                onEditSave={onEditSave}
                onDelete={() => onDelete(section.id)}
                onProposalOpen={() => onProposalOpen(section)}
                onProposalCancel={onProposalCancel}
                onProposalSubmit={onProposalSubmit}
            />

            <Divider />

            <CardBody className="pt-4">
                {isEditing ? (
                    <EditForm
                        content={editContent}
                        imageInstruction={editImageInstruction}
                        referenceImageUrl={editReferenceImageUrl}
                        allowImageSubmission={editAllowSubmission}
                        fontSize={fontSize}
                        onContentChange={onEditContentChange}
                        onImageInstructionChange={onEditImageInstructionChange}
                        onReferenceImageUrlChange={onEditReferenceImageUrlChange}
                        onAllowSubmissionChange={onEditAllowSubmissionChange}
                    />
                ) : isProposing ? (
                    <ProposalForm
                        content={proposalContent}
                        fontSize={fontSize}
                        onContentChange={onProposalContentChange}
                    />
                ) : (
                    <NormalView section={section} fontSize={fontSize} />
                )}
            </CardBody>
        </Card>
    );
}
