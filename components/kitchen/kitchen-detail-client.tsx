"use client";

import {
    Card, CardBody, CardHeader, Button, Tabs, Tab, Chip,
    useDisclosure, Modal, ModalContent, ModalHeader, ModalBody, ModalFooter,
    Input, Textarea, Divider, User, Tooltip, Image, Progress
} from "@heroui/react";
import Link from "next/link";
import { useState } from "react";
import { createCookingSection, updateCookingSection } from "@/app/actions/kitchen";

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

type UploadedImage = {
    id: string;
    url: string;
    uploadedBy: string;
    points: number;
};

export default function KitchenDetailClient({ project, initialSections }: { project: Project, initialSections: Section[] }) {
    const [sections, setSections] = useState<Section[]>(initialSections);
    const { isOpen, onOpen, onOpenChange } = useDisclosure();
    const [newContent, setNewContent] = useState("");
    const [newImageInstruction, setNewImageInstruction] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);

    // 画像アップロード用State
    const [uploadedImages, setUploadedImages] = useState<UploadedImage[]>([]);
    const [uploading, setUploading] = useState(false);

    // 画像採用用State
    const [selectedImageId, setSelectedImageId] = useState<string | null>(null);

    // セクション追加ハンドラー
    const handleAddSection = async () => {
        setIsSubmitting(true);
        try {
            // Server Action呼び出し
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

    // 画像アップロードハンドラー（現在はまだMock的な挙動だがUIは実装済み）
    const handleImageUpload = () => {
        setUploading(true);
        // TODO: R2連携の実装
        setTimeout(() => {
            const newImage: UploadedImage = {
                id: `img-${Date.now()}`,
                url: "https://placehold.co/600x400/B3424A/FFF/png?text=New+Image",
                uploadedBy: "Current User",
                points: 100
            };
            setUploadedImages([...uploadedImages, newImage]);
            setUploading(false);
            alert("アップロード完了！100ポイント獲得しました。");
        }, 1500);
    };

    return (
        <div className="max-w-7xl mx-auto space-y-6 pb-20">
            {/* ヘッダー */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <Link href="/kitchen" className="text-sm text-primary hover:underline mb-2 inline-block transition-colors">
                        ← 台所に戻る
                    </Link>
                    <h1 className="text-3xl font-bold text-foreground tracking-tight">{project.title}</h1>
                    {project.description && (
                        <p className="text-foreground-muted mt-1 text-sm">{project.description}</p>
                    )}
                </div>
                <div className="flex items-center gap-3">
                    <Chip color="warning" variant="flat" className="font-medium">調理中</Chip>
                    <div className="text-right hidden md:block">
                        <p className="text-xs text-foreground-muted">Project ID</p>
                        <p className="text-sm font-mono">{project.id}</p>
                    </div>
                </div>
            </div>

            {/* メインタブエリア */}
            <Card className="card-gradient shadow-sm border border-white/20">
                <CardBody className="p-0">
                    <Tabs aria-label="料理管理タブ" variant="underlined" classNames={{
                        tabList: "w-full border-b border-white/10 px-6 pt-2 bg-white/5",
                        cursor: "w-full bg-primary h-0.5",
                        tab: "max-w-fit px-6 h-12 text-foreground-muted hover:text-foreground transition-colors",
                        tabContent: "group-data-[selected=true]:text-primary font-medium"
                    }}>
                        {/* 1. 調理（セクション管理・推敲） */}
                        <Tab key="cooking" title="1. 調理">
                            <div className="p-6 space-y-6">
                                <div className="flex items-center justify-between bg-primary/5 p-4 rounded-xl border border-primary/10">
                                    <div>
                                        <h2 className="text-lg font-bold text-primary">セクション構成</h2>
                                        <p className="text-xs text-foreground-muted">動画の構成要素（台本・指示）を管理します</p>
                                    </div>
                                    <Button color="primary" onPress={onOpen} startContent={<span className="text-lg">+</span>}>
                                        セクション追加
                                    </Button>
                                </div>

                                <div className="space-y-4">
                                    {sections.map((section, index) => (
                                        <Card key={section.id} className="group hover:border-primary/30 transition-all duration-300 border border-transparent shadow-sm bg-surface/50">
                                            <CardBody className="p-5">
                                                <div className="flex flex-col md:flex-row gap-6">
                                                    {/* 左側：インデックス・操作 */}
                                                    <div className="flex md:flex-col items-center justify-between md:justify-start gap-3 md:w-16 md:border-r border-white/10 md:pr-4">
                                                        <div className="flex items-center justify-center w-8 h-8 rounded-full bg-primary/10 text-primary font-bold">
                                                            {index + 1}
                                                        </div>
                                                        <div className="flex md:flex-col gap-1">
                                                            <Tooltip content="編集">
                                                                <Button isIconOnly size="sm" variant="light" className="text-foreground-muted hover:text-primary">
                                                                    ✎
                                                                </Button>
                                                            </Tooltip>
                                                            <Tooltip content="削除">
                                                                <Button isIconOnly size="sm" variant="light" color="danger" className="opacity-0 group-hover:opacity-100 transition-opacity">
                                                                    ✕
                                                                </Button>
                                                            </Tooltip>
                                                        </div>
                                                    </div>

                                                    {/* 右側：コンテンツ */}
                                                    <div className="flex-1 space-y-4">
                                                        <div>
                                                            <div className="flex items-center justify-between mb-2">
                                                                <span className="text-xs font-semibold text-primary/80 uppercase tracking-wider">台本・ナレーション</span>
                                                                <Button size="sm" variant="flat" className="h-6 text-xs bg-primary/10 text-primary">
                                                                    推敲提案
                                                                </Button>
                                                            </div>
                                                            <p className="text-sm text-foreground/90 whitespace-pre-wrap leading-relaxed p-3 bg-surface rounded-lg border border-white/5">
                                                                {section.content}
                                                            </p>
                                                        </div>
                                                        {section.imageInstruction && (
                                                            <div>
                                                                <span className="text-xs font-semibold text-secondary/80 uppercase tracking-wider block mb-2">画像指示</span>
                                                                <div className="text-sm text-foreground-muted bg-surface/30 p-3 rounded-lg border border-dashed border-white/20 italic">
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

                                {/* Upload Area */}
                                <div
                                    className="border-2 border-dashed border-primary/20 rounded-2xl p-12 text-center hover:bg-primary/5 transition-colors cursor-pointer group"
                                    onClick={handleImageUpload}
                                >
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
                                {sections.map((section, idx) => (
                                    <div key={section.id} className="mb-8 p-4 rounded-xl bg-surface/30 border border-white/5">
                                        <div className="mb-4">
                                            <h3 className="font-semibold border-l-4 border-primary pl-3">
                                                セクション {idx + 1}: {section.content.substring(0, 20)}...
                                            </h3>
                                            <p className="text-sm text-foreground-muted mt-1 ml-4">
                                                指示: {section.imageInstruction || "なし"}
                                            </p>
                                        </div>

                                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 ml-4">
                                            {uploadedImages.map((img) => (
                                                <div
                                                    key={`${section.id}-${img.id}`}
                                                    className={`
                                                        relative rounded-lg overflow-hidden cursor-pointer border-2 transition-all
                                                        ${selectedImageId === `${section.id}-${img.id}` ? 'border-secondary ring-2 ring-secondary/30' : 'border-transparent hover:border-primary/50'}
                                                    `}
                                                    onClick={() => setSelectedImageId(`${section.id}-${img.id}`)}
                                                >
                                                    <div className="aspect-video bg-black/20">
                                                        <Image src={img.url} className="w-full h-full object-cover" />
                                                    </div>
                                                    {selectedImageId === `${section.id}-${img.id}` && (
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
                                            <Button color="primary" variant="ghost" className="w-full">
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
                                            <Button color="secondary" variant="ghost" className="w-full">
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
                                            <Button color="success" variant="shadow" className="w-full text-white">
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
        </div>
    );
}
