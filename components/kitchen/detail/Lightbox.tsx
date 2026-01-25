"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { LeftOutlined, RightOutlined, CloseOutlined } from "@ant-design/icons";
import { UploadedImage } from "@/types/kitchen";
import { motion, AnimatePresence } from "framer-motion";

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
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
        return () => setMounted(false);
    }, []);

    useEffect(() => {
        if (isOpen) {
            document.body.style.overflow = "hidden"; // Scroll lock
        } else {
            document.body.style.overflow = "";
        }
        return () => {
            document.body.style.overflow = "";
        };
    }, [isOpen]);

    useEffect(() => {
        if (!isOpen) return;

        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === "Escape") onClose();
            if (e.key === "ArrowLeft") goToPrevImage();
            if (e.key === "ArrowRight") goToNextImage();
        };

        window.addEventListener("keydown", handleKeyDown);
        return () => window.removeEventListener("keydown", handleKeyDown);
    }, [isOpen, currentIndex, images.length]);

    const goToPrevImage = () => {
        if (images.length <= 1) return;
        onIndexChange((currentIndex - 1 + images.length) % images.length);
    };

    const goToNextImage = () => {
        if (images.length <= 1) return;
        onIndexChange((currentIndex + 1) % images.length);
    };

    if (!mounted || images.length === 0) return null;

    const currentImage = images[currentIndex];

    return createPortal(
        <AnimatePresence>
            {isOpen && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.2 }}
                    className="fixed inset-0 z-[9999] bg-black/95 flex items-center justify-center select-none"
                    onClick={onClose}
                >
                    {/* Close Button */}
                    <button
                        className="absolute top-4 right-4 z-50 p-4 text-white/80 hover:text-white transition-colors rounded-full hover:bg-white/10"
                        onClick={(e) => {
                            e.stopPropagation();
                            onClose();
                        }}
                    >
                        <CloseOutlined className="text-3xl" />
                    </button>

                    {/* Navigation Buttons (Only if > 1 image) */}
                    {images.length > 1 && (
                        <>
                            <button
                                className="absolute left-4 z-50 p-4 text-white/80 hover:text-white transition-colors rounded-full hover:bg-white/10"
                                onClick={(e) => {
                                    e.stopPropagation();
                                    goToPrevImage();
                                }}
                            >
                                <LeftOutlined className="text-4xl" />
                            </button>
                            <button
                                className="absolute right-4 z-50 p-4 text-white/80 hover:text-white transition-colors rounded-full hover:bg-white/10"
                                onClick={(e) => {
                                    e.stopPropagation();
                                    goToNextImage();
                                }}
                            >
                                <RightOutlined className="text-4xl" />
                            </button>
                        </>
                    )}

                    {/* Image Container */}
                    <div
                        className="relative max-w-[90vw] max-h-[90vh]"
                        onClick={(e) => e.stopPropagation()}
                    >
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                            src={currentImage?.imageUrl}
                            alt="Preview"
                            className="max-w-full max-h-[90vh] object-contain"
                        />

                        {/* Image Info Overlay */}
                        <div className="absolute -bottom-10 left-1/2 -translate-x-1/2 text-white/90 text-sm whitespace-nowrap bg-black/50 px-3 py-1 rounded-full">
                            <span>{currentIndex + 1} / {images.length}</span>
                            {currentImage?.uploadedBy && uploaderNames[currentImage.uploadedBy] && (
                                <span className="ml-3 text-white/60">
                                    by {uploaderNames[currentImage.uploadedBy]}
                                </span>
                            )}
                        </div>
                    </div>
                </motion.div>
            )}
        </AnimatePresence>,
        document.body
    );
}
