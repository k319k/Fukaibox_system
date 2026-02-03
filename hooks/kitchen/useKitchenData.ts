"use client";

import { useState, useEffect } from "react";
import { Project, Section, UploadedImage, Proposal } from "@/types/kitchen";
import { getCookingImages, getAllProposalsForProject } from "@/app/actions/kitchen";
import { getUserDisplayNames } from "@/app/actions/user";

export function useKitchenData(project: Project, initialSections: Section[]) {
    const [sections, setSections] = useState<Section[]>(initialSections);
    const [selectedTab, setSelectedTab] = useState("cooking");
    const [images, setImages] = useState<UploadedImage[]>([]);
    const [proposals, setProposals] = useState<Proposal[]>([]);
    const [userNames, setUserNames] = useState<Record<string, string>>({});
    const [editorFontSize, setEditorFontSize] = useState(16);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [imgs, props] = await Promise.all([
                    getCookingImages(project.id),
                    // @ts-ignore - Action return type mismatch might occur, allow for now
                    getAllProposalsForProject(project.id)
                ]);

                setImages(imgs);
                // @ts-ignore
                setProposals(props);

                const userIds = new Set<string>();
                imgs.forEach(i => userIds.add(i.uploadedBy));
                // @ts-ignore
                props.forEach(p => userIds.add(p.proposedBy));

                if (userIds.size > 0) {
                    const names = await getUserDisplayNames(Array.from(userIds));
                    setUserNames(names);
                }
            } catch (error) {
                console.error("Failed to fetch kitchen data:", error);
            }
        };
        fetchData();
    }, [project.id]);

    return {
        sections, setSections,
        selectedTab, setSelectedTab,
        images, setImages,
        proposals, setProposals,
        userNames, setUserNames,
        editorFontSize, setEditorFontSize
    };
}
