"use client";

import { createContext, useContext, ReactNode } from "react";
import { Section } from "@/types/kitchen";

/** Shared edit/proposal state consumed by SectionCard and its children. */
export interface SectionEditState {
    // Edit
    editingSection: Section | null;
    editContent: string;
    editImageInstruction: string;
    editReferenceImageUrl: string;
    editReferenceImageUrls: string[];
    editAllowSubmission: boolean;
    isSaving: boolean;

    onEditStart: (section: Section) => void;
    onEditCancel: () => void;
    onEditSave: () => void;
    onEditContentChange: (val: string) => void;
    onEditImageInstructionChange: (val: string) => void;
    onEditReferenceImageUrlChange: (val: string) => void;
    onEditReferenceImageUrlsChange: (val: string[]) => void;
    onEditAllowSubmissionChange: (val: boolean) => void;

    // Proposal
    proposalSection: Section | null;
    proposalContent: string;

    onProposalOpen: (section: Section) => void;
    onProposalCancel: () => void;
    onProposalSubmit: () => void;
    onProposalContentChange: (val: string) => void;

    // Utility
    onUploadReferenceImage: (file: File) => Promise<string | null>;
}

const SectionEditContext = createContext<SectionEditState | null>(null);

export function SectionEditProvider({ value, children }: { value: SectionEditState; children: ReactNode }) {
    return <SectionEditContext.Provider value={value}>{children}</SectionEditContext.Provider>;
}

export function useSectionEdit(): SectionEditState {
    const ctx = useContext(SectionEditContext);
    if (!ctx) throw new Error("useSectionEdit must be used within SectionEditProvider");
    return ctx;
}
