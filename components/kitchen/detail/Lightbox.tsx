"use client";

import { Modal, Button } from "antd";
import { LeftOutlined, RightOutlined, CloseOutlined } from "@ant-design/icons";
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
    isOpen, onClose, images, currentIndex, onIndexChange, uploaderNames
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
            open={isOpen}
            onCancel={onClose}
            footer={null}
            width="100%"
            centered
            closable={false}
            className="lightbox-modal"
            styles={{
                mask: { backgroundColor: "rgba(0,0,0,0.95)" },
                content: { backgroundColor: "transparent", boxShadow: "none" },
            }}
        >
            <div
                className="flex items-center justify-center relative w-full h-[90vh]"
                onClick={onClose} // クリックで閉じる
            >
                {/* 前へボタン */}
                <Button
                    type="text"
                    shape="circle"
                    size="large"
                    className="absolute left-2 md:left-4 top-1/2 -translate-y-1/2 z-50 bg-black/40 hover:bg-black/60 border-none text-white w-12 h-12 flex items-center justify-center"
                    onClick={(e) => { e.stopPropagation(); goToPrevImage(); }}
                    icon={<LeftOutlined className="text-xl" />}
                />

                {/* 画像 */}
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                    src={currentImage?.imageUrl}
                    alt="拡大画像"
                    className="max-h-[85vh] max-w-[95vw] object-contain select-none"
                    onClick={(e) => e.stopPropagation()} // 画像クリックでは閉じない
                />

                {/* 次へボタン */}
                <Button
                    type="text"
                    shape="circle"
                    size="large"
                    className="absolute right-2 md:right-4 top-1/2 -translate-y-1/2 z-50 bg-black/40 hover:bg-black/60 border-none text-white w-12 h-12 flex items-center justify-center"
                    onClick={(e) => { e.stopPropagation(); goToNextImage(); }}
                    icon={<RightOutlined className="text-xl" />}
                />

                {/* 閉じるボタン */}
                <Button
                    type="text"
                    shape="circle"
                    size="large"
                    className="absolute top-4 right-4 z-50 bg-black/40 hover:bg-black/60 border-none text-white w-12 h-12 flex items-center justify-center"
                    onClick={(e) => { e.stopPropagation(); onClose(); }}
                    icon={<CloseOutlined className="text-xl" />}
                />

                {/* 画像情報 */}
                <div
                    className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-black/60 px-4 py-2 rounded-lg z-50"
                    onClick={(e) => e.stopPropagation()} // ここも閉じない
                >
                    <p className="text-[#f5f5f5] text-sm">
                        {currentIndex + 1} / {images.length}
                        {currentImage?.uploadedBy && uploaderNames[currentImage.uploadedBy] && (
                            <span className="ml-2 text-[#f5f5f5]/70">
                                by {uploaderNames[currentImage.uploadedBy]}
                            </span>
                        )}
                    </p>
                </div>
            </div>
        </Modal>
    );
}
