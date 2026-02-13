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
                const [imgsData, propsData] = await Promise.all([
                    getCookingImages(project.id),
                    getAllProposalsForProject(project.id)
                ]);

                // Cast to expected types as Drizzle returns generic objects
                const imgs = imgsData as unknown as UploadedImage[];
                const props = propsData as unknown as Proposal[];

                setImages(imgs);
                setProposals(props);

                const userIds = new Set<string>();
                imgs.forEach(i => userIds.add(i.uploadedBy));
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
