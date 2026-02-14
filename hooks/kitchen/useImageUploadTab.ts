import { useMemo, useState } from "react";
import { UploadedImage, Section } from "@/types/kitchen";
import { PresenceUser } from "@/hooks/kitchen/usePresence";

interface UseImageUploadTabProps {
    images: UploadedImage[];
    activeUsers?: PresenceUser[];
    currentUser?: { id: string; name: string; image: string | null } | null;
    userRole?: string;
    sections: Section[];
}

export function useImageUploadTab({
    images,
    activeUsers = [],
    currentUser,
    userRole = "guest",
    sections,
}: UseImageUploadTabProps) {
    const [isScriptViewerOpen, setIsScriptViewerOpen] = useState(false);

    // 自分の現在のステータスを取得（activeUsersから探す）
    const myStatus = useMemo(() => {
        if (!currentUser) return "not_participating";
        const me = activeUsers.find((u) => u.userId === currentUser.id);
        return me?.status || "not_participating";
    }, [activeUsers, currentUser]);

    // 自分が画像をアップロードした枚数
    const myUploadCount = useMemo(() => {
        if (!currentUser) return 0;
        return images.filter((img) => img.uploadedBy === currentUser.id).length;
    }, [images, currentUser]);

    const isGicho = userRole === "gicho";

    const hasAllowedSections = useMemo(() => {
        return sections.length > 0 && sections.some(s => s.allowImageSubmission ?? true);
    }, [sections]);

    const filteredSections = useMemo(() => {
        return sections.filter(s => s.allowImageSubmission ?? true);
    }, [sections]);

    return {
        isScriptViewerOpen,
        setIsScriptViewerOpen,
        myStatus,
        myUploadCount,
        isGicho,
        hasAllowedSections,
        filteredSections
    };
}
