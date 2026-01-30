"use client";

import { useState, useEffect } from "react";
import { UploadedImage } from "@/types/kitchen";
import {
    getUploadUrl,
    confirmImageUpload,
    deleteCookingImage,
    updateImageSelection,
    getCookingImages,
    updateCookingImageComment
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
                        // Check if any ID changed or any comment changed
                        const prevStr = JSON.stringify(prev.map(p => ({ id: p.id, comment: p.comment })));
                        const newStr = JSON.stringify(latestImages.map(p => ({ id: p.id, comment: p.comment })));
                        return prevStr !== newStr ? latestImages : prev;
                    });
                } catch (e) {
                    console.error("Failed to poll images", e);
                }
            }
        }, 10000);
        return () => clearInterval(interval);
    }, [projectId, uploadingSectionId, setImages]);

    // Helper: Upload a single file to R2
    const uploadFile = async (file: File, folder: string = "images"): Promise<{ key: string, publicUrl: string }> => {
        const response = await getUploadUrl(file.name, file.type, projectId);

        if (!response.success || !response.url || !response.key) {
            throw new Error(response.error || "アップロードURLの取得に失敗しました");
        }

        const { url: uploadUrl, key, publicUrl } = response;

        await new Promise<void>((resolve, reject) => {
            const xhr = new XMLHttpRequest();
            xhr.open("PUT", uploadUrl, true);
            xhr.setRequestHeader("Content-Type", file.type);
            xhr.onload = () => {
                if (xhr.status === 200) resolve();
                else reject(new Error(`Upload failed with status ${xhr.status}`));
            };
            xhr.onerror = () => reject(new Error("Network Error"));
            xhr.send(file);
        });

        return { key, publicUrl: publicUrl || "" };
    };

    const handleImageUpload = async (sectionId: string, files: File[]) => {
        if (files.length === 0) return;
        // Validation... (same as before)
        for (const file of files) {
            if (!file.type.startsWith("image/")) {
                alert("画像ファイルのみアップロード可能です。");
                return;
            }
            if (file.size > 5 * 1024 * 1024) {
                alert(`ファイルサイズは5MB以下にしてください: ${file.name}`);
                return;
            }
        }

        setUploadingSectionId(sectionId);
        setUploadProgress(0);

        try {
            let processed = 0;
            const total = files.length;

            for (const file of files) {
                const { key } = await uploadFile(file);
                await confirmImageUpload(projectId, key, sectionId);
                processed++;
                setUploadProgress((processed / total) * 100);
            }

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

    const uploadReferenceImage = async (file: File): Promise<string | null> => {
        try {
            if (!file.type.startsWith("image/")) throw new Error("Not an image");

            // Re-use logic: for reference, maybe we don't track it in DB cookingImages?
            // Yes, just return URL.
            // But we need the Public URL.
            // I'll update `getUploadUrl` action to return `publicUrl` (derived from key).
            const { publicUrl } = await uploadFile(file);
            return publicUrl;
        } catch (error) {
            console.error("Ref upload error:", error);
            alert("参考画像のアップロードに失敗しました");
            return null;
        }
    };


    const handleDeleteImage = async (imageId: string) => {
        if (!confirm("画像を削除しますか？")) return;
        try {
            await deleteCookingImage(imageId);
            setImages(prev => prev.filter(img => img.id !== imageId));

            // If deleting current lightbox image, close or move
            if (isLightboxOpen) {
                setIsLightboxOpen(false);
            }
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

    const handleUpdateImageComment = async (imageId: string, comment: string) => {
        try {
            await updateCookingImageComment(imageId, comment);
            // Optimistic update
            setImages(prev => prev.map(img =>
                img.id === imageId ? { ...img, comment } : img
            ));
            // Also update lightbox images if open
            setLightboxImages(prev => prev.map(img =>
                img.id === imageId ? { ...img, comment } : img
            ));
        } catch (error) {
            console.error("Update comment error:", error);
            alert("コメントの更新に失敗しました。");
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
        handleUpdateImageComment,

        isLightboxOpen, setIsLightboxOpen,
        lightboxImages,
        lightboxImageIndex, setLightboxImageIndex,
        openLightbox,
        uploadReferenceImage
    };
}
