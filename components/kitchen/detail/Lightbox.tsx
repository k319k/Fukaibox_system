"use client";

import { Modal, ModalContent, ModalBody, Button } from "@heroui/react";
import { Icon } from "@iconify/react";
import { UploadedImage } from "@/types/kitchen";

interface LightboxProps {
    isOpen: boolean;
    onClose: () => void;
    images: UploadedImage[];
    currentIndex: number;
    onIndexChange: (index: number) => void;
    uploaderNames: Record<string, string>;
}

export default function Lightbox({
    isOpen,
    onClose,
    images,
    currentIndex,
    onIndexChange,
    uploaderNames
}: LightboxProps) {
    if (!isOpen || images.length === 0) return null;

    const goToPrevImage = () => {
        onIndexChange((currentIndex - 1 + images.length) % images.length);
    };

    const goToNextImage = () => {
        onIndexChange((currentIndex + 1) % images.length);
    };

    const currentImage = images[currentIndex];

    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            size="full"
            classNames={{
                base: "bg-black/95",
                body: "p-0",
            }}
        >
            <ModalContent>
                <ModalBody className="flex items-center justify-center relative w-full h-full">
                    {/* 前へボタン */}
                    <Button
                        isIconOnly
                        variant="flat"
                        radius="full"
                        className="absolute left-4 top-1/2 -translate-y-1/2 z-50 bg-white/20 hover:bg-white/40"
                        onPress={goToPrevImage}
                    >
                        <Icon icon="mdi:chevron-left" className="text-2xl text-white" />
                    </Button>

                    {/* 画像 */}
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                        src={currentImage?.imageUrl}
                        alt="拡大画像"
                        className="max-h-[90vh] max-w-[90vw] object-contain select-none"
                    />

                    {/* 次へボタン */}
                    <Button
                        isIconOnly
                        variant="flat"
                        radius="full"
                        className="absolute right-4 top-1/2 -translate-y-1/2 z-50 bg-white/20 hover:bg-white/40"
                        onPress={goToNextImage}
                    >
                        <Icon icon="mdi:chevron-right" className="text-2xl text-white" />
                    </Button>

                    {/* 閉じるボタン */}
                    <Button
                        isIconOnly
                        variant="flat"
                        radius="full"
                        className="absolute top-4 right-4 z-50 bg-white/20 hover:bg-white/40"
                        onPress={onClose}
                    >
                        <Icon icon="mdi:close" className="text-xl text-white" />
                    </Button>

                    {/* 画像情報 */}
                    <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-black/60 px-4 py-2 rounded-lg z-50">
                        <p className="text-white text-sm">
                            {currentIndex + 1} / {images.length}
                            {currentImage?.uploadedBy && uploaderNames[currentImage.uploadedBy] && (
                                <span className="ml-2 text-white/70">
                                    by {uploaderNames[currentImage.uploadedBy]}
                                </span>
                            )}
                        </p>
                    </div>
                </ModalBody>
            </ModalContent>
        </Modal>
    );
}
