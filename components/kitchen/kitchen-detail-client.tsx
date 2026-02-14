"use client";

import { Card, Tabs, Button } from "antd";
import { Icon } from "@iconify/react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { KitchenDetailClientProps, CookingStatus } from "@/types/kitchen";
import { useKitchenDetail } from "@/hooks/kitchen/useKitchenDetail";
import { deleteCookingProject, updateCookingProjectStatus } from "@/app/actions/kitchen/projects";
import { usePresence } from "@/hooks/kitchen/usePresence";
import KitchenHeader from "./detail/KitchenHeader";
import SectionList from "./detail/SectionList";
import ImageUploadTab from "./detail/ImageUploadTab";
import ImageAdoptionTab from "./detail/ImageAdoptionTab";
import DownloadTab from "./detail/DownloadTab";
import Lightbox from "./detail/Lightbox";
import KitchenWorkflowStepper from "./detail/KitchenWorkflowStepper";
import { useEffect, useMemo, useState } from "react";
import UploadModal from "@/components/youtube/upload-modal";

export default function KitchenDetailClient({
    project,
    initialSections,
    userRole = "guest",
    currentUser
}: KitchenDetailClientProps) {
    const router = useRouter();
    const store = useKitchenDetail(project, initialSections, userRole);
    const { activeUsers, updateStatus } = usePresence(project.id);
    const isGicho = store.isGicho;
    const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);

    const handleDeleteProject = async () => {
        if (!confirm("プロジェクトを削除しますか？\nこの操作は取り消せません。")) return;
        try {
            await deleteCookingProject(project.id);
            router.push('/cooking');
        } catch (error) {
            console.error("Failed to delete project:", error);
            alert("プロジェクトの削除に失敗しました。");
        }
    };

    const handleStatusChange = async (status: CookingStatus) => {
        try {
            await updateCookingProjectStatus(project.id, status);
            router.refresh();
        } catch (error) {
            console.error("Failed to update status:", error);
            alert("ステータスの更新に失敗しました。");
        }
    };

    // Compute which tabs should be visible based on status and role
    const visibleTabKeys = useMemo(() => {
        const status = project.status;
        const keys: string[] = [];

        if (status === "cooking" || isGicho) keys.push("cooking");

        const canViewImageUpload = status === "image_upload" || status === "image_selection" || status === "download" || status === "archived";
        if (canViewImageUpload || isGicho) keys.push("images");

        const canViewSelection = status === "image_selection" || status === "download" || status === "archived";
        if (canViewSelection || isGicho) keys.push("selection");

        const canViewDownload = status === "download" || status === "archived";
        if (canViewDownload || isGicho) keys.push("download");

        return keys;
    }, [project.status, isGicho]);

    // Build tab items — content is rendered lazily by Ant Design Tabs
    const tabItems = visibleTabKeys.map((key) => {
        switch (key) {
            case "cooking":
                return {
                    key,
                    label: <div className="flex items-center gap-2"><Icon icon="mdi:pot-mix" className="text-lg" /><span className="hidden md:inline">調理</span></div>,
                    children: (
                        <div className="p-4 md:p-6 bg-[var(--md-sys-color-surface-container-low)] min-h-[500px]">
                            <SectionList
                                project={project} sections={store.sections} userRole={userRole} editorFontSize={store.editorFontSize}
                                fullScript={store.fullScript} onFullScriptChange={store.setFullScript}
                                isCreatingSections={store.isCreatingSections} onCreateSections={store.handleCreateSections}
                                onAddSection={store.handleAddSection} onDeleteSection={store.handleDeleteSection}
                                editingSection={store.editingSection} editContent={store.editContent}
                                editImageInstruction={store.editImageInstruction} editReferenceImageUrl={store.editReferenceImageUrl}
                                editReferenceImageUrls={store.editReferenceImageUrls}
                                editAllowSubmission={store.editAllowSubmission} isSaving={store.isSectionSaving || store.isProposalSaving}
                                onEditStart={store.handleEditStart} onEditCancel={store.handleEditCancel} onEditSave={store.handleEditSave}
                                onEditContentChange={store.setEditContent} onEditImageInstructionChange={store.setEditImageInstruction}
                                onEditReferenceImageUrlChange={store.setEditReferenceImageUrl} onEditReferenceImageUrlsChange={store.setEditReferenceImageUrls} onEditAllowSubmissionChange={store.setEditAllowSubmission}
                                proposalSection={store.proposalSection} proposalContent={store.proposalContent}
                                onProposalOpen={store.handleProposalOpen} onProposalCancel={store.handleProposalCancel}
                                onProposalSubmit={store.handleProposalSubmit} onProposalContentChange={store.setProposalContent}
                                onUploadReferenceImage={store.uploadReferenceImage}
                            />
                        </div>
                    ),
                };
            case "images":
                return {
                    key,
                    label: <div className="flex items-center gap-2"><Icon icon="mdi:image-plus" className="text-lg" /><span className="hidden md:inline">画像UP</span></div>,
                    children: (
                        <ImageUploadTab
                            sections={store.sections} images={store.images} editorFontSize={store.editorFontSize}
                            uploadingSectionId={store.uploadingSectionId} uploadProgress={store.uploadProgress} uploaderNames={store.userNames}
                            projectTitle={project.title} projectId={project.id} activeUsers={activeUsers}
                            currentUser={currentUser}
                            onStatusUpdate={updateStatus}
                            onTabChange={store.setSelectedTab}
                            onAddSection={store.handleAddSection} onDeleteSection={store.handleDeleteSection}
                            onImageUpload={store.handleImageUpload} onDeleteImage={store.handleDeleteImage} onOpenLightbox={store.openLightbox}
                            userRole={userRole}
                        />
                    ),
                };
            case "selection":
                return {
                    key,
                    label: <div className="flex items-center gap-2"><Icon icon="mdi:check-decagram" className="text-lg" /><span className="hidden md:inline">画像採用</span></div>,
                    children: (
                        <ImageAdoptionTab sections={store.sections} images={store.images} uploaderNames={store.userNames}
                            onImageSelection={store.handleImageSelection} onOpenLightbox={store.openLightbox}
                            isReadOnly={!isGicho}
                            userRole={userRole}
                        />
                    ),
                };
            case "download":
                return {
                    key,
                    label: <div className="flex items-center gap-2"><Icon icon="mdi:download" className="text-lg" /><span className="hidden md:inline">DL</span></div>,
                    children: (
                        <DownloadTab isDownloading={store.downloading}
                            onDownloadScript={store.handleDownloadScript}
                            onDownloadScriptBodyOnly={store.handleDownloadScriptBodyOnly}
                            onDownloadImages={store.handleDownloadImages}
                            onDownloadProject={store.handleDownloadProject}
                            onUploadToYouTube={() => setIsUploadModalOpen(true)}
                        />
                    ),
                };
            default:
                return null;
        }
    }).filter((item): item is NonNullable<typeof item> => item !== null);

    // Force tab selection based on status (for non-Gicho) or if current tab is invalid
    useEffect(() => {
        const status = project.status;
        if (isGicho) return; // Gicho can choose freely

        let targetTab = "cooking";
        if (status === "image_upload") targetTab = "images";
        else if (status === "image_selection") targetTab = "selection";
        else if (status === "download" || status === "archived") targetTab = "download";

        if (store.selectedTab !== targetTab) {
            // シンプルに、ステータスに対応するメインタブに強制遷移させるのが一番わかりやすい
            store.setSelectedTab(targetTab);
        }
    }, [project.status, isGicho, store]);


    return (
        <motion.div
            className="container mx-auto py-8 px-4 max-w-full"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
        >
            <KitchenWorkflowStepper
                currentStatus={project.status}
                canNavigate={isGicho}
                onStepClick={handleStatusChange}
            />

            <KitchenHeader
                project={project}
                isGicho={isGicho}
                activeUsers={activeUsers}
                showFontSizeControl={store.selectedTab === "cooking"}
                editorFontSize={store.editorFontSize}
                onEditorFontSizeChange={store.setEditorFontSize}
                onDeleteProject={handleDeleteProject}
                onStatusChange={handleStatusChange}
            // Gicho用のアクションボタンをHeaderに追加、またはStepper下に配置
            />

            {/* Gicho Action Buttons for Phase Transition */}
            {isGicho && (
                <div className="flex justify-end mb-4 gap-2">
                    {project.status === "cooking" && (
                        <Button type="primary" onClick={() => handleStatusChange("image_upload")}>
                            画像募集開始 <Icon icon="mdi:arrow-right" />
                        </Button>
                    )}
                    {project.status === "image_upload" && (
                        <Button type="primary" onClick={() => handleStatusChange("image_selection")}>
                            募集終了・選定へ <Icon icon="mdi:arrow-right" />
                        </Button>
                    )}
                    {project.status === "image_selection" && (
                        <Button type="primary" onClick={() => handleStatusChange("download")}>
                            完成・公開 <Icon icon="mdi:check-bold" />
                        </Button>
                    )}
                </div>
            )}

            <Card className="bg-[var(--md-sys-color-surface-container-lowest)] rounded-[28px] border-none shadow-none min-h-[600px]" styles={{ body: { padding: 0 } }}>
                <Tabs
                    activeKey={store.selectedTab}
                    onChange={(k) => store.setSelectedTab(k)}
                    items={tabItems}
                    className="kitchen-tabs"
                />
            </Card>

            <Lightbox isOpen={store.isLightboxOpen} onClose={() => store.setIsLightboxOpen(false)}
                images={store.lightboxImages} currentIndex={store.lightboxImageIndex}
                onIndexChange={store.setLightboxImageIndex} uploaderNames={store.userNames}
                onUpdateComment={store.handleUpdateImageComment}
            />

            <UploadModal
                visible={isUploadModalOpen}
                onClose={() => setIsUploadModalOpen(false)}
                initialTitle={project.title}
                initialDescription={project.description || ""}
                projectId={project.id}
            />
        </motion.div>
    );
}
