"use client";

import { Card, Tag, Checkbox } from "antd";
import { Icon } from "@iconify/react";
import { Section, UploadedImage, UserRole } from "@/types/kitchen";

interface ImageAdoptionTabProps {
    sections: Section[];
    images: UploadedImage[];
    uploaderNames: Record<string, string>;
    onImageSelection: (imageId: string, isSelected: boolean, sectionId: string) => void;
    onOpenLightbox: (images: UploadedImage[], index: number) => void;
    isReadOnly?: boolean;
    userRole?: UserRole;
}

/** 参考画像URLの統合リストを取得（referenceImageUrls優先、なければreferenceImageUrl） */
function getRefImages(section: Section): string[] {
    if (section.referenceImageUrls && section.referenceImageUrls.length > 0) {
        return section.referenceImageUrls;
    }
    if (section.referenceImageUrl) {
        return [section.referenceImageUrl];
    }
    return [];
}

export default function ImageAdoptionTab({
    sections, images, uploaderNames, onImageSelection, onOpenLightbox, isReadOnly = false, userRole
}: ImageAdoptionTabProps) {
    if (sections.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center py-12 bg-[var(--md-sys-color-surface-container)] rounded-lg">
                <p className="text-[var(--md-sys-color-on-surface-variant)]">まずは調理タブで台本を入力してください</p>
            </div>
        );
    }

    return (
        <div className="space-y-8 pb-12">
            {sections.filter(s => s.allowImageSubmission ?? true).map((section) => {
                const sectionImages = images.filter(img => img.sectionId === section.id);
                const originalIndex = sections.findIndex(s => s.id === section.id);
                const refImages = getRefImages(section);

                return (
                    <div key={section.id} className="space-y-2">
                        <Card className="card-elevated rounded-[20px]" styles={{ body: { padding: 0 } }}>
                            <div className="pb-2 bg-[var(--md-sys-color-surface-container)] border-b border-[var(--md-sys-color-outline-variant)] p-4 rounded-t-[20px]">
                                <div className="flex items-center justify-between w-full">
                                    <div className="flex items-center gap-2">
                                        <Tag className="rounded-full bg-[var(--color-kitchen-tag-bg)] text-[var(--color-kitchen-tag-text)] border-none">セクション {originalIndex + 1}</Tag>
                                        <span className="text-xs text-[var(--md-sys-color-on-surface-variant)] truncate max-w-[200px]">{section.content?.slice(0, 30)}...</span>
                                    </div>
                                    <Tag className="rounded-full bg-[var(--color-kitchen-candidate-bg)] text-[var(--color-kitchen-candidate-text)] border-none">候補: {sectionImages.length}枚</Tag>
                                </div>
                            </div>
                            <div className="p-4 space-y-4">
                                {/* 画像指示文の全文表示 */}
                                {section.imageInstruction && (
                                    <div className="bg-[var(--md-sys-color-primary-container)]/30 border-l-4 border-[var(--md-sys-color-primary)] pl-4 py-3 rounded-r-lg">
                                        <div className="flex items-center gap-2 mb-1">
                                            <Icon icon="material-symbols:image" className="text-[var(--md-sys-color-primary)]" />
                                            <p className="text-label-large font-bold text-[var(--md-sys-color-primary)]">画像指示</p>
                                        </div>
                                        <p className="text-body-medium whitespace-pre-wrap">{section.imageInstruction}</p>
                                    </div>
                                )}

                                {/* 参考画像の表示 */}
                                {refImages.length > 0 && (
                                    <div className="bg-[var(--md-sys-color-surface-container)] p-3 rounded-xl">
                                        <p className="text-label-large text-[var(--md-sys-color-on-surface-variant)] mb-2">参考画像</p>
                                        <div className="flex gap-2 flex-wrap">
                                            {refImages.map((url, idx) => (
                                                /* eslint-disable-next-line @next/next/no-img-element */
                                                <img key={idx} src={url} alt={`参考画像${idx + 1}`}
                                                    className="max-h-40 rounded-lg border border-[var(--md-sys-color-outline-variant)] object-contain"
                                                    onError={(e) => (e.currentTarget.style.display = 'none')}
                                                />
                                            ))}
                                        </div>
                                    </div>
                                )}

                                {sectionImages.length === 0 ? (
                                    <p className="text-sm text-[var(--md-sys-color-on-surface-variant)] text-center py-4">投稿された画像はありません</p>
                                ) : (
                                    <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">
                                        {sectionImages.map((img, imgIndex) => (
                                            <div key={img.id} className="relative group">
                                                <div className={`relative aspect-square rounded-lg overflow-hidden border-2 transition-all ${img.isSelected ? "border-[var(--color-kitchen-selected-border)] ring-4 ring-[var(--color-kitchen-selected-ring)] shadow-lg scale-95" : "border-transparent hover:border-[var(--md-sys-color-outline-variant)]"}`}>
                                                    <div className="w-full h-full cursor-pointer" onClick={() => onOpenLightbox(sectionImages, imgIndex)}>
                                                        {/* eslint-disable-next-line @next/next/no-img-element */}
                                                        <img src={img.imageUrl} alt="candidate" className="w-full h-full object-cover" />
                                                    </div>
                                                    {!isReadOnly && (
                                                        <div className="absolute top-2 right-2 z-10 bg-[var(--md-sys-color-surface-container-lowest)]/80 backdrop-blur-sm rounded-full p-1 shadow-sm">
                                                            <Checkbox
                                                                checked={img.isSelected || false}
                                                                onChange={(e) => onImageSelection(img.id, e.target.checked, section.id)}
                                                            />
                                                        </div>
                                                    )}

                                                    <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none bg-black/10"></div>
                                                </div>
                                                <div className="mt-1 flex justify-between items-center px-1">
                                                    <span className="text-xs text-[var(--md-sys-color-on-surface-variant)] truncate max-w-[80px]">{uploaderNames[img.uploadedBy] || "User"}</span>
                                                    {img.isSelected && (<span className="text-xs font-bold text-[var(--color-kitchen-selected-text)]">採用</span>)}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </Card>
                    </div>
                );
            })}
        </div>
    );
}
