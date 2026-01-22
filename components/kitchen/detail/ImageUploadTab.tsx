"use client";

import { useState } from "react";
import { Button, Tag, Divider, Progress, Spin } from "antd";
import { PlusOutlined, DeleteOutlined, LoadingOutlined } from "@ant-design/icons";
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
    sections, images, editorFontSize, uploadingSectionId, uploadProgress, uploaderNames, projectTitle,
    onAddSection, onDeleteSection, onImageUpload, onDeleteImage, onOpenLightbox
}: ImageUploadTabProps) {
    const [isScriptViewerOpen, setIsScriptViewerOpen] = useState(false);

    if (sections.length === 0 || !sections.some(s => s.allowImageSubmission ?? true)) {
        return (
            <div className="flex flex-col items-center justify-center py-12 bg-[var(--md-sys-color-surface-container)] rounded-lg">
                <Icon icon="mdi:camera-off" className="text-6xl text-[var(--md-sys-color-on-surface-variant)] mb-4" />
                <p className="text-[var(--md-sys-color-on-surface-variant)]">
                    {sections.length === 0
                        ? "まずは調理タブで台本を入力してください"
                        : "画像提出が許可されているセクションがありません"}
                </p>
            </div>
        );
    }

    return (
        <>
            <ScriptViewerModal isOpen={isScriptViewerOpen} onClose={() => setIsScriptViewerOpen(false)} sections={sections} projectTitle={projectTitle} />

            <div className="space-y-8 pb-12">
                <div className="flex justify-end gap-2 px-4">
                    <Button icon={<Icon icon="mdi:script-text-outline" />} onClick={() => setIsScriptViewerOpen(true)}>
                        原稿を見る
                    </Button>
                </div>
                {sections.filter(s => s.allowImageSubmission ?? true).map((section) => {
                    const sectionImages = images.filter(img => img.sectionId === section.id);
                    const originalIndex = sections.findIndex(s => s.id === section.id);

                    return (
                        <div key={section.id} className="space-y-4">
                            <div className="flex justify-center opacity-0 hover:opacity-100 transition-opacity">
                                <Button size="small" shape="round" icon={<PlusOutlined />} onClick={() => onAddSection(originalIndex)} className="bg-[#ffdad5] text-[#73342b] border-none">
                                    ここにセクションを追加
                                </Button>
                            </div>

                            <div className="bg-[var(--md-sys-color-surface-container-lowest)] rounded-lg shadow-md border border-[var(--md-sys-color-outline-variant)]">
                                <div className="p-4 flex flex-wrap justify-between items-center gap-2 border-b border-[var(--md-sys-color-outline-variant)] bg-[var(--md-sys-color-surface-container)]">
                                    <div className="flex flex-wrap items-center gap-2">
                                        <Tag className="rounded-full bg-[#ffdad5] text-[#73342b] border-none"><Icon icon="mdi:numeric" className="mr-1" />セクション {originalIndex + 1}</Tag>
                                        <Tag className="rounded-full bg-[#9E2B1F]/20 text-[#9E2B1F] border-none"><Icon icon="mdi:image-multiple" className="mr-1" />{sectionImages.length}枚</Tag>
                                        <Tag className="rounded-full bg-[#d7f0cb] text-[#10200a] border-none"><Icon icon="mdi:account-group" className="mr-1" />{new Set(sectionImages.map(img => img.uploadedBy)).size}人参加</Tag>
                                    </div>
                                    <Button size="small" danger type="text" icon={<DeleteOutlined />} onClick={() => onDeleteSection(section.id)} />
                                </div>
                                <div className="p-4 space-y-4">
                                    <div className="text-[var(--md-sys-color-on-surface-variant)] whitespace-pre-wrap" style={{ fontSize: `${editorFontSize}px`, lineHeight: 1.6 }}>{section.content}</div>
                                    {section.imageInstruction && (
                                        <div className="bg-[#ffdad5]/30 border-l-4 border-[#73342b] pl-4 py-3 rounded-r">
                                            <div className="flex items-center gap-2 mb-1"><Icon icon="mdi:image-text" className="text-[#73342b]" /><p className="text-sm font-semibold text-[#73342b]">画像指示</p></div>
                                            <p className="text-sm">{section.imageInstruction}</p>
                                        </div>
                                    )}
                                    {section.referenceImageUrl && (
                                        <div className="bg-[var(--md-sys-color-surface-container)] p-3 rounded-lg">
                                            <p className="text-xs font-semibold text-[var(--md-sys-color-on-surface-variant)] mb-2">参考画像</p>
                                            {/* eslint-disable-next-line @next/next/no-img-element */}
                                            <img src={section.referenceImageUrl} alt="参考画像" className="max-h-40 max-w-full rounded border border-[var(--md-sys-color-outline-variant)] object-contain mx-auto" />
                                        </div>
                                    )}
                                    <Divider />
                                    <div>
                                        <input type="file" accept="image/*" onChange={(e) => { const file = e.target.files?.[0]; if (file) onImageUpload(section.id, file); e.target.value = ''; }} className="hidden" id={`file-input-${section.id}`} />
                                        <label htmlFor={`file-input-${section.id}`}>
                                            <div className={`border-2 border-dashed rounded-xl p-6 text-center cursor-pointer transition-all ${uploadingSectionId === section.id ? 'border-[#73342b] bg-[#ffdad5]/20' : 'border-[var(--md-sys-color-outline-variant)] hover:border-[#73342b] hover:bg-[#ffdad5]/10'}`}>
                                                {uploadingSectionId === section.id ? (
                                                    <div className="space-y-3">
                                                        <Spin indicator={<LoadingOutlined style={{ fontSize: 24 }} spin />} />
                                                        <p className="text-sm text-[#73342b]">アップロード中...</p>
                                                        <Progress percent={uploadProgress} size="small" strokeColor="#73342b" className="max-w-xs mx-auto" />
                                                    </div>
                                                ) : (
                                                    <div className="space-y-2">
                                                        <Icon icon="mdi:cloud-upload-outline" className="text-4xl text-[var(--md-sys-color-on-surface-variant)] mx-auto" />
                                                        <p className="text-sm font-semibold">クリックして画像をアップロード</p>
                                                        <p className="text-xs text-[var(--md-sys-color-on-surface-variant)]">jpg, png, gif, webp対応</p>
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
                                                        <div className={`relative aspect-square rounded-lg overflow-hidden cursor-pointer border-2 transition-all ${isSelected ? "border-[#73342b] ring-4 ring-[#73342b]/30 shadow-lg scale-95" : "border-transparent hover:border-[var(--md-sys-color-outline-variant)]"}`} onClick={() => onOpenLightbox(sectionImages, imgIndex)}>
                                                            {/* eslint-disable-next-line @next/next/no-img-element */}
                                                            <img src={img.imageUrl} alt="uploaded" className="w-full h-full object-cover" />
                                                            {isSelected && (<div className="absolute top-2 right-2 bg-[#73342b] text-[#ffdad5] p-1 rounded-full shadow-md z-10"><Icon icon="mdi:check-bold" className="text-lg" /></div>)}
                                                            <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity bg-black/30"><Icon icon="mdi:magnify-plus" className="text-[#ffdad5] text-2xl" /></div>
                                                        </div>
                                                        <button className="absolute -top-2 -left-2 bg-[#ffdad6] text-[#93000a] p-1.5 rounded-full shadow-md opacity-0 group-hover:opacity-100 transition-opacity z-20 hover:scale-110" onClick={(e) => { e.stopPropagation(); onDeleteImage(img.id); }} title="画像を削除"><Icon icon="mdi:trash-can" className="text-sm" /></button>
                                                        <div className="mt-1 px-1"><span className="text-xs text-[var(--md-sys-color-on-surface-variant)] truncate block max-w-full">{uploaderNames[img.uploadedBy] || "User"}</span></div>
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    )}
                                </div>
                            </div>
                            {originalIndex === sections.length - 1 && (
                                <div className="flex justify-center pt-4">
                                    <Button size="small" shape="round" icon={<PlusOutlined />} onClick={() => onAddSection(originalIndex + 1)} className="bg-[#ffdad5] text-[#73342b] border-none">末尾にセクションを追加</Button>
                                </div>
                            )}
                        </div>
                    );
                })}
            </div>
        </>
    );
}
