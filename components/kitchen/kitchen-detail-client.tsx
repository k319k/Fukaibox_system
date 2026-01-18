"use client";

import {
    Card, CardBody, CardHeader, Button, Tabs, Tab, Chip,
    useDisclosure, Modal, ModalContent, ModalHeader, ModalBody, ModalFooter,
    Textarea, Divider, Progress, Spinner, Checkbox
} from "@heroui/react";
import { useState, useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import { Icon } from "@iconify/react";
import {
    updateCookingSection,
    createCookingProposal,
    getAllProposalsForProject,
    applyCookingProposal,
    updateProposalStatus,
    getUploadUrl,
    confirmImageUpload,
    getCookingImages,
    updateImageSelection,
    getProjectScript,
    getSelectedImages,
    getCookingSections,
    setProjectScript
} from "@/app/actions/kitchen";
import JSZip from "jszip";

// 型定義
interface Section {
    id: string;
    projectId: string;
    orderIndex: number;
    content: string;
    imageInstruction: string | null;
    allowImageSubmission: boolean | null;
    createdAt: Date;
    updatedAt: Date;
}

interface Project {
    id: string;
    title: string;
    description: string | null;
    status: string;
}

interface Proposal {
    id: string;
    sectionId: string;
    proposedBy: string;
    proposedContent: string;
    status: "pending" | "approved" | "rejected";
    createdAt: Date;
}

interface UploadedImage {
    id: string;
    projectId: string;
    sectionId: string | null;
    uploadedBy: string;
    imageUrl: string;
    isSelected: boolean | null;
    createdAt: Date;
}

type UserRole = "gicho" | "meiyo_giin" | "giin" | "guest" | "anonymous";

interface KitchenDetailClientProps {
    project: Project;
    initialSections: Section[];
    userRole?: UserRole;
}

export default function KitchenDetailClient({
    project,
    initialSections,
    userRole = "guest"
}: KitchenDetailClientProps) {
    const router = useRouter();
    const [sections, setSections] = useState<Section[]>(initialSections);
    const [selectedTab, setSelectedTab] = useState("cooking");
    const [images, setImages] = useState<UploadedImage[]>([]);
    const [proposals, setProposals] = useState<Proposal[]>([]);

    // 台本入力（セクションがない場合用）
    const [fullScript, setFullScript] = useState("");
    const [isCreatingSections, setIsCreatingSections] = useState(false);

    // 編集モーダル
    const { isOpen: isEditOpen, onOpen: onEditOpen, onClose: onEditClose } = useDisclosure();
    const [editingSection, setEditingSection] = useState<Section | null>(null);
    const [editContent, setEditContent] = useState("");
    const [editImageInstruction, setEditImageInstruction] = useState("");
    const [editAllowSubmission, setEditAllowSubmission] = useState(true);
    const [isSaving, setIsSaving] = useState(false);

    // 推敲提案モーダル
    const { isOpen: isProposalOpen, onOpen: onProposalOpen, onClose: onProposalClose } = useDisclosure();
    const [proposalSection, setProposalSection] = useState<Section | null>(null);
    const [proposalContent, setProposalContent] = useState("");

    // 画像アップロード
    const [uploadingSection, setUploadingSection] = useState<string | null>(null);
    const [uploadProgress, setUploadProgress] = useState(0);

    const isGicho = userRole === "gicho";

    // セクション数プレビュー
    const sectionPreviewCount = useMemo(() => {
        if (!fullScript.trim()) return 0;
        return fullScript
            .split(/\n\n+|\r\n\r\n+/)
            .map(s => s.trim())
            .filter(s => s.length > 0).length;
    }, [fullScript]);

    // 画像一覧を読み込み
    useEffect(() => {
        loadImages();
        if (isGicho) {
            loadProposals();
        }
    }, []);

    const loadImages = async () => {
        const imgs = await getCookingImages(project.id);
        setImages(imgs);
    };

    const loadProposals = async () => {
        const props = await getAllProposalsForProject(project.id);
        setProposals(props);
    };

    const reloadSections = async () => {
        const updated = await getCookingSections(project.id);
        setSections(updated);
    };

    // 台本からセクションを作成
    const handleCreateSections = async () => {
        if (!fullScript.trim()) return;

        setIsCreatingSections(true);
        try {
            await setProjectScript(project.id, fullScript);
            await reloadSections();
            setFullScript("");
        } catch (error) {
            console.error("Failed to create sections:", error);
            alert("セクションの作成に失敗しました");
        } finally {
            setIsCreatingSections(false);
        }
    };

    // セクション編集を開く
    const handleEditSection = (section: Section) => {
        setEditingSection(section);
        setEditContent(section.content);
        setEditImageInstruction(section.imageInstruction || "");
        setEditAllowSubmission(section.allowImageSubmission ?? true);
        onEditOpen();
    };

    // セクション編集を保存
    const handleSaveEdit = async () => {
        if (!editingSection) return;

        setIsSaving(true);
        try {
            await updateCookingSection(
                editingSection.id,
                editContent,
                editImageInstruction,
                editAllowSubmission
            );
            await reloadSections();
            onEditClose();
        } finally {
            setIsSaving(false);
        }
    };

    // 推敲提案を開く
    const handleOpenProposal = (section: Section) => {
        setProposalSection(section);
        setProposalContent(section.content);
        onProposalOpen();
    };

    // 推敲提案を送信
    const handleSubmitProposal = async () => {
        if (!proposalSection) return;

        await createCookingProposal(proposalSection.id, proposalContent);
        await loadProposals();
        onProposalClose();
    };

    // 推敲提案を承認
    const handleApproveProposal = async (proposalId: string) => {
        await applyCookingProposal(proposalId);
        await reloadSections();
        await loadProposals();
    };

    // 推敲提案を却下
    const handleRejectProposal = async (proposalId: string) => {
        await updateProposalStatus(proposalId, "rejected");
        await loadProposals();
    };

    // 画像アップロード（セクション指定）
    const handleImageUpload = async (sectionId: string, file: File) => {
        setUploadingSection(sectionId);
        setUploadProgress(10);

        try {
            const { url, key } = await getUploadUrl(file.name, file.type, project.id);
            setUploadProgress(30);

            // R2にアップロード
            const response = await fetch(url, {
                method: 'PUT',
                body: file,
                headers: { 'Content-Type': file.type }
            });

            if (response.ok) {
                setUploadProgress(70);
                await confirmImageUpload(project.id, key, sectionId);
                setUploadProgress(100);
                await loadImages();
            } else {
                throw new Error("Upload failed");
            }
        } catch (error) {
            console.error("Upload error:", error);
            alert("画像のアップロードに失敗しました。\n\nCORSエラーの場合はCloudflare R2のCORS設定を確認してください。");
        } finally {
            setUploadingSection(null);
            setUploadProgress(0);
        }
    };

    // 画像選択トグル
    const handleToggleImageSelection = async (imageId: string, currentSectionId: string | null) => {
        const image = images.find(img => img.id === imageId);
        if (!image) return;

        const isCurrentlySelected = image.isSelected && image.sectionId === currentSectionId;
        await updateImageSelection(imageId, currentSectionId, !isCurrentlySelected);
        await loadImages();
    };

    // 台本ダウンロード
    const handleDownloadScript = async () => {
        const script = await getProjectScript(project.id);
        const blob = new Blob([script], { type: 'text/plain;charset=utf-8' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${project.title}_台本.txt`;
        a.click();
        URL.revokeObjectURL(url);
    };

    // 画像ZIPダウンロード
    const handleDownloadImagesZip = async () => {
        const selectedImages = await getSelectedImages(project.id);
        if (selectedImages.length === 0) {
            alert("選択された画像がありません");
            return;
        }

        const zip = new JSZip();

        for (const img of selectedImages) {
            try {
                const response = await fetch(img.imageUrl);
                const blob = await response.blob();
                const filename = img.imageUrl.split('/').pop() || `image_${img.id}.jpg`;
                zip.file(filename, blob);
            } catch (error) {
                console.error(`Failed to fetch image ${img.id}:`, error);
            }
        }

        const zipBlob = await zip.generateAsync({ type: 'blob' });
        const url = URL.createObjectURL(zipBlob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${project.title}_選択画像.zip`;
        a.click();
        URL.revokeObjectURL(url);
    };

    return (
        <div className="max-w-6xl mx-auto space-y-6">
            {/* ヘッダー */}
            <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
                <div>
                    <Button
                        variant="light"
                        size="sm"
                        radius="lg"
                        onPress={() => router.push('/cooking')}
                        startContent={<Icon icon="mdi:arrow-left" />}
                        className="mb-3"
                    >
                        一覧に戻る
                    </Button>
                    <h1 className="text-2xl md:text-3xl font-bold" style={{ color: 'var(--md-sys-color-primary)' }}>{project.title}</h1>
                    {project.description && (
                        <p className="text-foreground-muted mt-1 text-sm md:text-base">{project.description}</p>
                    )}
                </div>
                <div className="flex items-center gap-3">
                    <Chip color="primary" variant="flat" startContent={<Icon icon="mdi:format-list-numbered" />}>
                        {sections.length} セクション
                    </Chip>
                    <Chip color="secondary" variant="flat" startContent={<Icon icon="mdi:image-multiple" />}>
                        {images.length} 画像
                    </Chip>
                </div>
            </div>

            {/* タブ */}
            <Card className="card-elevated" radius="lg">
                <CardBody className="p-0 md:p-2">
                    <Tabs
                        selectedKey={selectedTab}
                        onSelectionChange={(key) => setSelectedTab(key as string)}
                        variant="underlined"
                        color="primary"
                        classNames={{
                            tabList: "gap-0 w-full relative rounded-none p-2 md:p-4 border-b-2 border-divider bg-transparent",
                            cursor: "w-full bg-primary h-[3px]",
                            tab: "max-w-fit px-3 md:px-6 h-10 md:h-12",
                            tabContent: "group-data-[selected=true]:text-primary group-data-[selected=true]:font-bold font-medium text-sm md:text-base text-foreground-muted"
                        }}
                    >
                        {/* 1. 調理タブ */}
                        <Tab
                            key="cooking"
                            title={
                                <div className="flex items-center gap-2">
                                    <Icon icon="mdi:pot-steam" className="text-lg" />
                                    <span className="hidden md:inline">調理</span>
                                </div>
                            }
                        >
                            <div className="p-4 md:p-6 space-y-4">
                                {/* セクションがない場合: 台本入力エリア */}
                                {sections.length === 0 && isGicho ? (
                                    <div className="space-y-4">
                                        <div className="flex items-center gap-3">
                                            <Icon icon="mdi:script-text-outline" className="text-2xl text-primary" />
                                            <div>
                                                <h3 className="font-bold text-lg">台本を入力</h3>
                                                <p className="text-sm text-foreground-muted">
                                                    空行（改行2回）でセクションに分割されます
                                                </p>
                                            </div>
                                        </div>

                                        <Textarea
                                            placeholder="ここに台本を入力してください..."
                                            variant="bordered"
                                            value={fullScript}
                                            onValueChange={setFullScript}
                                            isDisabled={isCreatingSections}
                                            minRows={12}
                                            classNames={{
                                                input: "font-mono text-sm",
                                                inputWrapper: "bg-white dark:bg-default-100",
                                            }}
                                        />

                                        {fullScript.trim() && (
                                            <div className="flex items-center justify-between mt-4 p-4 bg-primary/10 rounded-lg">
                                                <div className="flex items-center gap-3">
                                                    <Icon icon="mdi:format-list-numbered" className="text-2xl text-primary" />
                                                    <div>
                                                        <p className="font-bold text-primary text-lg">
                                                            {sectionPreviewCount} セクション
                                                        </p>
                                                        <p className="text-xs text-foreground-muted">
                                                            に自動分割されます
                                                        </p>
                                                    </div>
                                                </div>
                                                <Button
                                                    color="primary"
                                                    size="lg"
                                                    radius="lg"
                                                    onPress={handleCreateSections}
                                                    isLoading={isCreatingSections}
                                                    startContent={!isCreatingSections && <Icon icon="mdi:content-cut" />}
                                                >
                                                    セクション分割して保存
                                                </Button>
                                            </div>
                                        )}
                                    </div>
                                ) : sections.length === 0 ? (
                                    <div className="text-center py-12">
                                        <Icon icon="mdi:file-document-outline" className="text-5xl text-foreground-muted mx-auto mb-4" />
                                        <p className="text-foreground-muted">セクションがありません</p>
                                        <p className="text-sm text-foreground-muted mt-1">儀長が台本を入力するまでお待ちください</p>
                                    </div>
                                ) : (
                                    // セクションがある場合: セクション一覧
                                    sections.map((section, index) => (
                                        <div key={section.id}>
                                            <Card className="card-elevated" radius="lg">
                                                <CardHeader className="flex flex-col md:flex-row justify-between items-start md:items-center gap-2 pb-2">
                                                    <div className="flex flex-wrap items-center gap-2">
                                                        <Chip size="sm" color="primary" variant="flat">
                                                            <Icon icon="mdi:numeric" className="mr-1" />
                                                            セクション {index + 1}
                                                        </Chip>
                                                        {!(section.allowImageSubmission ?? true) && (
                                                            <Chip size="sm" color="warning" variant="flat">
                                                                <Icon icon="mdi:image-off" className="mr-1" />
                                                                画像なし
                                                            </Chip>
                                                        )}
                                                    </div>
                                                    <div className="flex gap-2">
                                                        {isGicho ? (
                                                            <Button
                                                                size="sm"
                                                                color="primary"
                                                                variant="flat"
                                                                radius="lg"
                                                                startContent={<Icon icon="mdi:pencil" />}
                                                                onPress={() => handleEditSection(section)}
                                                            >
                                                                編集
                                                            </Button>
                                                        ) : (
                                                            <Button
                                                                size="sm"
                                                                color="secondary"
                                                                variant="flat"
                                                                radius="lg"
                                                                startContent={<Icon icon="mdi:comment-text-outline" />}
                                                                onPress={() => handleOpenProposal(section)}
                                                            >
                                                                推敲提案
                                                            </Button>
                                                        )}
                                                    </div>
                                                </CardHeader>
                                                <CardBody className="pt-0 space-y-3">
                                                    <div className="whitespace-pre-wrap text-sm md:text-base leading-relaxed">
                                                        {section.content}
                                                    </div>
                                                    {section.imageInstruction && (
                                                        <div className="bg-primary/5 border-l-4 border-primary pl-4 py-3 rounded-r">
                                                            <div className="flex items-center gap-2 mb-1">
                                                                <Icon icon="mdi:image-text" className="text-primary" />
                                                                <p className="text-sm font-semibold text-primary">画像指示</p>
                                                            </div>
                                                            <p className="text-sm text-foreground-muted">{section.imageInstruction}</p>
                                                        </div>
                                                    )}
                                                </CardBody>
                                            </Card>

                                            {/* このセクションの推敲提案 */}
                                            {isGicho && proposals.filter(p => p.sectionId === section.id && p.status === "pending").map((proposal) => (
                                                <Card key={proposal.id} className="mt-3 border-2 border-warning bg-warning/5" radius="lg">
                                                    <CardHeader className="pb-2">
                                                        <Chip size="sm" color="warning" variant="flat">
                                                            <Icon icon="mdi:lightbulb-outline" className="mr-1" />
                                                            推敲提案
                                                        </Chip>
                                                    </CardHeader>
                                                    <CardBody className="pt-0 space-y-3">
                                                        <div className="whitespace-pre-wrap text-sm">{proposal.proposedContent}</div>
                                                        <div className="flex gap-2 justify-end">
                                                            <Button
                                                                size="sm"
                                                                color="success"
                                                                radius="lg"
                                                                startContent={<Icon icon="mdi:check" />}
                                                                onPress={() => handleApproveProposal(proposal.id)}
                                                            >
                                                                承認
                                                            </Button>
                                                            <Button
                                                                size="sm"
                                                                color="danger"
                                                                variant="flat"
                                                                radius="lg"
                                                                startContent={<Icon icon="mdi:close" />}
                                                                onPress={() => handleRejectProposal(proposal.id)}
                                                            >
                                                                却下
                                                            </Button>
                                                        </div>
                                                    </CardBody>
                                                </Card>
                                            ))}
                                        </div>
                                    ))
                                )}
                            </div>
                        </Tab>

                        {/* 2. 画像UPタブ */}
                        <Tab
                            key="image-upload"
                            title={
                                <div className="flex items-center gap-2">
                                    <Icon icon="mdi:cloud-upload" className="text-lg" />
                                    <span className="hidden md:inline">画像UP</span>
                                </div>
                            }
                        >
                            <div className="p-4 md:p-6 space-y-6">
                                {sections.filter(s => s.allowImageSubmission ?? true).length === 0 ? (
                                    <div className="text-center py-12">
                                        <Icon icon="mdi:image-off" className="text-5xl text-foreground-muted mx-auto mb-4" />
                                        <p className="text-foreground-muted">
                                            {sections.length === 0
                                                ? "まずは調理タブで台本を入力してください"
                                                : "画像提出が許可されているセクションがありません"}
                                        </p>
                                    </div>
                                ) : (
                                    sections.filter(s => s.allowImageSubmission ?? true).map((section) => {
                                        const sectionImages = images.filter(img => img.sectionId === section.id);
                                        const originalIndex = sections.indexOf(section);

                                        return (
                                            <Card key={section.id} className="card-elevated" radius="lg">
                                                <CardHeader className="pb-2">
                                                    <Chip size="sm" color="primary" variant="flat">
                                                        セクション {originalIndex + 1}
                                                    </Chip>
                                                </CardHeader>
                                                <CardBody className="space-y-4">
                                                    <div className="text-sm text-foreground-muted line-clamp-2">
                                                        {section.content}
                                                    </div>

                                                    {section.imageInstruction && (
                                                        <div className="bg-primary/5 border-l-4 border-primary pl-4 py-3 rounded-r">
                                                            <div className="flex items-center gap-2 mb-1">
                                                                <Icon icon="mdi:image-text" className="text-primary" />
                                                                <p className="text-sm font-semibold text-primary">画像指示</p>
                                                            </div>
                                                            <p className="text-sm">{section.imageInstruction}</p>
                                                        </div>
                                                    )}

                                                    <Divider />

                                                    {/* アップロードエリア */}
                                                    <div>
                                                        <input
                                                            type="file"
                                                            accept="image/*"
                                                            onChange={(e) => {
                                                                const file = e.target.files?.[0];
                                                                if (file) handleImageUpload(section.id, file);
                                                                e.target.value = '';
                                                            }}
                                                            className="hidden"
                                                            id={`file-input-${section.id}`}
                                                        />
                                                        <label htmlFor={`file-input-${section.id}`}>
                                                            <div className={`border-2 border-dashed rounded-xl p-6 text-center cursor-pointer transition-all ${uploadingSection === section.id
                                                                ? 'border-primary bg-primary/5'
                                                                : 'border-default-300 hover:border-primary hover:bg-primary/5'
                                                                }`}>
                                                                {uploadingSection === section.id ? (
                                                                    <div className="space-y-3">
                                                                        <Spinner size="sm" color="primary" />
                                                                        <p className="text-sm text-primary">アップロード中...</p>
                                                                        <Progress
                                                                            value={uploadProgress}
                                                                            color="primary"
                                                                            size="sm"
                                                                            className="max-w-xs mx-auto"
                                                                        />
                                                                    </div>
                                                                ) : (
                                                                    <div className="space-y-2">
                                                                        <Icon icon="mdi:cloud-upload-outline" className="text-4xl text-foreground-muted mx-auto" />
                                                                        <p className="text-sm font-semibold">クリックして画像をアップロード</p>
                                                                        <p className="text-xs text-foreground-muted">jpg, png, gif, webp対応</p>
                                                                    </div>
                                                                )}
                                                            </div>
                                                        </label>
                                                    </div>

                                                    {/* このセクションの画像一覧 */}
                                                    {sectionImages.length > 0 && (
                                                        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                                                            {sectionImages.map((img) => (
                                                                <div key={img.id} className="relative group">
                                                                    {/* eslint-disable-next-line @next/next/no-img-element */}
                                                                    <img
                                                                        src={img.imageUrl}
                                                                        alt="uploaded"
                                                                        className="w-full h-24 md:h-32 object-cover rounded-lg"
                                                                    />
                                                                </div>
                                                            ))}
                                                        </div>
                                                    )}
                                                </CardBody>
                                            </Card>
                                        );
                                    })
                                )}
                            </div>
                        </Tab>

                        {/* 3. 画像採用タブ */}
                        <Tab
                            key="image-selection"
                            title={
                                <div className="flex items-center gap-2">
                                    <Icon icon="mdi:check-circle" className="text-lg" />
                                    <span className="hidden md:inline">画像採用</span>
                                </div>
                            }
                        >
                            <div className="p-4 md:p-6 space-y-6">
                                {sections.length === 0 ? (
                                    <div className="text-center py-12">
                                        <Icon icon="mdi:image-off" className="text-5xl text-foreground-muted mx-auto mb-4" />
                                        <p className="text-foreground-muted">まずは調理タブで台本を入力してください</p>
                                    </div>
                                ) : (
                                    sections.map((section, index) => {
                                        const sectionImages = images.filter(img => img.sectionId === section.id);
                                        return (
                                            <Card key={section.id} className="card-elevated" radius="lg">
                                                <CardHeader className="pb-2">
                                                    <Chip size="sm" color="primary" variant="flat">
                                                        セクション {index + 1}
                                                    </Chip>
                                                </CardHeader>
                                                <CardBody className="space-y-4">
                                                    <div className="text-sm text-foreground-muted line-clamp-2">
                                                        {section.content}
                                                    </div>

                                                    {sectionImages.length > 0 ? (
                                                        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                                                            {sectionImages.map((img) => (
                                                                <div
                                                                    key={img.id}
                                                                    className={`card-elevated hover:scale-[1.02] transition-transform rounded-lg overflow-hidden ${img.isSelected
                                                                        ? 'ring-4 ring-primary ring-offset-2'
                                                                        : 'hover:ring-2 hover:ring-default-300'
                                                                        }`}
                                                                    onClick={() => handleToggleImageSelection(img.id, section.id)}
                                                                >
                                                                    {/* eslint-disable-next-line @next/next/no-img-element */}
                                                                    <img
                                                                        src={img.imageUrl}
                                                                        alt="section image"
                                                                        className="w-full h-24 md:h-32 object-cover rounded-lg"
                                                                    />
                                                                    {img.isSelected && (
                                                                        <div className="absolute top-2 right-2 bg-primary text-white rounded-full p-1.5">
                                                                            <Icon icon="mdi:check" className="text-sm" />
                                                                        </div>
                                                                    )}
                                                                </div>
                                                            ))}
                                                        </div>
                                                    ) : (
                                                        <p className="text-sm text-foreground-muted text-center py-4">
                                                            まだ画像がアップロードされていません
                                                        </p>
                                                    )}
                                                </CardBody>
                                            </Card>
                                        );
                                    })
                                )}
                            </div>
                        </Tab>

                        {/* 4. ダウンロードタブ */}
                        <Tab
                            key="download"
                            title={
                                <div className="flex items-center gap-2">
                                    <Icon icon="mdi:download" className="text-lg" />
                                    <span className="hidden md:inline">DL</span>
                                </div>
                            }
                        >
                            <div className="p-4 md:p-6">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <Card className="card-elevated" radius="lg">
                                        <CardBody className="space-y-4">
                                            <div className="flex items-center gap-3">
                                                <div className="p-3 bg-primary/10 rounded-lg">
                                                    <Icon icon="mdi:file-document-outline" className="text-2xl text-primary" />
                                                </div>
                                                <div>
                                                    <p className="font-semibold">台本</p>
                                                    <p className="text-sm text-foreground-muted">テキストファイル形式</p>
                                                </div>
                                            </div>
                                            <Button
                                                color="primary"
                                                radius="lg"
                                                className="w-full"
                                                startContent={<Icon icon="mdi:download" />}
                                                onPress={handleDownloadScript}
                                                isDisabled={sections.length === 0}
                                            >
                                                ダウンロード (.txt)
                                            </Button>
                                        </CardBody>
                                    </Card>

                                    <Card className="card-elevated" radius="lg">
                                        <CardBody className="space-y-4">
                                            <div className="flex items-center gap-3">
                                                <div className="p-3 bg-secondary/10 rounded-lg">
                                                    <Icon icon="mdi:folder-zip-outline" className="text-2xl text-secondary" />
                                                </div>
                                                <div>
                                                    <p className="font-semibold">採用画像</p>
                                                    <p className="text-sm text-foreground-muted">
                                                        {images.filter(i => i.isSelected).length} 枚選択中
                                                    </p>
                                                </div>
                                            </div>
                                            <Button
                                                color="secondary"
                                                radius="lg"
                                                className="w-full"
                                                startContent={<Icon icon="mdi:download" />}
                                                onPress={handleDownloadImagesZip}
                                                isDisabled={images.filter(i => i.isSelected).length === 0}
                                            >
                                                ダウンロード (.zip)
                                            </Button>
                                        </CardBody>
                                    </Card>
                                </div>
                            </div>
                        </Tab>
                    </Tabs>
                </CardBody>
            </Card>

            {/* セクション編集モーダル */}
            <Modal
                isOpen={isEditOpen}
                onClose={onEditClose}
                size="3xl"
                scrollBehavior="inside"
                backdrop="blur"
                classNames={{
                    backdrop: "bg-gradient-to-br from-primary/10 via-background/80 to-secondary/10 backdrop-blur-md",
                    base: "border border-default-200 bg-background/95 shadow-2xl",
                }}
            >
                <ModalContent>
                    <ModalHeader className="flex items-center gap-2">
                        <Icon icon="mdi:pencil" className="text-primary" />
                        <span>セクション編集</span>
                    </ModalHeader>
                    <ModalBody className="space-y-4">
                        <Textarea
                            label="セクション内容"
                            value={editContent}
                            onValueChange={setEditContent}
                            minRows={6}
                            variant="bordered"
                            classNames={{ input: "font-mono text-sm" }}
                        />
                        <Textarea
                            label="画像指示（任意）"
                            value={editImageInstruction}
                            onValueChange={setEditImageInstruction}
                            placeholder="儀員に対する画像の指示を入力"
                            minRows={3}
                            variant="bordered"
                        />
                        <div className="bg-default-100 rounded-lg p-4">
                            <Checkbox
                                isSelected={editAllowSubmission}
                                onValueChange={setEditAllowSubmission}
                            >
                                <div className="ml-2">
                                    <p className="font-semibold">儀員の画像提出を許可</p>
                                    <p className="text-sm text-foreground-muted">
                                        オフにすると、このセクションは画像UPタブに表示されません
                                    </p>
                                </div>
                            </Checkbox>
                        </div>
                    </ModalBody>
                    <ModalFooter>
                        <Button variant="light" radius="lg" onPress={onEditClose} isDisabled={isSaving}>
                            キャンセル
                        </Button>
                        <Button
                            color="primary"
                            radius="lg"
                            onPress={handleSaveEdit}
                            isLoading={isSaving}
                            startContent={!isSaving && <Icon icon="mdi:check" />}
                        >
                            保存
                        </Button>
                    </ModalFooter>
                </ModalContent>
            </Modal>

            {/* 推敲提案モーダル */}
            <Modal
                isOpen={isProposalOpen}
                onClose={onProposalClose}
                size="3xl"
                scrollBehavior="inside"
                backdrop="blur"
                classNames={{
                    backdrop: "bg-gradient-to-br from-warning/10 via-background/80 to-secondary/10 backdrop-blur-md",
                    base: "border border-default-200 bg-background/95 shadow-2xl",
                }}
            >
                <ModalContent>
                    <ModalHeader className="flex items-center gap-2">
                        <Icon icon="mdi:lightbulb-outline" className="text-warning" />
                        <span>推敲提案</span>
                    </ModalHeader>
                    <ModalBody className="space-y-4">
                        <div className="bg-default-100 rounded-lg p-4">
                            <p className="text-sm font-semibold mb-2 flex items-center gap-2">
                                <Icon icon="mdi:file-document-outline" />
                                現在の内容
                            </p>
                            <div className="text-sm whitespace-pre-wrap text-foreground-muted">
                                {proposalSection?.content}
                            </div>
                        </div>
                        <Textarea
                            label="提案内容"
                            value={proposalContent}
                            onValueChange={setProposalContent}
                            minRows={6}
                            variant="bordered"
                            placeholder="改善案を入力してください"
                        />
                    </ModalBody>
                    <ModalFooter>
                        <Button variant="light" radius="lg" onPress={onProposalClose}>
                            キャンセル
                        </Button>
                        <Button
                            color="primary"
                            radius="lg"
                            onPress={handleSubmitProposal}
                            startContent={<Icon icon="mdi:send" />}
                        >
                            送信
                        </Button>
                    </ModalFooter>
                </ModalContent>
            </Modal>
        </div >
    );
}
