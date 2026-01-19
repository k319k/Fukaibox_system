"use client";

import { Card, CardBody, CardHeader, Chip, Checkbox } from "@heroui/react";
import { Icon } from "@iconify/react";
import { Section, UploadedImage } from "@/types/kitchen";

interface ImageAdoptionTabProps {
    sections: Section[];
    images: UploadedImage[];
    uploaderNames: Record<string, string>;
    onImageSelection: (imageId: string, isSelected: boolean, sectionId: string) => void;
    onOpenLightbox: (images: UploadedImage[], index: number) => void;
}

export default function ImageAdoptionTab({
    sections,
    images,
    uploaderNames,
    onImageSelection,
    onOpenLightbox
}: ImageAdoptionTabProps) {
    if (sections.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center py-12 bg-default-50 rounded-lg">
                <p className="text-foreground-muted">まずは調理タブで台本を入力してください</p>
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
                        <Card className="card-elevated" radius="lg">
                            <CardHeader className="pb-2 bg-default-50 border-b border-default-100">
                                <div className="flex items-center justify-between w-full">
                                    <div className="flex items-center gap-2">
                                        <Chip size="sm" color="primary" variant="flat">
                                            セクション {originalIndex + 1}
                                        </Chip>
                                        <span className="text-xs text-foreground-muted truncate max-w-[200px]">
                                            {section.content?.slice(0, 30)}...
                                        </span>
                                    </div>
                                    <Chip size="sm" variant="flat" color="secondary">
                                        候補: {sectionImages.length}枚
                                    </Chip>
                                </div>
                            </CardHeader>
                            <CardBody className="p-4">
                                {sectionImages.length === 0 ? (
                                    <p className="text-sm text-foreground-muted text-center py-4">
                                        投稿された画像はありません
                                    </p>
                                ) : (
                                    <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">
                                        {sectionImages.map((img, imgIndex) => (
                                            <div key={img.id} className="relative group">
                                                <div
                                                    className={`
                                                    relative aspect-square rounded-lg overflow-hidden border-2 transition-all
                                                    ${img.isSelected
                                                            ? "border-success ring-4 ring-success/20 shadow-lg scale-95"
                                                            : "border-transparent hover:border-default-300"
                                                        }
                                                `}
                                                >
                                                    {/* 画像クリックで拡大 */}
                                                    <div
                                                        className="w-full h-full cursor-pointer"
                                                        onClick={() => onOpenLightbox(sectionImages, imgIndex)}
                                                    >
                                                        {/* eslint-disable-next-line @next/next/no-img-element */}
                                                        <img
                                                            src={img.imageUrl}
                                                            alt="candidate"
                                                            className="w-full h-full object-cover"
                                                        />
                                                    </div>

                                                    {/* 採用チェックボックス - 画像の上にオーバーレイ */}
                                                    <div className="absolute top-2 right-2 z-10 bg-background/80 backdrop-blur-sm rounded-full p-1 shadow-sm">
                                                        <Checkbox
                                                            isSelected={img.isSelected || false}
                                                            onValueChange={(isSelected) => {
                                                                onImageSelection(img.id, isSelected, section.id);
                                                            }}
                                                            color="success"
                                                            size="lg"
                                                        // aria-label="この画像を採用する"
                                                        />
                                                    </div>

                                                    {/* 拡大オーバーレイヒント */}
                                                    <div
                                                        className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none bg-black/10"
                                                    >
                                                    </div>
                                                </div>

                                                <div className="mt-1 flex justify-between items-center px-1">
                                                    <span className="text-xs text-foreground-muted truncate max-w-[80px]">
                                                        {uploaderNames[img.uploadedBy] || "User"}
                                                    </span>
                                                    {img.isSelected && (
                                                        <span className="text-xs font-bold text-success">採用</span>
                                                    )}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </CardBody>
                        </Card>
                    </div>
                );
            })}
        </div>
    );
}
