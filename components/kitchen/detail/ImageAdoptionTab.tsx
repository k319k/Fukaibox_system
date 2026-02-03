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
                            <div className="pb-2 bg-[var(--md-sys-color-surface-container)] border-b border-[var(--md-sys-color-outline-variant)] p-4 rounded-t-[20px]">
                                <div className="flex items-center justify-between w-full">
                                    <div className="flex items-center gap-2">
                                        <Tag className="rounded-full bg-[#ffdad5] text-[#73342b] border-none">セクション {originalIndex + 1}</Tag>
                                        <span className="text-xs text-[var(--md-sys-color-on-surface-variant)] truncate max-w-[200px]">{section.content?.slice(0, 30)}...</span>
                                    </div>
                                    <Tag className="rounded-full bg-[#9E2B1F]/20 text-[#9E2B1F] border-none">候補: {sectionImages.length}枚</Tag>
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
