"use client";

import { useState, useEffect } from "react";
import { UploadedImage } from "@/types/kitchen";
import {
    getUploadUrl,
    confirmImageUpload,
    deleteCookingImage,
    updateImageSelection,
    getCookingImages
} from "@/app/actions/kitchen";

export function useImages(
    projectId: string,
    images: UploadedImage[],
    setImages: React.Dispatch<React.SetStateAction<UploadedImage[]>>
) {
    const [uploadingSectionId, setUploadingSectionId] = useState<string | null>(null);
    const [uploadProgress, setUploadProgress] = useState(0);

    // Lightbox State
    const [isLightboxOpen, setIsLightboxOpen] = useState(false);
    const [lightboxImages, setLightboxImages] = useState<UploadedImage[]>([]);
    const [lightboxImageIndex, setLightboxImageIndex] = useState(0);

    // Polling for images
    useEffect(() => {
        const interval = setInterval(async () => {
            // Only poll if not uploading to avoid jitter or race conditions (optional, but safer)
            if (!uploadingSectionId) {
                try {
                    const latestImages = await getCookingImages(projectId);
                    // Simple comparison to avoid re-renders if length is same (optimization could be deeper)
                    setImages(prev => {
                        if (prev.length !== latestImages.length) return latestImages;
                        // Check if any ID changed (simple content check)
                        const prevIds = prev.map(p => p.id).sort().join(',');
                        const newIds = latestImages.map(p => p.id).sort().join(',');
                        return prevIds !== newIds ? latestImages : prev;
                    });
                } catch (e) {
                    console.error("Failed to poll images", e);
                }
            }
        }, 10000);
        return () => clearInterval(interval);
    }, [projectId, uploadingSectionId, setImages]);

    const handleImageUpload = async (sectionId: string, file: File) => {
        if (!file.type.startsWith("image/")) {
            alert("画像ファイルを選択してください。");
            return;
        }
        if (file.size > 5 * 1024 * 1024) {
            alert("5MB以下の画像を選択してください。");
            return;
        }

        setUploadingSectionId(sectionId);
        setUploadProgress(0);

        try {
            const { url: uploadUrl, key } = await getUploadUrl(file.name, file.type, projectId);

            await new Promise<void>((resolve, reject) => {
                const xhr = new XMLHttpRequest();
                xhr.open("PUT", uploadUrl, true);
                xhr.setRequestHeader("Content-Type", file.type);

                xhr.upload.onprogress = (e) => {
                    if (e.lengthComputable) {
                        const percentComplete = (e.loaded / e.total) * 100;
                        setUploadProgress(percentComplete);
                    }
                };

                xhr.onload = () => {
                    if (xhr.status === 200) resolve();
                    else reject(new Error("Upload failed"));
                };
                xhr.onerror = () => reject(new Error("Network Error"));
                xhr.send(file);
            });

            await confirmImageUpload(projectId, key, sectionId);

            const newImages = await getCookingImages(projectId);
            setImages(newImages);

        } catch (error) {
            console.error("Image upload error:", error);
            alert("画像のアップロードに失敗しました。");
        } finally {
            setUploadingSectionId(null);
            setUploadProgress(0);
        }
    };

    const handleDeleteImage = async (imageId: string) => {
        if (!confirm("画像を削除しますか？")) return;
        try {
            await deleteCookingImage(imageId);
            setImages(prev => prev.filter(img => img.id !== imageId));
        } catch (error) {
            console.error("Delete image error:", error);
            alert("画像の削除に失敗しました。");
        }
    };

    const handleImageSelection = async (imageId: string, isSelected: boolean, sectionId: string) => {
        try {
            await updateImageSelection(imageId, sectionId, isSelected);
            const newImages = await getCookingImages(projectId);
            setImages(newImages);
        } catch (error) {
            console.error("Selection error:", error);
            alert("画像の採用状態の更新に失敗しました。");
        }
    };

    const openLightbox = (imgs: UploadedImage[], index: number) => {
        setLightboxImages(imgs);
        setLightboxImageIndex(index);
        setIsLightboxOpen(true);
    };

    return {
        uploadingSectionId,
        uploadProgress,
        handleImageUpload,
        handleDeleteImage,
        handleImageSelection,

        isLightboxOpen, setIsLightboxOpen,
        lightboxImages,
        lightboxImageIndex, setLightboxImageIndex,
        openLightbox
    };
}
