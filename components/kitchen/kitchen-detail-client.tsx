"use client";

import {
    Card, CardBody, CardHeader, Button, Tabs, Tab, Chip,
    useDisclosure, Modal, ModalContent, ModalHeader, ModalBody, ModalFooter,
    Input, Textarea, Divider, Tooltip, Image, Progress, Spinner
} from "@heroui/react";
import Link from "next/link";
import { useState, useEffect, useRef } from "react";
import {
    createCookingSection,
    updateCookingSection,
    deleteCookingSection,
    createCookingProposal,
    getCookingProposals,
    updateProposalStatus,
    applyCookingProposal,
    getUploadUrl,
    confirmImageUpload,
    getCookingImages,
    updateImageSelection,
    getProjectScript,
    getSelectedImages
} from "@/app/actions/kitchen";
import JSZip from "jszip";

// 型定義
type Section = {
    id: string;
    projectId: string;
    orderIndex: number;
    content: string;
    imageInstruction: string | null;
    createdAt: Date;
    updatedAt: Date;
};

type Project = {
    id: string;
    title: string;
    description: string | null;
    status: string;
};

type Proposal = {
    id: string;
    sectionId: string;
    proposedBy: string;
    proposedContent: string;
    status: "pending" | "approved" | "rejected";
    createdAt: Date;
};

type UploadedImage = {
    id: string;
    url: string;
    uploadedBy: string;
    points: number;
};

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
    const [sections, setSections] = useState<Section[]>(initialSections);
    const { isOpen, onOpen, onOpenChange } = useDisclosure();
    const [newContent, setNewContent] = useState("");
    const [newImageInstruction, setNewImageInstruction] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);

    // 編集モーダル用State
    const { isOpen: isEditOpen, onOpen: onEditOpen, onOpenChange: onEditOpenChange } = useDisclosure();
    const [editingSection, setEditingSection] = useState<Section | null>(null);
    const [editContent, setEditContent] = useState("");
    const [editImageInstruction, setEditImageInstruction] = useState("");

    // 削除確認モーダル用State
    const { isOpen: isDeleteOpen, onOpen: onDeleteOpen, onOpenChange: onDeleteOpenChange } = useDisclosure();
    const [deletingSection, setDeletingSection] = useState<Section | null>(null);

    // 推敲提案モーダル用State
    const { isOpen: isProposalOpen, onOpen: onProposalOpen, onOpenChange: onProposalOpenChange } = useDisclosure();
    const [proposalSection, setProposalSection] = useState<Section | null>(null);
    const [proposalContent, setProposalContent] = useState("");
    const [proposals, setProposals] = useState<Proposal[]>([]);
    const [loadingProposals, setLoadingProposals] = useState(false);

    // 画像アップロード用State    // 画像管理
    const [uploadedImages, setUploadedImages] = useState<any[]>([]); // TODO: 型定義修正
    const [uploading, setUploading] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    // 画像セクション割り当て管理: sectionId → imageId
    const [sectionImageMap, setSectionImageMap] = useState<Record<string, string>>({});

    // 画像初期ロード
    useEffect(() => {
        const loadImages = async () => {
            try {
                const images = await getCookingImages(project.id);
                setUploadedImages(images.map(img => ({
                    id: img.id,
                    url: img.imageUrl,
                    uploadedBy: "User", // TODO: ユーザー名解決が必要だが、一旦簡易表示
                    points: 100 // 仮
                })));
            } catch (e) {
                console.error("Failed to load images", e);
            }
        };
        loadImages();
    }, [project.id]);

    // 儀長かどうか
    const isGicho = userRole === "gicho";

    // 画像アップロードエリアクリック
    const handleImageUploadClick = () => {
        fileInputRef.current?.click();
    };

    // セクション追加ハンドラー
    const handleAddSection = async () => {
        setIsSubmitting(true);
        try {
            const newSection = await createCookingSection(
                project.id,
                sections.length,
                newContent,
                newImageInstruction
            );

            setSections([...sections, newSection]);
            setNewContent("");
            setNewImageInstruction("");
            onOpenChange();
        } catch (error) {
            console.error("Failed to add section", error);
            alert("セクションの追加に失敗しました");
        } finally {
            setIsSubmitting(false);
        }
    };

    // セクション編集開始
    const handleEditOpen = (section: Section) => {
        setEditingSection(section);
        setEditContent(section.content);
        setEditImageInstruction(section.imageInstruction || "");
        onEditOpen();
    };

    // セクション編集保存
    const handleEditSave = async () => {
        if (!editingSection) return;
        setIsSubmitting(true);
        try {
            await updateCookingSection(editingSection.id, editContent, editImageInstruction);
            setSections(sections.map(s =>
                s.id === editingSection.id
                    ? { ...s, content: editContent, imageInstruction: editImageInstruction }
                    : s
            ));
            onEditOpenChange();
        } catch (error) {
            console.error("Failed to update section", error);
            alert("セクションの更新に失敗しました");
        } finally {
            setIsSubmitting(false);
        }
    };

    // セクション削除開始
    const handleDeleteOpen = (section: Section) => {
        setDeletingSection(section);
        onDeleteOpen();
    };

    // セクション削除実行
    const handleDeleteConfirm = async () => {
        if (!deletingSection) return;
        setIsSubmitting(true);
        try {
            await deleteCookingSection(deletingSection.id);
            setSections(sections.filter(s => s.id !== deletingSection.id));
            onDeleteOpenChange();
        } catch (error) {
            console.error("Failed to delete section", error);
            alert("セクションの削除に失敗しました");
        } finally {
            setIsSubmitting(false);
        }
    };

    // 推敲提案モーダル開始
    const handleProposalOpen = async (section: Section) => {
        setProposalSection(section);
        setProposalContent(section.content);
        setLoadingProposals(true);
        onProposalOpen();

        try {
            const fetchedProposals = await getCookingProposals(section.id);
            setProposals(fetchedProposals as Proposal[]);
        } catch (error) {
            console.error("Failed to fetch proposals", error);
        } finally {
            setLoadingProposals(false);
        }
    };

    // 推敲提案送信
    const handleProposalSubmit = async () => {
        if (!proposalSection || !proposalContent.trim()) return;
        setIsSubmitting(true);
        try {
            const newProposal = await createCookingProposal(proposalSection.id, proposalContent);
            setProposals([newProposal as Proposal, ...proposals]);
            setProposalContent("");
            alert("推敲提案を送信しました");
        } catch (error) {
            console.error("Failed to create proposal", error);
            alert("推敲提案の送信に失敗しました");
        } finally {
            setIsSubmitting(false);
        }
    };

    // 推敲提案を承認・適用
    const handleApproveProposal = async (proposalId: string) => {
        setIsSubmitting(true);
        try {
            await applyCookingProposal(proposalId);
            // 提案リストを更新
            setProposals(proposals.map(p =>
                p.id === proposalId ? { ...p, status: "approved" as const } : p
            ));
            // セクションの内容も更新
            const approvedProposal = proposals.find(p => p.id === proposalId);
            if (approvedProposal && proposalSection) {
                setSections(sections.map(s =>
                    s.id === proposalSection.id
                        ? { ...s, content: approvedProposal.proposedContent }
                        : s
                ));
            }
            alert("推敲提案を承認し、適用しました");
        } catch (error) {
            console.error("Failed to approve proposal", error);
            alert("推敲提案の承認に失敗しました");
        } finally {
            setIsSubmitting(false);
        }
    };

    // 推敲提案を却下
    const handleRejectProposal = async (proposalId: string) => {
        setIsSubmitting(true);
        try {
            await updateProposalStatus(proposalId, "rejected");
            setProposals(proposals.map(p =>
                p.id === proposalId ? { ...p, status: "rejected" as const } : p
            ));
        } catch (error) {
            console.error("Failed to reject proposal", error);
            alert("推敲提案の却下に失敗しました");
        } finally {
            setIsSubmitting(false);
        }
    };

    // 画像ファイル選択ハンドラー
    const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        // 拡張子チェック
        const ext = file.name.split('.').pop()?.toLowerCase();
        if (!['jpg', 'jpeg', 'png', 'webp', 'gif'].includes(ext || '')) {
            alert('対応していないファイル形式です (.jpg, .png, .webp, .gif)');
            return;
        }

        setUploading(true);
        try {
            // 1. 署名付きURL取得
            const { url, key } = await getUploadUrl(file.name, file.type, project.id);

            // 2. R2へアップロード
            const uploadRes = await fetch(url, {
                method: 'PUT',
                body: file,
                headers: {
                    'Content-Type': file.type,
                },
            });

            if (!uploadRes.ok) {
                throw new Error('Upload failed');
            }

            // 3. 完了通知 & DB保存
            await confirmImageUpload(project.id, key); // sectionIdは指定しない（未割り当て）

            // 4. UI更新
            const newImage = await getCookingImages(project.id);
            setUploadedImages(newImage.map(img => ({
                id: img.id,
                url: img.imageUrl,
                uploadedBy: "User",
                points: 100
            })));

            alert("アップロード完了！");
        } catch (error) {
            console.error("Upload error:", error);
            alert("アップロードに失敗しました");
        } finally {
            setUploading(false);
            if (fileInputRef.current) {
                fileInputRef.current.value = '';
            }
        }
    };

    // 画像選択ハンドラー
    const handleImageSelection = async (sectionId: string, imageId: string) => {
        try {
            // 前の選択を解除
            const previousImageId = sectionImageMap[sectionId];
            if (previousImageId && previousImageId !== imageId) {
                await updateImageSelection(previousImageId, null, false);
            }

            // 新しい画像を選択
            await updateImageSelection(imageId, sectionId, true);

            // ローカル状態更新
            setSectionImageMap({ ...sectionImageMap, [sectionId]: imageId });

            // アップロード画像リストも更新
            setUploadedImages(uploadedImages.map(img => {
                if (img.id === imageId) {
                    return { ...img, sectionId, isSelected: true };
                }
                if (img.id === previousImageId) {
                    return { ...img, sectionId: null, isSelected: false };
                }
                return img;
            }));

            alert("画像を選択しました");
        } catch (error) {
            console.error("Failed to select image", error);
            alert("画像の選択に失敗しました");
        }
    };

    // 台本ダウンロード
    const handleDownloadScript = async () => {
        try {
            const script = await getProjectScript(project.id);
            const blob = new Blob([script], { type: 'text/plain;charset=utf-8' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `${project.title}_台本.txt`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
        } catch (error) {
            console.error("Failed to download script", error);
            alert("台本のダウンロードに失敗しました");
        }
    };

    // 画像ZIPダウンロード
    const handleDownloadImagesZip = async () => {
        try {
            const selectedImages = await getSelectedImages(project.id);

            if (selectedImages.length === 0) {
                alert("選択された画像がありません");
                return;
            }

            const zip = new JSZip();

            // 各画像をfetchしてZIPに追加
            for (let i = 0; i < selectedImages.length; i++) {
                const img = selectedImages[i];
                const response = await fetch(img.imageUrl);
                const blob = await response.blob();
                const ext = img.imageUrl.split('.').pop() || 'jpg';
                zip.file(`image_${i + 1}.${ext}`, blob);
            }

            const zipBlob = await zip.generateAsync({ type: 'blob' });
            const url = URL.createObjectURL(zipBlob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `${project.title}_画像.zip`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
        } catch (error) {
            console.error("Failed to download images", error);
            alert("画像のダウンロードに失敗しました");
        }
    };

    // プロジェクト全体ダウンロード
    const handleDownloadAll = async () => {
        try {
            const script = await getProjectScript(project.id);
            const selectedImages = await getSelectedImages(project.id);

            const zip = new JSZip();

            // 台本を追加
            zip.file(`${project.title}_台本.txt`, script);

            // 画像を追加
            if (selectedImages.length > 0) {
                const imgFolder = zip.folder('images');
                for (let i = 0; i < selectedImages.length; i++) {
                    const img = selectedImages[i];
                    const response = await fetch(img.imageUrl);
                    const blob = await response.blob();
                    const ext = img.imageUrl.split('.').pop() || 'jpg';
                    imgFolder?.file(`image_${i + 1}.${ext}`, blob);
                }
            }

            const zipBlob = await zip.generateAsync({ type: 'blob' });
            const url = URL.createObjectURL(zipBlob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `${project.title}_完全版.zip`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
        } catch (error) {
            console.error("Failed to download project", error);
            alert("プロジェクトのダウンロードに失敗しました");
        }
    };

    return (
        <div className="max-w-7xl mx-auto space-y-6 pb-20">
            {/* ヘッダー */}
            <div className="flex flex-col md:flex-row md:items-center justify-between spacing-6 flex-wrap">
                <div>
                    <Link href="/cooking" className="label-large text-[var(--md-sys-color-primary)] hover:underline mb-3 inline-block transition-colors">
                        ← 台所に戻る
                    </Link>
                    <h1 className="headline-large">{project.title}</h1>
                    {project.description && (
                        <p className="body-medium mt-2">{project.description}</p>
                    )}
                </div>
                <div className="flex items-center spacing-4 flex-wrap">
                    <Chip color="warning" variant="flat" classNames={{ base: "shape-sm font-medium" }}>調理中</Chip>
                    <div className="text-right surface-container-low shape-md p-compact">
                        <p className="label-small">Project ID</p>
                        <p className="title-small font-mono">{project.id.substring(0, 8)}...</p>
                    </div>
                </div>
            </div>

            {/* メインタブエリア */}
            <Card className="card-elevated surface-container-lowest">
                <CardBody className="p-0">
                    <Tabs aria-label="料理管理タブ" variant="bordered" classNames={{
                        tabList: "w-full border-b border-[var(--md-sys-color-outline-variant)] p-base pt-3 surface-container-lowest",
                        cursor: "w-full bg-[var(--md-sys-color-primary)] h-1",
                        tab: "max-w-fit px-8 h-16 title-medium text-[var(--md-sys-color-on-surface-variant)] hover:text-[var(--md-sys-color-on-surface)] transition-colors data-[selected=true]:elevated-1",
                        tabContent: "group-data-[selected=true]:text-primary font-semibold"
                    }}>
                        {/* 1. 調理タブ */}
                        <Tab key="cooking" title="1. 調理">
                            <div className="p-base spacing-6">
                                <div className="flex items-center justify-between elevated-2 shape-lg p-base">
                                    <div>
                                        <h2 className="title-large text-[var(--md-sys-color-primary)]">セクション構成</h2>
                                        <p className="body-small mt-1">動画の構成要素（台本・指示）を管理します</p>
                                    </div>
                                    <Button color="primary" onPress={onOpen} className="shape-full font-medium" startContent={<span className="text-lg">+</span>}>
                                        セクション追加
                                    </Button>
                                </div>

                                <div className="spacing-4">
                                    {sections.map((section, index) => (
                                        <Card key={section.id} className="card-elevated surface-container-lowest group hover:shadow-[var(--md-sys-elevation-3)] transition-all duration-300">
                                            <CardBody className="p-base">
                                                <div className="flex flex-col md:flex-row spacing-6">
                                                    {/* 左側：インデックス・操作 */}
                                                    <div className="flex md:flex-col items-center justify-between md:justify-start spacing-3 md:w-16 md:border-r border-[var(--md-sys-color-outline-variant)] md:pr-4">
                                                        <div className="flex items-center justify-center w-10 h-10 shape-full bg-primary/20 text-primary font-bold elevated-1">
                                                            {index + 1}
                                                        </div>
                                                        <div className="flex md:flex-col spacing-2">
                                                            <Tooltip content="編集">
                                                                <Button
                                                                    isIconOnly
                                                                    size="sm"
                                                                    variant="light"
                                                                    className="text-foreground-muted hover:text-primary"
                                                                    onPress={() => handleEditOpen(section)}
                                                                >
                                                                    ✎
                                                                </Button>
                                                            </Tooltip>
                                                            <Tooltip content="削除">
                                                                <Button
                                                                    isIconOnly
                                                                    size="sm"
                                                                    variant="light"
                                                                    color="danger"
                                                                    className="opacity-0 group-hover:opacity-100 transition-opacity"
                                                                    onPress={() => handleDeleteOpen(section)}
                                                                >
                                                                    ✕
                                                                </Button>
                                                            </Tooltip>
                                                        </div>
                                                    </div>

                                                    {/* 右側：コンテンツ */}
                                                    <div className="flex-1 spacing-4">
                                                        <div>
                                                            <div className="flex items-center justify-between mb-2">
                                                                <span className="label-medium text-primary/80 uppercase" style={{ letterSpacing: '0.05em' }}>台本・ナレーション</span>
                                                                <Button
                                                                    size="sm"
                                                                    variant="flat"
                                                                    className="h-6 text-xs bg-primary/10 text-primary"
                                                                    onPress={() => handleProposalOpen(section)}
                                                                >
                                                                    推考提案
                                                                </Button>
                                                            </div>
                                                            <p className="body-medium text-foreground/90 whitespace-pre-wrap p-3 surface-container shape-md border border-[var(--md-sys-color-outline-variant)]" style={{ lineHeight: '1.75' }}>
                                                                {section.content}
                                                            </p>
                                                        </div>
                                                        {section.imageInstruction && (
                                                            <div>
                                                                <span className="label-medium text-secondary/80 uppercase block mb-2" style={{ letterSpacing: '0.05em' }}>画像指示</span>
                                                                <div className="body-medium text-foreground-muted surface-container/30 p-3 shape-md border border-dashed border-[var(--md-sys-color-outline-variant)] italic">
                                                                    {section.imageInstruction}
                                                                </div>
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>
                                            </CardBody>
                                        </Card>
                                    ))}

                                    {sections.length === 0 && (
                                        <div className="text-center py-16 dashed-border rounded-xl bg-surface/20">
                                            <p className="text-foreground-muted">セクションがまだありません</p>
                                            <Button variant="light" color="primary" onPress={onOpen} className="mt-2">
                                                最初のセクションを追加する
                                            </Button>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </Tab>

                        {/* 2. 画像UP */}
                        <Tab key="images" title="2. 画像UP">
                            <div className="p-6 space-y-6">
                                <div className="bg-gradient-to-r from-primary/10 to-transparent p-4 rounded-xl border border-primary/10 flex items-center justify-between">
                                    <div>
                                        <h2 className="text-lg font-bold text-primary">画像アップロード</h2>
                                        <p className="text-sm text-foreground-muted">各セクションに適した画像をアップロードしてください（+100pt/枚）</p>
                                    </div>
                                    <div className="text-right">
                                        <span className="text-xs text-foreground-muted block">現在の獲得ポイント</span>
                                        <span className="text-xl font-bold text-primary">{uploadedImages.length * 100} pt</span>
                                    </div>
                                </div>

                                <div
                                    className="border-2 border-dashed border-primary/20 rounded-2xl p-12 text-center hover:bg-primary/5 transition-colors cursor-pointer group"
                                    onClick={handleImageUploadClick}
                                >
                                    <input
                                        type="file"
                                        ref={fileInputRef}
                                        onChange={handleFileSelect}
                                        className="hidden"
                                        accept="image/png, image/jpeg, image/webp, image/gif"
                                    />
                                    {uploading ? (
                                        <div className="flex flex-col items-center justify-center gap-4">
                                            <Progress size="sm" isIndeterminate color="primary" className="max-w-xs" />
                                            <p className="text-sm text-primary animate-pulse">アップロード中...</p>
                                        </div>
                                    ) : (
                                        <>
                                            <div className="w-16 h-16 bg-primary/10 text-primary rounded-full flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform">
                                                ↑
                                            </div>
                                            <h3 className="text-lg font-semibold mb-2">クリックして画像をアップロード</h3>
                                            <p className="text-sm text-foreground-muted">
                                                またはここにファイルをドラッグ＆ドロップ<br />
                                                (.jpg, .png, .webp 対応)
                                            </p>
                                        </>
                                    )}
                                </div>

                                <Divider className="my-4" />

                                <h3 className="font-semibold text-lg">アップロード済み画像</h3>
                                <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">
                                    {uploadedImages.map((img) => (
                                        <div key={img.id} className="relative group aspect-video rounded-lg overflow-hidden border border-white/10 bg-black/20">
                                            <Image
                                                src={img.url}
                                                alt="Uploaded"
                                                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                                            />
                                            <div className="absolute bottom-0 left-0 right-0 bg-black/60 p-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                                <p className="text-xs text-white truncate">By {img.uploadedBy}</p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </Tab>

                        {/* 3. 画像採用 */}
                        <Tab key="selection" title="3. 画像採用">
                            <div className="p-6 space-y-6">
                                <h2 className="text-lg font-bold mb-4">最終画像の選定</h2>
                                <p className="text-sm text-foreground-muted mb-6">
                                    各セクションに使用する画像を選んでください。選択した画像はダウンロードタブから一括取得できます。
                                </p>
                                {sections.map((section, idx) => (
                                    <div key={section.id} className="mb-8 p-4 rounded-xl bg-surface/30 border border-white/5">
                                        <div className="mb-4">
                                            <h3 className="font-semibold border-l-4 border-primary pl-3">
                                                セクション {idx + 1}: {section.content.substring(0, 20)}...
                                            </h3>
                                            <p className="text-sm text-foreground-muted mt-1 ml-4">
                                                指示: {section.imageInstruction || "なし"}
                                            </p>
                                            {sectionImageMap[section.id] && (
                                                <Chip color="success" size="sm" className="ml-4 mt-2">
                                                    画像選択済み
                                                </Chip>
                                            )}
                                        </div>

                                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 ml-4">
                                            {uploadedImages.filter(img => !img.sectionId || img.sectionId === section.id).map((img) => (
                                                <div
                                                    key={img.id}
                                                    className={`
                                                        relative rounded-lg overflow-hidden cursor-pointer border-2 transition-all
                                                        ${sectionImageMap[section.id] === img.id ? 'border-secondary ring-2 ring-secondary/30' : 'border-transparent hover:border-primary/50'}
                                                    `}
                                                    onClick={() => handleImageSelection(section.id, img.id)}
                                                >
                                                    <div className="aspect-video bg-black/20">
                                                        <Image src={img.url} className="w-full h-full object-cover" />
                                                    </div>
                                                    {sectionImageMap[section.id] === img.id && (
                                                        <div className="absolute inset-0 bg-secondary/20 flex items-center justify-center">
                                                            <Chip color="secondary" variant="shadow">採用</Chip>
                                                        </div>
                                                    )}
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </Tab>

                        {/* 4. ダウンロード */}
                        <Tab key="download" title="4. ダウンロード">
                            <div className="p-12 text-center space-y-8">
                                <div>
                                    <h2 className="text-2xl font-bold mb-2">プロジェクト完成</h2>
                                    <p className="text-foreground-muted">全ての素材が揃いました。以下からダウンロードできます。</p>
                                </div>

                                <div className="flex flex-col md:flex-row justify-center gap-6">
                                    <Card className="max-w-xs w-full card-gradient hover:-translate-y-1 transition-transform">
                                        <CardBody className="p-8 text-center space-y-4">
                                            <div className="w-16 h-16 bg-primary/20 rounded-full flex items-center justify-center mx-auto text-2xl">
                                                📄
                                            </div>
                                            <h3 className="font-bold">台本データ</h3>
                                            <Button
                                                color="primary"
                                                variant="ghost"
                                                className="w-full"
                                                onPress={handleDownloadScript}
                                            >
                                                .txt でダウンロード
                                            </Button>
                                        </CardBody>
                                    </Card>

                                    <Card className="max-w-xs w-full card-gradient hover:-translate-y-1 transition-transform">
                                        <CardBody className="p-8 text-center space-y-4">
                                            <div className="w-16 h-16 bg-secondary/20 rounded-full flex items-center justify-center mx-auto text-2xl">
                                                🖼️
                                            </div>
                                            <h3 className="font-bold">画像一式</h3>
                                            <Button
                                                color="secondary"
                                                variant="ghost"
                                                className="w-full"
                                                onPress={handleDownloadImagesZip}
                                            >
                                                .zip でダウンロード
                                            </Button>
                                        </CardBody>
                                    </Card>

                                    <Card className="max-w-xs w-full card-gradient hover:-translate-y-1 transition-transform">
                                        <CardBody className="p-8 text-center space-y-4">
                                            <div className="w-16 h-16 bg-success/20 rounded-full flex items-center justify-center mx-auto text-2xl">
                                                🎬
                                            </div>
                                            <h3 className="font-bold">プロジェクト全体</h3>
                                            <Button
                                                color="success"
                                                variant="shadow"
                                                className="w-full text-white"
                                                onPress={handleDownloadAll}
                                            >
                                                一括ダウンロード
                                            </Button>
                                        </CardBody>
                                    </Card>
                                </div>
                            </div>
                        </Tab>
                    </Tabs>
                </CardBody>
            </Card>

            {/* セクション追加モーダル */}
            <Modal isOpen={isOpen} onOpenChange={onOpenChange} backdrop="blur">
                <ModalContent>
                    {(onClose) => (
                        <>
                            <ModalHeader className="flex flex-col gap-1">
                                新しいセクションを追加
                                <span className="text-xs font-normal text-foreground-muted">動画の新しいシーンを定義します</span>
                            </ModalHeader>
                            <ModalBody>
                                <Textarea
                                    label="コンテンツ（台本・ナレーション）"
                                    placeholder="例：ここでタイトルが表示され、BGMが盛り上がる..."
                                    value={newContent}
                                    onValueChange={setNewContent}
                                    variant="bordered"
                                    minRows={3}
                                />
                                <Textarea
                                    label="画像指示（任意）"
                                    placeholder="例：明るい未来をイメージさせる抽象的な背景..."
                                    value={newImageInstruction}
                                    onValueChange={setNewImageInstruction}
                                    variant="bordered"
                                    minRows={2}
                                />
                            </ModalBody>
                            <ModalFooter>
                                <Button color="danger" variant="light" onPress={onClose}>
                                    キャンセル
                                </Button>
                                <Button
                                    color="primary"
                                    onPress={handleAddSection}
                                    isLoading={isSubmitting}
                                    className="font-bold"
                                >
                                    追加する
                                </Button>
                            </ModalFooter>
                        </>
                    )}
                </ModalContent>
            </Modal>

            {/* セクション編集モーダル */}
            <Modal isOpen={isEditOpen} onOpenChange={onEditOpenChange} backdrop="blur">
                <ModalContent>
                    {(onClose) => (
                        <>
                            <ModalHeader className="flex flex-col gap-1">
                                セクションを編集
                            </ModalHeader>
                            <ModalBody>
                                <Textarea
                                    label="コンテンツ（台本・ナレーション）"
                                    value={editContent}
                                    onValueChange={setEditContent}
                                    variant="bordered"
                                    minRows={3}
                                />
                                <Textarea
                                    label="画像指示（任意）"
                                    value={editImageInstruction}
                                    onValueChange={setEditImageInstruction}
                                    variant="bordered"
                                    minRows={2}
                                />
                            </ModalBody>
                            <ModalFooter>
                                <Button color="danger" variant="light" onPress={onClose}>
                                    キャンセル
                                </Button>
                                <Button
                                    color="primary"
                                    onPress={handleEditSave}
                                    isLoading={isSubmitting}
                                    className="font-bold"
                                >
                                    保存
                                </Button>
                            </ModalFooter>
                        </>
                    )}
                </ModalContent>
            </Modal>

            {/* セクション削除確認モーダル */}
            <Modal isOpen={isDeleteOpen} onOpenChange={onDeleteOpenChange} backdrop="blur">
                <ModalContent>
                    {(onClose) => (
                        <>
                            <ModalHeader className="flex flex-col gap-1">
                                セクションを削除
                            </ModalHeader>
                            <ModalBody>
                                <p>このセクションを削除してもよろしいですか？</p>
                                <p className="text-sm text-foreground-muted">この操作は取り消せません。</p>
                            </ModalBody>
                            <ModalFooter>
                                <Button variant="light" onPress={onClose}>
                                    キャンセル
                                </Button>
                                <Button
                                    color="danger"
                                    onPress={handleDeleteConfirm}
                                    isLoading={isSubmitting}
                                >
                                    削除する
                                </Button>
                            </ModalFooter>
                        </>
                    )}
                </ModalContent>
            </Modal>

            {/* 推敲提案モーダル */}
            <Modal isOpen={isProposalOpen} onOpenChange={onProposalOpenChange} backdrop="blur" size="2xl">
                <ModalContent>
                    {(onClose) => (
                        <>
                            <ModalHeader className="flex flex-col gap-1">
                                推敲提案
                                <span className="text-xs font-normal text-foreground-muted">
                                    このセクションの改善案を提案できます
                                </span>
                            </ModalHeader>
                            <ModalBody className="max-h-[60vh] overflow-y-auto">
                                {/* 現在のコンテンツ */}
                                <div className="mb-4">
                                    <p className="text-xs font-semibold text-primary/80 uppercase tracking-wider mb-2">現在のコンテンツ</p>
                                    <div className="text-sm bg-surface/30 p-3 rounded-lg border border-white/10">
                                        {proposalSection?.content}
                                    </div>
                                </div>

                                {/* 新しい提案入力 */}
                                <Textarea
                                    label="改善案を入力"
                                    placeholder="改善したコンテンツを入力してください..."
                                    value={proposalContent}
                                    onValueChange={setProposalContent}
                                    variant="bordered"
                                    minRows={4}
                                />
                                <Button
                                    color="primary"
                                    onPress={handleProposalSubmit}
                                    isLoading={isSubmitting}
                                    className="w-full"
                                >
                                    提案を送信
                                </Button>

                                <Divider className="my-4" />

                                {/* 既存の提案一覧 */}
                                <p className="text-xs font-semibold text-primary/80 uppercase tracking-wider mb-2">過去の提案</p>
                                {loadingProposals ? (
                                    <div className="flex justify-center py-4">
                                        <Spinner size="sm" />
                                    </div>
                                ) : proposals.length === 0 ? (
                                    <p className="text-sm text-foreground-muted text-center py-4">まだ提案はありません</p>
                                ) : (
                                    <div className="space-y-3">
                                        {proposals.map((proposal) => (
                                            <Card key={proposal.id} className="card-outlined">
                                                <CardBody className="p-4">
                                                    <div className="flex justify-between items-start mb-2">
                                                        <Chip
                                                            size="sm"
                                                            color={
                                                                proposal.status === "approved" ? "success" :
                                                                    proposal.status === "rejected" ? "danger" : "warning"
                                                            }
                                                            variant="flat"
                                                        >
                                                            {proposal.status === "approved" ? "承認済み" :
                                                                proposal.status === "rejected" ? "却下" : "保留中"}
                                                        </Chip>
                                                        <span className="text-xs text-foreground-muted">
                                                            {new Date(proposal.createdAt).toLocaleDateString('ja-JP')}
                                                        </span>
                                                    </div>
                                                    <p className="text-sm whitespace-pre-wrap">{proposal.proposedContent}</p>

                                                    {/* 儀長のみ承認/却下ボタンを表示 */}
                                                    {isGicho && proposal.status === "pending" && (
                                                        <div className="flex gap-2 mt-3">
                                                            <Button
                                                                size="sm"
                                                                color="success"
                                                                variant="flat"
                                                                onPress={() => handleApproveProposal(proposal.id)}
                                                                isDisabled={isSubmitting}
                                                            >
                                                                承認・適用
                                                            </Button>
                                                            <Button
                                                                size="sm"
                                                                color="danger"
                                                                variant="flat"
                                                                onPress={() => handleRejectProposal(proposal.id)}
                                                                isDisabled={isSubmitting}
                                                            >
                                                                却下
                                                            </Button>
                                                        </div>
                                                    )}
                                                </CardBody>
                                            </Card>
                                        ))}
                                    </div>
                                )}
                            </ModalBody>
                            <ModalFooter>
                                <Button variant="light" onPress={onClose}>
                                    閉じる
                                </Button>
                            </ModalFooter>
                        </>
                    )}
                </ModalContent>
            </Modal>
        </div>
    );
}
