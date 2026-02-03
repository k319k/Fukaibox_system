import { useState, useMemo } from "react";
import { Button } from "antd";
import { Icon } from "@iconify/react";
import { Section, UploadedImage } from "@/types/kitchen";
import { PresenceUser, PresenceStatus } from "@/hooks/kitchen/usePresence";
import ScriptViewerModal from "./ScriptViewerModal";
import ActiveUsersList from "./ActiveUsersList";
import SectionUploadCard from "./SectionUploadCard";
import StatusSelectionFooter from "./StatusSelectionFooter";

interface ImageUploadTabProps {
    sections: Section[];
    images: UploadedImage[];
    editorFontSize: number;
    uploadingSectionId: string | null;
    uploadProgress: number;
    uploaderNames: Record<string, string>;
    projectTitle: string;
    projectId: string;
    activeUsers?: PresenceUser[];
    currentUser?: { id: string; name: string; image: string | null } | null;
    onStatusUpdate?: (status: PresenceStatus) => Promise<void>;
    onTabChange?: (key: string) => void;
    onAddSection: (index: number) => void;
    onDeleteSection: (id: string) => void;
    onImageUpload: (sectionId: string, files: File[]) => void;
    onDeleteImage: (imageId: string) => void;
    onOpenLightbox: (images: UploadedImage[], index: number) => void;
    userRole?: string;
}

export default function ImageUploadTab({
    sections, images, editorFontSize, uploadingSectionId, uploadProgress, uploaderNames, projectTitle,
    projectId: _projectId, activeUsers = [], currentUser, onStatusUpdate, onTabChange,
    onAddSection, onDeleteSection, onImageUpload, onDeleteImage, onOpenLightbox,
    userRole = "guest"
}: ImageUploadTabProps) {
    const [isScriptViewerOpen, setIsScriptViewerOpen] = useState(false);

    const myStatus = useMemo(() => {
        if (!currentUser) return "not_participating";
        const me = activeUsers.find(u => u.userId === currentUser.id);
        return me?.status || "not_participating";
    }, [activeUsers, currentUser]);

    const myUploadCount = useMemo(() => {
        if (!currentUser) return 0;
        return images.filter(img => img.uploadedBy === currentUser.id).length;
    }, [images, currentUser]);

    const isGicho = userRole === 'gicho';

    if (sections.length === 0 || !sections.some(s => s.allowImageSubmission ?? true)) {
        return (
            <div className="flex flex-col items-center justify-center py-12 bg-[var(--md-sys-color-surface-container)] rounded-lg">
                <Icon icon="material-symbols:no-photography" className="text-6xl text-[var(--md-sys-color-on-surface-variant)] mb-4" />
                <p className="text-body-large text-[var(--md-sys-color-on-surface-variant)]">
                    {sections.length === 0
                        ? "まずは調理タブで台本を入力してください"
                        : "画像提出が許可されているセクションがありません"}
                </p>
            </div>
        );
    }

    return (
        <>
            <ScriptViewerModal isOpen={isScriptViewerOpen} onClose={() => setIsScriptViewerOpen(false)} sections={sections} projectTitle={projectTitle} />

            <div className="space-y-8 pb-32">
                <div className="flex flex-col md:flex-row justify-between items-center gap-4 px-2">
                    <ActiveUsersList activeUsers={activeUsers} images={images} uploaderNames={uploaderNames} />

                    <div className="flex gap-2 shrink-0">
                        {onTabChange && (
                            <Button
                                icon={<Icon icon="material-symbols:edit-note" className="text-lg" />}
                                onClick={() => onTabChange("cooking")}
                                className="text-[var(--md-sys-color-primary)]"
                            >
                                調理（編集）に戻る
                            </Button>
                        )}
                        <Button
                            icon={<Icon icon="material-symbols:description-outline" className="text-lg" />}
                            onClick={() => setIsScriptViewerOpen(true)}
                            className="text-[var(--md-sys-color-primary)]"
                        >
                            原稿を見る
                        </Button>
                    </div>
                </div>

                {sections.filter(s => s.allowImageSubmission ?? true).map((section) => {
                    const sectionImages = images.filter(img => img.sectionId === section.id);
                    const originalIndex = sections.findIndex(s => s.id === section.id);
                    const isUploading = uploadingSectionId === section.id;

                    return (
                        <SectionUploadCard
                            key={section.id}
                            section={section}
                            sectionImages={sectionImages}
                            originalIndex={originalIndex}
                            totalSections={sections.length}
                            editorFontSize={editorFontSize}
                            isUploading={isUploading}
                            uploadProgress={uploadProgress}
                            uploaderNames={uploaderNames}
                            isGicho={isGicho}
                            userRole={userRole}
                            onAddSection={onAddSection}
                            onDeleteSection={onDeleteSection}
                            onImageUpload={onImageUpload}
                            onDeleteImage={onDeleteImage}
                            onOpenLightbox={onOpenLightbox}
                        />
                    );
                })}
            </div>

            {currentUser && onStatusUpdate && (
                <StatusSelectionFooter
                    myStatus={myStatus as PresenceStatus}
                    myUploadCount={myUploadCount}
                    onStatusUpdate={onStatusUpdate}
                />
            )}
        </>
    );
}
