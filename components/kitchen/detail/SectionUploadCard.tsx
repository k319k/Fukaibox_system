"use client";

import { Button, Tag, Divider, Progress, Spin } from "antd";
import { Icon } from "@iconify/react";
import { Section, UploadedImage } from "@/types/kitchen";
import { cn } from "@/lib/utils";

interface SectionUploadCardProps {
    section: Section;
    sectionImages: UploadedImage[];
    originalIndex: number;
    totalSections: number;
    editorFontSize: number;
    isUploading: boolean;
    uploadProgress: number;
    uploaderNames: Record<string, string>;
    isGicho: boolean;
    userRole: string;
    onAddSection: (index: number) => void;
    onDeleteSection: (id: string) => void;
    onImageUpload: (sectionId: string, files: File[]) => void;
    onDeleteImage: (imageId: string) => void;
    onOpenLightbox: (images: UploadedImage[], index: number) => void;
}

export default function SectionUploadCard({
    section,
    sectionImages,
    originalIndex,
    totalSections,
    editorFontSize,
    isUploading,
    uploadProgress,
    uploaderNames,
    isGicho,
    userRole,
    onAddSection,
    onDeleteSection,
    onImageUpload,
    onDeleteImage,
    onOpenLightbox
}: SectionUploadCardProps) {
    return (
        <div className="space-y-4">
            {isGicho && (
                <div className="flex justify-center opacity-0 hover:opacity-100 transition-opacity">
                    <Button
                        size="small"
                        shape="round"
                        icon={<Icon icon="material-symbols:add" />}
                        onClick={() => onAddSection(originalIndex)}
                        className="bg-[var(--md-sys-color-primary-container)] text-[var(--md-sys-color-on-primary-container)] border-none shadow-none"
                    >
                        ここにセクションを追加
                    </Button>
                </div>
            )}

            <div className="m3-card-filled p-0 overflow-hidden shadow-sm">
                <div className="p-4 flex flex-wrap justify-between items-center gap-2 border-b border-[var(--md-sys-color-outline-variant)] bg-[var(--md-sys-color-surface-container)]">
                    <div className="flex flex-wrap items-center gap-2">
                        <Tag className="rounded-full bg-[var(--md-sys-color-primary-container)] text-[var(--md-sys-color-on-primary-container)] border-none px-3 py-1 flex items-center text-label-large">
                            <Icon icon="material-symbols:numbers" className="mr-1 text-lg" />
                            セクション {originalIndex + 1}
                        </Tag>
                        <Tag className="rounded-full bg-[var(--md-sys-color-secondary-container)] text-[var(--md-sys-color-on-secondary-container)] border-none px-3 py-1 flex items-center text-label-large">
                            <Icon icon="material-symbols:image" className="mr-1 text-lg" />
                            {sectionImages.length}枚
                        </Tag>
                        <Tag className="rounded-full bg-[var(--color-giin-container)] text-[var(--color-giin)] border-none px-3 py-1 flex items-center text-label-large">
                            <Icon icon="material-symbols:group" className="mr-1 text-lg" />
                            {new Set(sectionImages.map(img => img.uploadedBy)).size}人参加
                        </Tag>
                    </div>
                    {isGicho && (
                        <Button
                            size="small"
                            danger
                            type="text"
                            icon={<Icon icon="material-symbols:delete-outline" className="text-lg" />}
                            onClick={() => onDeleteSection(section.id)}
                        />
                    )}
                </div>

                <div className="p-4 space-y-4">
                    <div
                        className="text-[var(--md-sys-color-on-surface)] whitespace-pre-wrap font-medium"
                        style={{ fontSize: `${editorFontSize}px`, lineHeight: 1.6 }}
                    >
                        {section.content}
                    </div>

                    {section.imageInstruction && (
                        <div className="bg-[var(--md-sys-color-primary-container)]/30 border-l-4 border-[var(--md-sys-color-primary)] pl-4 py-3 rounded-r-lg">
                            <div className="flex items-center gap-2 mb-1">
                                <Icon icon="material-symbols:image" className="text-[var(--md-sys-color-primary)]" />
                                <p className="text-label-large font-bold text-[var(--md-sys-color-primary)]">画像指示</p>
                            </div>
                            <p className="text-body-medium">{section.imageInstruction}</p>
                        </div>
                    )}

                    {section.referenceImageUrl && (
                        <div className="bg-[var(--md-sys-color-surface-container)] p-3 rounded-xl">
                            <div className="flex justify-between items-center mb-2">
                                <p className="text-label-large text-[var(--md-sys-color-on-surface-variant)]">参考画像</p>
                                {userRole !== "guest" && (
                                    <a
                                        href={section.referenceImageUrl}
                                        download={`reference_${section.id}`}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="text-primary hover:text-primary-active flex items-center gap-1 text-sm font-medium"
                                    >
                                        <Icon icon="material-symbols:download" />
                                        DL
                                    </a>
                                )}
                            </div>
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img src={section.referenceImageUrl} alt="参考画像" className="max-h-60 max-w-full rounded-lg border border-[var(--md-sys-color-outline-variant)] object-contain mx-auto" />
                        </div>
                    )}

                    <Divider className="border-[var(--md-sys-color-outline-variant)] opacity-50" />

                    <div>
                        <input
                            type="file"
                            multiple
                            accept="image/*"
                            onChange={(e) => {
                                const files = e.target.files ? Array.from(e.target.files) : [];
                                if (files.length > 0) {
                                    onImageUpload(section.id, files);
                                }
                                e.target.value = '';
                            }}
                            className="hidden"
                            id={`file-input-${section.id}`}
                        />
                        <label htmlFor={`file-input-${section.id}`}>
                            <div className={cn(
                                "rounded-xl p-8 text-center cursor-pointer transition-all duration-200",
                                "border border-solid",
                                isUploading
                                    ? "border-[var(--md-sys-color-primary)] bg-[var(--md-sys-color-primary-container)]/20"
                                    : "border-[var(--md-sys-color-outline)] hover:border-[var(--md-sys-color-primary)] hover:bg-[var(--md-sys-color-surface-container-high)]"
                            )}>
                                {isUploading ? (
                                    <div className="space-y-3">
                                        <Spin indicator={<Icon icon="material-symbols:progress-activity" className="text-3xl animate-spin text-[var(--md-sys-color-primary)]" />} />
                                        <p className="text-body-medium text-[var(--md-sys-color-primary)] font-medium">アップロード中...</p>
                                        <Progress percent={uploadProgress} size="small" showInfo={false} strokeColor="var(--md-sys-color-primary)" className="max-w-xs mx-auto" />
                                    </div>
                                ) : (
                                    <div className="space-y-2">
                                        <Icon icon="material-symbols:cloud-upload-outline" className="text-4xl text-[var(--md-sys-color-primary)] mx-auto" />
                                        <p className="text-title-medium font-bold text-[var(--md-sys-color-on-surface)]">クリックして画像をアップロード</p>
                                        <p className="text-body-small text-[var(--md-sys-color-on-surface-variant)]">jpg, png, gif, webp対応</p>
                                    </div>
                                )}
                            </div>
                        </label>
                    </div>

                    {sectionImages.length > 0 && (
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                            {sectionImages.map((img, imgIndex) => {
                                const isSelected = img.isSelected && img.sectionId === section.id;
                                return (
                                    <div key={img.id} className="relative group">
                                        <div
                                            className={cn(
                                                "relative aspect-square rounded-xl overflow-hidden cursor-pointer transition-all duration-200",
                                                "border-[3px]",
                                                isSelected
                                                    ? "border-[var(--md-sys-color-primary)] shadow-md"
                                                    : "border-transparent hover:border-[var(--md-sys-color-outline-variant)]"
                                            )}
                                            onClick={() => onOpenLightbox(sectionImages, imgIndex)}
                                        >
                                            {/* eslint-disable-next-line @next/next/no-img-element */}
                                            <img src={img.imageUrl} alt="uploaded" className="w-full h-full object-cover" />

                                            {isSelected && (
                                                <div className="absolute top-2 right-2 bg-[var(--md-sys-color-primary)] text-[var(--md-sys-color-on-primary)] p-1 rounded-full shadow-sm z-10">
                                                    <Icon icon="material-symbols:check" className="text-lg" />
                                                </div>
                                            )}

                                            <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity bg-black/20">
                                                <Icon icon="material-symbols:zoom-in" className="text-white drop-shadow-md text-3xl" />
                                            </div>
                                        </div>

                                        <button
                                            className="absolute -top-2 -left-2 bg-[var(--md-sys-color-error-container)] text-[var(--md-sys-color-on-error-container)] p-1.5 rounded-full shadow-sm opacity-0 group-hover:opacity-100 transition-opacity z-20 hover:scale-110"
                                            onClick={(e) => { e.stopPropagation(); onDeleteImage(img.id); }}
                                            title="画像を削除"
                                        >
                                            <Icon icon="material-symbols:delete" className="text-sm" />
                                        </button>

                                        <div className="mt-1 px-1">
                                            <span className="text-body-small text-[var(--md-sys-color-on-surface-variant)] truncate block max-w-full">
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

            {isGicho && originalIndex === totalSections - 1 && (
                <div className="flex justify-center pt-4">
                    <Button
                        size="small"
                        shape="round"
                        icon={<Icon icon="material-symbols:add" />}
                        onClick={() => onAddSection(originalIndex + 1)}
                        className="bg-[var(--md-sys-color-primary-container)] text-[var(--md-sys-color-on-primary-container)] border-none shadow-none"
                    >
                        末尾にセクションを追加
                    </Button>
                </div>
            )}
        </div>
    );
}
