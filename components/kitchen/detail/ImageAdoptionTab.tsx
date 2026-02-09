"use client";

import { Card, Tag, Checkbox } from "antd";
import { Section, UploadedImage } from "@/types/kitchen";

interface ImageAdoptionTabProps {
    sections: Section[];
    images: UploadedImage[];
    uploaderNames: Record<string, string>;
    onImageSelection: (imageId: string, isSelected: boolean, sectionId: string) => void;
    onOpenLightbox: (images: UploadedImage[], index: number) => void;
    isReadOnly?: boolean;
}

export default function ImageAdoptionTab({
    sections, images, uploaderNames, onImageSelection, onOpenLightbox, isReadOnly = false
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

                return (
                    <div key={section.id} className="space-y-2">
                        <Card className="card-elevated rounded-[20px]" styles={{ body: { padding: 0 } }}>
                            <div className="bg-[var(--md-sys-color-surface-container)] border-b border-[var(--md-sys-color-outline-variant)] p-4 rounded-t-[20px]">
                                <div className="flex items-center justify-between w-full mb-3">
                                    <div className="flex items-center gap-2">
                                        <Tag className="rounded-full bg-[var(--md-sys-color-primary-container)] text-[var(--md-sys-color-on-primary-container)] border-none text-label-large px-3 py-1">
                                            セクション {originalIndex + 1}
                                        </Tag>
                                        <Tag className="rounded-full bg-[var(--md-sys-color-secondary-container)] text-[var(--md-sys-color-on-secondary-container)] border-none text-label-large px-3 py-1">
                                            候補: {sectionImages.length}枚
                                        </Tag>
                                    </div>
                                </div>

                                <div className="bg-[var(--md-sys-color-surface)] p-4 rounded-xl border border-[var(--md-sys-color-outline-variant)] shadow-sm">
                                    <div className="mb-2">
                                        <span className="text-label-small text-[var(--md-sys-color-outline)] block mb-1">台本</span>
                                        <p className="text-body-large text-[var(--md-sys-color-on-surface)] whitespace-pre-wrap font-medium leading-relaxed">
                                            {section.content || "（台本なし）"}
                                        </p>
                                    </div>

                                    {section.imageInstruction && (
                                        <div className="mt-3 pt-3 border-t border-[var(--md-sys-color-outline-variant)]">
                                            <span className="text-label-small text-[var(--md-sys-color-primary)] font-bold block mb-1">画像指示</span>
                                            <p className="text-body-medium text-[var(--md-sys-color-on-surface-variant)] whitespace-pre-wrap bg-[var(--md-sys-color-surface-container-high)]/50 p-2 rounded-lg">
                                                {section.imageInstruction}
                                            </p>
                                        </div>
                                    )}
                                </div>
                            </div>
                            <div className="p-4">
                                {sectionImages.length === 0 ? (
                                    <p className="text-sm text-[var(--md-sys-color-on-surface-variant)] text-center py-4">投稿された画像はありません</p>
                                ) : (
                                    <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">
                                        {sectionImages.map((img, imgIndex) => (
                                            <div key={img.id} className="relative group">
                                                <div className={`relative aspect-square rounded-lg overflow-hidden border-2 transition-all ${img.isSelected ? "border-[#10200a] ring-4 ring-[#d7f0cb] shadow-lg scale-95" : "border-transparent hover:border-[var(--md-sys-color-outline-variant)]"}`}>
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
                                                    {img.isSelected && (<span className="text-xs font-bold text-[#10200a]">採用</span>)}
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
