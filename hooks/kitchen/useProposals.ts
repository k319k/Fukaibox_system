"use client";

import { useState } from "react";
import { Section, Proposal } from "@/types/kitchen";
import { createCookingProposal, getAllProposalsForProject } from "@/app/actions/kitchen";

export function useProposals(
    projectId: string,
    setProposals: React.Dispatch<React.SetStateAction<Proposal[]>>
) {
    const [proposalSection, setProposalSection] = useState<Section | null>(null);
    const [proposalContent, setProposalContent] = useState("");
    const [isSaving, setIsSaving] = useState(false);

    const handleProposalOpen = (section: Section) => {
        setProposalSection(section);
        setProposalContent(section.content || "");
    };

    const handleProposalCancel = () => {
        setProposalSection(null);
        setProposalContent("");
    };

    const handleProposalSubmit = async () => {
        if (!proposalSection) return;
        setIsSaving(true);
        try {
            await createCookingProposal(projectId, proposalSection.id, proposalContent);
            const newProposals = await getAllProposalsForProject(projectId);
            setProposals(newProposals);
            alert("提案を作成しました。");
            setProposalSection(null);
        } catch (error) {
            console.error("Failed to create proposal:", error);
            alert("提案の作成に失敗しました。");
        } finally {
            setIsSaving(false);
        }
    };

    return {
        proposalSection,
        proposalContent, setProposalContent,
        isSaving,
        handleProposalOpen,
        handleProposalCancel,
        handleProposalSubmit
    };
}
