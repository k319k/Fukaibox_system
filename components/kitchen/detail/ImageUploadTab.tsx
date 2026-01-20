"use client";

import { useState } from "react";
import { Button, Chip, Divider, Progress, Spinner } from "@heroui/react";
import { Icon } from "@iconify/react";
import { Section, UploadedImage } from "@/types/kitchen";
import ScriptViewerModal from "./ScriptViewerModal";

interface ImageUploadTabProps {
    sections: Section[];
    images: UploadedImage[];
    editorFontSize: number;
    uploadingSectionId: string | null;
    uploadProgress: number;
    uploaderNames: Record<string, string>;
    projectTitle: string;
    onAddSection: (index: number) => void;
    onDeleteSection: (id: string) => void;
    onImageUpload: (sectionId: string, file: File) => void;
    onDeleteImage: (imageId: string) => void;
    onOpenLightbox: (images: UploadedImage[], index: number) => void;
}

export default function ImageUploadTab({
    sections,
    images,
    editorFontSize,
    uploadingSectionId,
    uploadProgress,
    uploaderNames,
    projectTitle,
    onAddSection,
    onDeleteSection,
    onImageUpload,
    onDeleteImage,
    onOpenLightbox
}: ImageUploadTabProps) {
    const [isScriptViewerOpen, setIsScriptViewerOpen] = useState(false);
    if (sections.length === 0 || !sections.some(s => s.allowImageSubmission ?? true)) {
        return (
            <div className="flex flex-col items-center justify-center py-12 bg-default-50 rounded-lg">
                <Icon icon="mdi:camera-off" className="text-6xl text-default-300 mb-4" />
                <p className="text-foreground-muted">
                    {sections.length === 0
                        ? "まずは調理タブで台本を入力してください"
                        : "画像提出が許可されているセクションがありません"}
                </p>
            </div>
        );
    }

    return (
        <>
            {/* 原稿閲覧モーダル */}
            <ScriptViewerModal
                isOpen={isScriptViewerOpen}
                onClose={() => setIsScriptViewerOpen(false)}
                sections={sections}
                projectTitle={projectTitle}
            />

            <div className="space-y-8 pb-12">
                {/* 原稿を見るボタン */}
                <div className="flex justify-end gap-2 px-4">
                    <Button
                        color="secondary"
                        variant="flat"
                        startContent={<Icon icon="mdi:script-text-outline" />}
                        onPress={() => setIsScriptViewerOpen(true)}
                    >
                        原稿を見る
                    </Button>
                </div>
                {sections.filter(s => s.allowImageSubmission ?? true).map((section) => {
                    const sectionImages = images.filter(img => img.sectionId === section.id);
                    // 元の配列でのインデックスを探す（表示用）
                    const originalIndex = sections.findIndex(s => s.id === section.id);

                    return (
                        <div key={section.id} className="space-y-4">
                            {/* セクション挿入ボタン (上) */}
                            <div className="flex justify-center opacity-0 hover:opacity-100 transition-opacity">
                                <Button
                                    size="sm" variant="flat" color="primary" radius="full"
                                    startContent={<Icon icon="mdi:plus" />}
                                    onPress={() => onAddSection(originalIndex)}
                                >
                                    ここにセクションを追加
                                </Button>
                            </div>

                            <div className="bg-background rounded-lg shadow-md border border-default-100">
                                {/* ヘッダー部分 */}
                                <div className="p-4 flex flex-wrap justify-between items-center gap-2 border-b border-default-200 bg-default-50/50">
                                    <div className="flex flex-wrap items-center gap-2">
                                        <Chip size="sm" color="primary" variant="flat">
                                            <Icon icon="mdi:numeric" className="mr-1" />
                                            セクション {originalIndex + 1}
                                        </Chip>
                                        <Chip size="sm" color="secondary" variant="flat">
                                            <Icon icon="mdi:image-multiple" className="mr-1" />
                                            {sectionImages.length}枚
                                        </Chip>
                                        <Chip size="sm" color="success" variant="flat">
                                            <Icon icon="mdi:account-group" className="mr-1" />
                                            {new Set(sectionImages.map(img => img.uploadedBy)).size}人参加
                                        </Chip>
                                    </div>
                                    <Button
                                        size="sm" color="danger" variant="light" isIconOnly
                                        onPress={() => onDeleteSection(section.id)}
                                    >
                                        <Icon icon="mdi:trash-can-outline" />
                                    </Button>
                                </div>
                                {/* ボディ部分 */}
                                <div className="p-4 space-y-4">
                                    <div
                                        className="text-foreground-muted whitespace-pre-wrap"
                                        style={{ fontSize: `${editorFontSize}px`, lineHeight: 1.6 }}
                                    >
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

                                    {section.referenceImageUrl && (
                                        <div className="bg-default-100 p-3 rounded-lg">
                                            <p className="text-xs font-semibold text-foreground-muted mb-2">参考画像</p>
                                            {/* eslint-disable-next-line @next/next/no-img-element */}
                                            <img
                                                src={section.referenceImageUrl}
                                                alt="参考画像"
                                                className="max-h-40 max-w-full rounded border border-default-200 object-contain mx-auto"
                                            />
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
                                                if (file) onImageUpload(section.id, file);
                                                e.target.value = '';
                                            }}
                                            className="hidden"
                                            id={`file-input-${section.id}`}
                                        />
                                        <label htmlFor={`file-input-${section.id}`}>
                                            <div className={`border-2 border-dashed rounded-xl p-6 text-center cursor-pointer transition-all ${uploadingSectionId === section.id
                                                ? 'border-primary bg-primary/5'
                                                : 'border-default-300 hover:border-primary hover:bg-primary/5'
                                                }`}>
                                                {uploadingSectionId === section.id ? (
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
                                            {sectionImages.map((img, imgIndex) => {
                                                const isSelected = img.isSelected && img.sectionId === section.id;
                                                return (
                                                    <div key={img.id} className="relative group">
                                                        <div
                                                            className={`
                                                    relative aspect-square rounded-lg overflow-hidden cursor-pointer border-2 transition-all
                                                    ${isSelected
                                                                    ? "border-primary ring-4 ring-primary/30 shadow-lg scale-95"
                                                                    : "border-transparent hover:border-default-300"
                                                                }
                                                `}
                                                            onClick={() => onOpenLightbox(sectionImages, imgIndex)}
                                                        >
                                                            {/* eslint-disable-next-line @next/next/no-img-element */}
                                                            <img
                                                                src={img.imageUrl}
                                                                alt="uploaded"
                                                                className="w-full h-full object-cover"
                                                            />

                                                            {/* 選択インジケーター */}
                                                            {isSelected && (
                                                                <div className="absolute top-2 right-2 bg-[#73342b] text-[#ffdad5] p-1 rounded-full shadow-md z-10">
                                                                    <Icon icon="mdi:check-bold" className="text-lg" />
                                                                </div>
                                                            )}

                                                            {/* 拡大アイコン */}
                                                            <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity bg-black/30">
                                                                <Icon icon="mdi:magnify-plus" className="text-[#ffdad5] text-2xl" />
                                                            </div>
                                                        </div>

                                                        {/* 削除ボタン */}
                                                        <button
                                                            className="absolute -top-2 -left-2 bg-[#ffdad6] text-[#93000a] p-1.5 rounded-full shadow-md opacity-0 group-hover:opacity-100 transition-opacity z-20 hover:scale-110"
                                                            onClick={(e) => {
                                                                e.stopPropagation();
                                                                onDeleteImage(img.id);
                                                            }}
                                                            title="画像を削除"
                                                        >
                                                            <Icon icon="mdi:trash-can" className="text-sm" />
                                                        </button>

                                                        {/* 投稿者名 */}
                                                        <div className="mt-1 px-1">
                                                            <span className="text-xs text-foreground-muted truncate block max-w-full">
                                                                {uploaderNames[img.uploadedBy] || "User"}
                                                            </span>
                                                        </div>
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* 末尾挿入ボタン (最後のみ) */}
                            {originalIndex === sections.length - 1 && (
                                <div className="flex justify-center pt-4">
                                    <Button
                                        size="sm" variant="flat" color="primary" radius="full"
                                        startContent={<Icon icon="mdi:plus" />}
                                        onPress={() => onAddSection(originalIndex + 1)}
                                    >
                                        末尾にセクションを追加
                                    </Button>
                                </div>
                            )}
                        </div>
                    );
                })}
            </div>
        </>
    );
}
