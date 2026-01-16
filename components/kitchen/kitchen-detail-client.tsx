"use client";

import {
    Card, CardBody, CardHeader, Button, Tabs, Tab, Chip,
    useDisclosure, Modal, ModalContent, ModalHeader, ModalBody, ModalFooter,
    Input, Textarea, Divider, Tooltip, Image, Progress, Spinner, Checkbox
} from "@heroui/react";
import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import {
    updateCookingSection,
    deleteCookingSection,
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
    getCookingSections
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

    // 編集モーダル
    const { isOpen: isEditOpen, onOpen: onEditOpen, onClose: onEditClose } = useDisclosure();
    const [editingSection, setEditingSection] = useState<Section | null>(null);
    const [editContent, setEditContent] = useState("");
    const [editImageInstruction, setEditImageInstruction] = useState("");
    const [editAllowSubmission, setEditAllowSubmission] = useState(true);

    // 推敲提案モーダル
    const { isOpen: isProposalOpen, onOpen: onProposalOpen, onClose: onProposalClose } = useDisclosure();
    const [proposalSection, setProposalSection] = useState<Section | null>(null);
    const [proposalContent, setProposalContent] = useState("");

    // 画像アップロード
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [uploadingSection, setUploadingSection] = useState<string | null>(null);
    const [uploadProgress, setUploadProgress] = useState(0);

    const isGicho = userRole === "gicho";

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

        await updateCookingSection(
            editingSection.id,
            editContent,
            editImageInstruction,
            editAllowSubmission
        );

        await reloadSections();
        onEditClose();
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
        setUploadProgress(0);

        try {
            const { url, key } = await getUploadUrl(file.name, file.type, project.id);

            // R2にアップロード
            const response = await fetch(url, {
                method: 'PUT',
                body: file,
                headers: { 'Content-Type': file.type }
            });

            if (response.ok) {
                setUploadProgress(50);
                await confirmImageUpload(project.id, key, sectionId);
                setUploadProgress(100);
                await loadImages();
            } else {
                throw new Error("Upload failed");
            }
        } catch (error) {
            console.error("Upload error:", error);
            alert("画像のアップロードに失敗しました");
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
        <div className="max-w-7xl mx-auto space-y-6">
            {/* ヘッダー */}
            <div className="flex items-start justify-between">
                <div>
                    <Button
                        variant="light"
                        size="sm"
                        onPress={() => router.push('/cooking')}
                        className="mb-2"
                    >
                        ← 料理一覧に戻る
                    </Button>
                    <h1 className="text-3xl font-bold">{project.title}</h1>
                    {project.description && (
                        <p className="text-foreground-muted mt-1">{project.description}</p>
                    )}
                </div>
                <Chip color="primary" variant="flat">
                    {sections.length} セクション
                </Chip>
            </div>

            {/* タブ */}
            <Tabs
                selectedKey={selectedTab}
                onSelectionChange={(key) => setSelectedTab(key as string)}
                variant="underlined"
                color="primary"
            >
                {/* 1. 調理タブ */}
                <Tab key="cooking" title="1. 調理">
                    <Card className="mt-4">
                        <CardBody className="space-y-4">
                            {sections.map((section, index) => (
                                <div key={section.id}>
                                    <Card>
                                        <CardHeader className="flex justify-between">
                                            <div className="flex items-center gap-2">
                                                <Chip size="sm" variant="flat">セクション {index + 1}</Chip>
                                                {!section.allowImageSubmission && (
                                                    <Chip size="sm" color="warning" variant="flat">
                                                        画像提出なし
                                                    </Chip>
                                                )}
                                            </div>
                                            <div className="flex gap-2">
                                                {isGicho && (
                                                    <Button
                                                        size="sm"
                                                        color="primary"
                                                        variant="flat"
                                                        onPress={() => handleEditSection(section)}
                                                    >
                                                        編集
                                                    </Button>
                                                )}
                                                {!isGicho && (
                                                    <Button
                                                        size="sm"
                                                        color="secondary"
                                                        variant="flat"
                                                        onPress={() => handleOpenProposal(section)}
                                                    >
                                                        推敲提案
                                                    </Button>
                                                )}
                                            </div>
                                        </CardHeader>
                                        <CardBody className="space-y-2">
                                            <div className="whitespace-pre-wrap">{section.content}</div>
                                            {section.imageInstruction && (
                                                <div className="border-l-4 border-primary pl-3 py-2">
                                                    <p className="text-sm font-semibold text-primary">画像指示:</p>
                                                    <p className="text-sm">{section.imageInstruction}</p>
                                                </div>
                                            )}
                                        </CardBody>
                                    </Card>

                                    {/* このセクションの推敲提案 */}
                                    {isGicho && proposals.filter(p => p.sectionId === section.id && p.status === "pending").map((proposal) => (
                                        <Card key={proposal.id} className="mt-2 border-2 border-warning">
                                            <CardHeader>
                                                <Chip color="warning" variant="flat">推敲提案</Chip>
                                            </CardHeader>
                                            <CardBody className="space-y-2">
                                                <div className="whitespace-pre-wrap">{proposal.proposedContent}</div>
                                                <div className="flex gap-2 justify-end">
                                                    <Button
                                                        size="sm"
                                                        color="success"
                                                        onPress={() => handleApproveProposal(proposal.id)}
                                                    >
                                                        承認
                                                    </Button>
                                                    <Button
                                                        size="sm"
                                                        color="danger"
                                                        variant="flat"
                                                        onPress={() => handleRejectProposal(proposal.id)}
                                                    >
                                                        却下
                                                    </Button>
                                                </div>
                                            </CardBody>
                                        </Card>
                                    ))}

                                    {index < sections.length - 1 && <Divider className="my-4" />}
                                </div>
                            ))}
                        </CardBody>
                    </Card>
                </Tab>

                {/* 2. 画像UPタブ */}
                <Tab key="image-upload" title="2. 画像UP">
                    <Card className="mt-4">
                        <CardBody className="space-y-6">
                            {sections.filter(s => s.allowImageSubmission ?? true).map((section, index) => (
                                <div key={section.id}>
                                    <Card>
                                        <CardHeader>
                                            <div className="flex items-center gap-2">
                                                <Chip size="sm" variant="flat">セクション {sections.indexOf(section) + 1}</Chip>
                                            </div>
                                        </CardHeader>
                                        <CardBody className="space-y-4">
                                            <div className="whitespace-pre-wrap text-sm">{section.content}</div>

                                            {section.imageInstruction && (
                                                <div className="border-l-4 border-primary pl-3 py-2">
                                                    <p className="text-sm font-semibold text-primary">画像指示:</p>
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
                                                        if (file) {
                                                            handleImageUpload(section.id, file);
                                                        }
                                                        e.target.value = '';
                                                    }}
                                                    className="hidden"
                                                    id={`file-input-${section.id}`}
                                                />
                                                <label htmlFor={`file-input-${section.id}`}>
                                                    <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center cursor-pointer hover:border-primary transition">
                                                        {uploadingSection === section.id ? (
                                                            <div className="space-y-2">
                                                                <Spinner size="sm" />
                                                                <p className="text-sm">アップロード中... {uploadProgress}%</p>
                                                            </div>
                                                        ) : (
                                                            <div>
                                                                <p className="text-sm font-semibold">クリックして画像アップロード</p>
                                                                <p className="text-xs text-foreground-muted">jpg, png, gif対応</p>
                                                            </div>
                                                        )}
                                                    </div>
                                                </label>
                                            </div>

                                            {/* このセクションの画像一覧 */}
                                            <div className="grid grid-cols-3 gap-2">
                                                {images.filter(img => img.sectionId === section.id).map((img) => (
                                                    <div key={img.id} className="relative">
                                                        <Image
                                                            src={img.imageUrl}
                                                            alt="uploaded"
                                                            className="w-full h-32 object-cover rounded"
                                                        />
                                                    </div>
                                                ))}
                                            </div>
                                        </CardBody>
                                    </Card>
                                    {index < sections.filter(s => s.allowImageSubmission ?? true).length - 1 && <Divider className="my-4" />}
                                </div>
                            ))}

                            {sections.filter(s => s.allowImageSubmission ?? true).length === 0 && (
                                <p className="text-center text-foreground-muted">画像提出が許可されているセクションがありません</p>
                            )}
                        </CardBody>
                    </Card>
                </Tab>

                {/* 3. 画像採用タブ */}
                <Tab key="image-selection" title="3. 画像採用">
                    <Card className="mt-4">
                        <CardBody className="space-y-6">
                            {sections.map((section, index) => {
                                const sectionImages = images.filter(img => img.sectionId === section.id);
                                return (
                                    <div key={section.id}>
                                        <Card>
                                            <CardHeader>
                                                <Chip size="sm" variant="flat">セクション {index + 1}</Chip>
                                            </CardHeader>
                                            <CardBody className="space-y-4">
                                                <div className="whitespace-pre-wrap text-sm">{section.content}</div>

                                                {sectionImages.length > 0 ? (
                                                    <div className="grid grid-cols-4 gap-3">
                                                        {sectionImages.map((img) => (
                                                            <div
                                                                key={img.id}
                                                                className={`relative cursor-pointer border-2 rounded-lg overflow-hidden transition ${img.isSelected ? 'border-primary' : 'border-transparent'
                                                                    }`}
                                                                onClick={() => handleToggleImageSelection(img.id, section.id)}
                                                            >
                                                                <Image
                                                                    src={img.imageUrl}
                                                                    alt="section image"
                                                                    className="w-full h-32 object-cover"
                                                                />
                                                                {img.isSelected && (
                                                                    <div className="absolute top-2 right-2 bg-primary text-white rounded-full p-1">
                                                                        ✓
                                                                    </div>
                                                                )}
                                                            </div>
                                                        ))}
                                                    </div>
                                                ) : (
                                                    <p className="text-sm text-foreground-muted">まだ画像がアップロードされていません</p>
                                                )}
                                            </CardBody>
                                        </Card>
                                        {index < sections.length - 1 && <Divider className="my-4" />}
                                    </div>
                                );
                            })}
                        </CardBody>
                    </Card>
                </Tab>

                {/* 4. ダウンロードタブ */}
                <Tab key="download" title="4. ダウンロード">
                    <Card className="mt-4">
                        <CardBody className="space-y-4">
                            <Button color="primary" onPress={handleDownloadScript}>
                                台本をダウンロード (.txt)
                            </Button>
                            <Button color="primary" variant="flat" onPress={handleDownloadImagesZip}>
                                選択画像をダウンロード (.zip)
                            </Button>
                        </CardBody>
                    </Card>
                </Tab>
            </Tabs>

            {/* セクション編集モーダル */}
            <Modal isOpen={isEditOpen} onClose={onEditClose} size="3xl">
                <ModalContent>
                    <ModalHeader>セクション編集</ModalHeader>
                    <ModalBody className="space-y-4">
                        <Textarea
                            label="セクション内容"
                            value={editContent}
                            onValueChange={setEditContent}
                            minRows={5}
                        />
                        <Textarea
                            label="画像指示"
                            value={editImageInstruction}
                            onValueChange={setEditImageInstruction}
                            placeholder="儀員に対する画像の指示を入力"
                            minRows={3}
                        />
                        <Checkbox
                            isSelected={editAllowSubmission}
                            onValueChange={setEditAllowSubmission}
                        >
                            儀員の画像提出を許可
                        </Checkbox>
                    </ModalBody>
                    <ModalFooter>
                        <Button variant="light" onPress={onEditClose}>
                            キャンセル
                        </Button>
                        <Button color="primary" onPress={handleSaveEdit}>
                            保存
                        </Button>
                    </ModalFooter>
                </ModalContent>
            </Modal>

            {/* 推敲提案モーダル */}
            <Modal isOpen={isProposalOpen} onClose={onProposalClose} size="3xl">
                <ModalContent>
                    <ModalHeader>推敲提案</ModalHeader>
                    <ModalBody className="space-y-4">
                        <div>
                            <p className="text-sm font-semibold mb-2">現在の内容:</p>
                            <div className="bg-gray-100 rounded p-3 text-sm whitespace-pre-wrap">
                                {proposalSection?.content}
                            </div>
                        </div>
                        <Textarea
                            label="提案内容"
                            value={proposalContent}
                            onValueChange={setProposalContent}
                            minRows={5}
                        />
                    </ModalBody>
                    <ModalFooter>
                        <Button variant="light" onPress={onProposalClose}>
                            キャンセル
                        </Button>
                        <Button color="primary" onPress={handleSubmitProposal}>
                            送信
                        </Button>
                    </ModalFooter>
                </ModalContent>
            </Modal>
        </div>
    );
}
