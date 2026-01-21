"use client";

import { Card, CardBody, Tabs, Tab } from "@heroui/react";
import { Icon } from "@iconify/react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { KitchenDetailClientProps } from "@/types/kitchen";
import { useKitchenDetail } from "@/hooks/kitchen/useKitchenDetail";
import { deleteCookingProject } from "@/app/actions/kitchen";
import KitchenHeader from "./detail/KitchenHeader";
import SectionList from "./detail/SectionList";
import ImageUploadTab from "./detail/ImageUploadTab";
import ImageAdoptionTab from "./detail/ImageAdoptionTab";
import DownloadTab from "./detail/DownloadTab";
import Lightbox from "./detail/Lightbox";

export default function KitchenDetailClient({
    project,
    initialSections,
    userRole = "guest"
}: KitchenDetailClientProps) {
    const router = useRouter();
    const store = useKitchenDetail(project, initialSections, userRole);

    const handleDeleteProject = async () => {
        if (!confirm("プロジェクトを削除しますか？\nこの操作は取り消せません。")) return;
        try {
            await deleteCookingProject(project.id);
            router.push('/kitchen');
        } catch (error) {
            console.error("Failed to delete project:", error);
            alert("プロジェクトの削除に失敗しました。");
        }
    };

    return (
        <motion.div
            className="container mx-auto py-8 px-4 max-w-6xl"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
        >
            <KitchenHeader
                project={project}
                isGicho={store.isGicho}
                showFontSizeControl={store.selectedTab === "cooking"}
                editorFontSize={store.editorFontSize}
                onEditorFontSizeChange={store.setEditorFontSize}
                onDeleteProject={handleDeleteProject}
            />

            <Card className="bg-[var(--md-sys-color-surface-container-lowest)] rounded-[28px] border-none shadow-none min-h-[600px]">
                <CardBody className="p-0">
                    <Tabs
                        selectedKey={store.selectedTab}
                        onSelectionChange={(k) => store.setSelectedTab(k.toString())}
                        aria-label="Kitchen Tabs"
                        variant="underlined"
                        classNames={{
                            tabList: "w-full border-b border-[var(--md-sys-color-outline-variant)]/30 p-0",
                            cursor: "w-full bg-[#73342b]",
                            tab: "max-w-fit px-6 h-12 rounded-full",
                            tabContent: "group-data-[selected=true]:text-[#73342b] font-medium"
                        }}
                    >
                        <Tab key="cooking" title={<div className="flex items-center gap-2"><Icon icon="mdi:pot-mix" className="text-lg" /><span className="hidden md:inline">調理</span></div>}>
                            <div className="p-4 md:p-6 bg-[var(--md-sys-color-surface-container-low)] min-h-[500px]">
                                <SectionList
                                    project={project} sections={store.sections} userRole={userRole} editorFontSize={store.editorFontSize}
                                    fullScript={store.fullScript} onFullScriptChange={store.setFullScript}
                                    isCreatingSections={store.isCreatingSections} onCreateSections={store.handleCreateSections}
                                    onAddSection={store.handleAddSection} onDeleteSection={store.handleDeleteSection}
                                    editingSection={store.editingSection} editContent={store.editContent}
                                    editImageInstruction={store.editImageInstruction} editReferenceImageUrl={store.editReferenceImageUrl}
                                    editAllowSubmission={store.editAllowSubmission} isSaving={store.isSectionSaving || store.isProposalSaving}
                                    onEditStart={store.handleEditStart} onEditCancel={store.handleEditCancel} onEditSave={store.handleEditSave}
                                    onEditContentChange={store.setEditContent} onEditImageInstructionChange={store.setEditImageInstruction}
                                    onEditReferenceImageUrlChange={store.setEditReferenceImageUrl} onEditAllowSubmissionChange={store.setEditAllowSubmission}
                                    proposalSection={store.proposalSection} proposalContent={store.proposalContent}
                                    onProposalOpen={store.handleProposalOpen} onProposalCancel={store.handleProposalCancel}
                                    onProposalSubmit={store.handleProposalSubmit} onProposalContentChange={store.setProposalContent}
                                />
                            </div>
                        </Tab>
                        <Tab key="images" title={<div className="flex items-center gap-2"><Icon icon="mdi:image-plus" className="text-lg" /><span className="hidden md:inline">画像UP</span></div>}>
                            <ImageUploadTab sections={store.sections} images={store.images} editorFontSize={store.editorFontSize}
                                uploadingSectionId={store.uploadingSectionId} uploadProgress={store.uploadProgress} uploaderNames={store.userNames}
                                projectTitle={project.title}
                                onAddSection={store.handleAddSection} onDeleteSection={store.handleDeleteSection}
                                onImageUpload={store.handleImageUpload} onDeleteImage={store.handleDeleteImage} onOpenLightbox={store.openLightbox}
                            />
                        </Tab>
                        <Tab key="selection" title={<div className="flex items-center gap-2"><Icon icon="mdi:check-decagram" className="text-lg" /><span className="hidden md:inline">画像採用</span></div>}>
                            <ImageAdoptionTab sections={store.sections} images={store.images} uploaderNames={store.userNames}
                                onImageSelection={store.handleImageSelection} onOpenLightbox={store.openLightbox}
                            />
                        </Tab>
                        <Tab key="download" title={<div className="flex items-center gap-2"><Icon icon="mdi:download" className="text-lg" /><span className="hidden md:inline">DL</span></div>}>
                            <DownloadTab isDownloading={store.downloading}
                                onDownloadScript={store.handleDownloadScript}
                                onDownloadScriptBodyOnly={store.handleDownloadScriptBodyOnly}
                                onDownloadImages={store.handleDownloadImages}
                                onDownloadProject={store.handleDownloadProject}
                            />
                        </Tab>
                    </Tabs>
                </CardBody>
            </Card>

            <Lightbox isOpen={store.isLightboxOpen} onClose={() => store.setIsLightboxOpen(false)}
                images={store.lightboxImages} currentIndex={store.lightboxImageIndex}
                onIndexChange={store.setLightboxImageIndex} uploaderNames={store.userNames}
            />
        </motion.div>
    );
}
