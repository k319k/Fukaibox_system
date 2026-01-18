"use client";

import {
    Card, CardBody, CardHeader, Button, Tabs, Tab, Chip,
    Divider, Progress, Spinner, Checkbox
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

    // 編集ステート（インライン）
    const [editingSection, setEditingSection] = useState<Section | null>(null);
    const [editContent, setEditContent] = useState("");
    const [editImageInstruction, setEditImageInstruction] = useState("");
    const [editAllowSubmission, setEditAllowSubmission] = useState(true);
    const [isSaving, setIsSaving] = useState(false);

    // 推敲提案ステート（インライン）
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

    // セクション編集を開始（インライン）
    const handleEditSection = (section: Section) => {
        setEditingSection(section);
        setEditContent(section.content);
        setEditImageInstruction(section.imageInstruction || "");
        setEditAllowSubmission(section.allowImageSubmission ?? true);
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
            setEditingSection(null);
        } finally {
            setIsSaving(false);
        }
    };

    // 推敲提案を開始（インライン）
    const handleOpenProposal = (section: Section) => {
        setProposalSection(section);
        setProposalContent(section.content);
    };

    // 推敲提案をキャンセル
    const handleCancelProposal = () => {
        setProposalSection(null);
        setProposalContent("");
    };

    // 推敲提案を送信
    const handleSubmitProposal = async () => {
        if (!proposalSection) return;

        await createCookingProposal(proposalSection.id, proposalContent);
        await loadProposals();
        setProposalSection(null);
        setProposalContent("");
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
                                    <div className="flex flex-col gap-6">
                                        {/* ヘッダー */}
                                        <div className="flex items-center gap-3">
                                            <Icon icon="mdi:script-text-outline" className="text-2xl text-primary" />
                                            <div>
                                                <h3 className="font-bold text-lg">台本を入力</h3>
                                                <p className="text-sm text-foreground-muted">
                                                    空行（改行2回）でセクションに分割されます
                                                </p>
                                            </div>
                                        </div>

                                        {/* テキストエリア - 標準HTML */}
                                        <textarea
                                            placeholder="ここに台本を入力してください..."
                                            value={fullScript}
                                            onChange={(e) => setFullScript(e.target.value)}
                                            disabled={isCreatingSections}
                                            rows={12}
                                            className="w-full px-4 py-3 border-2 border-default-200 rounded-xl bg-background font-mono text-sm focus:border-primary focus:outline-none transition-colors resize-y disabled:opacity-50"
                                            style={{ minHeight: '250px', maxHeight: '500px' }}
                                        />

                                        {/* セクションプレビューとボタン */}
                                        {fullScript.trim() && (
                                            <div className="flex items-center justify-between p-4 bg-primary/10 rounded-xl">
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
                                                        {editingSection?.id === section.id && (
                                                            <Chip size="sm" color="secondary" variant="flat">
                                                                <Icon icon="mdi:pencil" className="mr-1" />
                                                                編集中
                                                            </Chip>
                                                        )}
                                                    </div>
                                                    <div className="flex gap-2">
                                                        {editingSection?.id === section.id ? (
                                                            <Button
                                                                size="sm"
                                                                color="primary"
                                                                radius="full"
                                                                isIconOnly
                                                                onPress={handleSaveEdit}
                                                                isLoading={isSaving}
                                                            >
                                                                <Icon icon="mdi:content-save" />
                                                            </Button>
                                                        ) : isGicho ? (
                                                            <Button
                                                                size="sm"
                                                                color="primary"
                                                                variant="flat"
                                                                radius="full"
                                                                isIconOnly
                                                                onPress={() => handleEditSection(section)}
                                                            >
                                                                <Icon icon="mdi:pencil" />
                                                            </Button>
                                                        ) : proposalSection?.id === section.id ? (
                                                            <>
                                                                <Button
                                                                    size="sm"
                                                                    color="default"
                                                                    variant="flat"
                                                                    radius="full"
                                                                    onPress={handleCancelProposal}
                                                                >
                                                                    キャンセル
                                                                </Button>
                                                                <Button
                                                                    size="sm"
                                                                    color="secondary"
                                                                    radius="full"
                                                                    startContent={<Icon icon="mdi:send" />}
                                                                    onPress={handleSubmitProposal}
                                                                >
                                                                    送信
                                                                </Button>
                                                            </>
                                                        ) : (
                                                            <Button
                                                                size="sm"
                                                                color="secondary"
                                                                variant="flat"
                                                                radius="full"
                                                                startContent={<Icon icon="mdi:comment-text-outline" />}
                                                                onPress={() => handleOpenProposal(section)}
                                                            >
                                                                推敲提案
                                                            </Button>
                                                        )}
                                                    </div>
                                                </CardHeader>
                                                <CardBody className="pt-0 space-y-3">
                                                    {/* 編集中の場合: textarea */}
                                                    {editingSection?.id === section.id ? (
                                                        <div className="space-y-4">
                                                            <div className="flex flex-col gap-2">
                                                                <label className="text-sm font-medium">セクション内容</label>
                                                                <textarea
                                                                    value={editContent}
                                                                    onChange={(e) => setEditContent(e.target.value)}
                                                                    disabled={isSaving}
                                                                    rows={6}
                                                                    className="w-full px-4 py-3 border-2 border-default-200 rounded-xl bg-background focus:border-primary focus:outline-none transition-colors resize-y disabled:opacity-50"
                                                                />
                                                            </div>
                                                            <div className="flex flex-col gap-2">
                                                                <label className="text-sm font-medium">画像指示（任意）</label>
                                                                <input
                                                                    type="text"
                                                                    value={editImageInstruction}
                                                                    onChange={(e) => setEditImageInstruction(e.target.value)}
                                                                    disabled={isSaving}
                                                                    placeholder="例: 商品のアップ画像"
                                                                    className="w-full px-4 py-3 border-2 border-default-200 rounded-xl bg-background focus:border-primary focus:outline-none transition-colors disabled:opacity-50"
                                                                />
                                                            </div>
                                                            <div className="flex items-center gap-2">
                                                                <Checkbox
                                                                    isSelected={editAllowSubmission}
                                                                    onValueChange={setEditAllowSubmission}
                                                                    isDisabled={isSaving}
                                                                >
                                                                    <span className="text-sm">画像投稿を許可</span>
                                                                </Checkbox>
                                                            </div>
                                                        </div>
                                                    ) : proposalSection?.id === section.id ? (
                                                        /* 推敲提案入力中の場合 */
                                                        <div className="space-y-3">
                                                            <div className="flex items-center gap-2 mb-2">
                                                                <Icon icon="mdi:lightbulb-outline" className="text-secondary" />
                                                                <span className="text-sm font-medium text-secondary">推敲提案を入力</span>
                                                            </div>
                                                            <textarea
                                                                value={proposalContent}
                                                                onChange={(e) => setProposalContent(e.target.value)}
                                                                rows={6}
                                                                placeholder="修正案を入力してください..."
                                                                className="w-full px-4 py-3 border-2 border-secondary/50 rounded-xl bg-secondary/5 focus:border-secondary focus:outline-none transition-colors resize-y"
                                                            />
                                                        </div>
                                                    ) : (
                                                        /* 通常表示 */
                                                        <>
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
                                                        </>
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
                                                                radius="full"
                                                                startContent={<Icon icon="mdi:check" />}
                                                                onPress={() => handleApproveProposal(proposal.id)}
                                                            >
                                                                承認
                                                            </Button>
                                                            <Button
                                                                size="sm"
                                                                color="danger"
                                                                variant="flat"
                                                                radius="full"
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
        </div>
    );
}
