import { useEffect, useState, useRef, useCallback } from "react";
import { createPortal } from "react-dom";
import { LeftOutlined, RightOutlined, CloseOutlined } from "@ant-design/icons";
import { UploadedImage } from "@/types/kitchen";
import { motion, AnimatePresence } from "framer-motion";
import { Input, Button } from "antd";
import { Icon } from "@iconify/react";

interface LightboxProps {
    isOpen: boolean;
    onClose: () => void;
    images: UploadedImage[];
    currentIndex: number;
    onIndexChange: (index: number) => void;
    uploaderNames: Record<string, string>;
    onUpdateComment?: (imageId: string, comment: string) => Promise<void>;
}

export default function Lightbox({
    isOpen, onClose, images, currentIndex, onIndexChange, uploaderNames, onUpdateComment
}: LightboxProps) {
    const [mounted, setMounted] = useState(false);
    const [isEditingComment, setIsEditingComment] = useState(false);
    const [editingComment, setEditingComment] = useState("");
    const inputRef = useRef<any>(null);

    // Current image reference for easier access
    const currentImage = images[currentIndex];

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

    // Navigation functions (hoisted for useEffect)
    const goToPrevImage = useCallback(() => {
        if (images.length <= 1) return;
        onIndexChange((currentIndex - 1 + images.length) % images.length);
    }, [images.length, currentIndex, onIndexChange]);

    const goToNextImage = useCallback(() => {
        if (images.length <= 1) return;
        onIndexChange((currentIndex + 1) % images.length);
    }, [images.length, currentIndex, onIndexChange]);

    useEffect(() => {
        if (!isOpen) return;

        const handleKeyDown = (e: KeyboardEvent) => {
            // Disable nav keys if editing text
            if (isEditingComment) {
                if (e.key === "Escape") setIsEditingComment(false);
                return;
            }

            if (e.key === "Escape") onClose();
            if (e.key === "ArrowLeft") goToPrevImage();
            if (e.key === "ArrowRight") goToNextImage();
        };

        window.addEventListener("keydown", handleKeyDown);
        return () => window.removeEventListener("keydown", handleKeyDown);
    }, [isOpen, isEditingComment, onClose, goToPrevImage, goToNextImage]);

    // Reset editing state when image changes
    useEffect(() => {
        setIsEditingComment(false);
        setEditingComment("");
    }, [currentIndex]);

    const handleSaveComment = async () => {
        if (!currentImage || !onUpdateComment) return;
        await onUpdateComment(currentImage.id, editingComment);
        setIsEditingComment(false);
    };

    const startEditing = () => {
        setEditingComment(currentImage.comment || "");
        setIsEditingComment(true);
        setTimeout(() => inputRef.current?.focus(), 100);
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
                        className="relative max-w-[90vw] max-h-[90vh] flex flex-col items-center"
                        onClick={(e) => e.stopPropagation()}
                    >
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                            src={currentImage?.imageUrl}
                            alt="Preview"
                            className="max-w-full max-h-[80vh] object-contain"
                        />

                        {/* Image Info Overlay & Comment */}
                        <div className="mt-4 w-full max-w-2xl bg-black/50 backdrop-blur-sm p-4 rounded-xl text-white/90">
                            <div className="flex justify-between items-center mb-2">
                                <div className="text-sm">
                                    <span>{currentIndex + 1} / {images.length}</span>
                                    {currentImage?.uploadedBy && uploaderNames[currentImage.uploadedBy] && (
                                        <span className="ml-3 text-white/60">
                                            by {uploaderNames[currentImage.uploadedBy]}
                                        </span>
                                    )}
                                </div>
                                {onUpdateComment && !isEditingComment && (
                                    <Button type="text" size="small" className="text-white hover:text-primary" onClick={startEditing}>
                                        <Icon icon="material-symbols:edit" className="mr-1" /> コメント編集
                                    </Button>
                                )}
                            </div>

                            {isEditingComment ? (
                                <div className="flex gap-2">
                                    <Input.TextArea
                                        ref={inputRef}
                                        value={editingComment}
                                        onChange={(e) => setEditingComment(e.target.value)}
                                        autoSize={{ minRows: 1, maxRows: 3 }}
                                        className="bg-white/10 text-white border-white/20"
                                        onKeyDown={(e) => {
                                            if (e.key === 'Enter' && !e.shiftKey) {
                                                e.preventDefault();
                                                handleSaveComment();
                                            }
                                        }}
                                        onClick={(e) => e.stopPropagation()}
                                    />
                                    <div className="flex flex-col gap-1 justify-center">
                                        <Button type="primary" size="small" onClick={handleSaveComment}>保存</Button>
                                        <Button size="small" onClick={() => setIsEditingComment(false)}>取消</Button>
                                    </div>
                                </div>
                            ) : (
                                <p className="text-body-medium whitespace-pre-wrap min-h-[1.5em]" onClick={() => onUpdateComment && startEditing()}>
                                    {currentImage.comment || <span className="text-white/40 italic">コメントなし</span>}
                                </p>
                            )}
                        </div>
                    </div>
                </motion.div>
            )}
        </AnimatePresence>,
        document.body
    );
}
