"use client";

import { useKitchenData } from "./useKitchenData";
import { useSections } from "./useSections";
import { useImages } from "./useImages";
import { useProposals } from "./useProposals";
import { useDownloads } from "./useDownloads";
import { Project, Section, UserRole } from "@/types/kitchen";
import { useMemo } from "react";

export function useKitchenDetail(
    project: Project,
    initialSections: Section[],
    userRole: UserRole
) {
    const {
        sections, setSections,
        selectedTab, setSelectedTab,
        images, setImages,
        proposals, setProposals,
        userNames,
        editorFontSize, setEditorFontSize
    } = useKitchenData(project, initialSections);

    const isGicho = useMemo(() => {
        return userRole === "gicho" || userRole === "meiyo_giin";
    }, [userRole]);

    const { isSaving: isSectionSaving, ...restSectionOps } = useSections(project.id, sections, setSections);
    const imageOps = useImages(project.id, images, setImages);
    const { isSaving: isProposalSaving, ...restProposalOps } = useProposals(project.id, setProposals);
    const downloadOps = useDownloads(project.id, project.title);

    return {
        // Data
        project,
        sections,
        images,
        proposals,
        userNames,
        selectedTab,
        editorFontSize,
        isGicho,

        // UI Setters
        setSelectedTab,
        setEditorFontSize,

        // Operations
        ...restSectionOps,
        isSectionSaving,
        ...imageOps,
        ...restProposalOps,
        isProposalSaving,
        ...downloadOps,

        // Expose setSections for optimistic updates if needed, though ops handle it
        setSections
    };
}
