"use client";

import { useState } from "react";
import JSZip from "jszip";
import { getProjectScript, getProjectScriptBodyOnly, getSelectedImages } from "@/app/actions/kitchen";

export function useDownloads(projectId: string, projectTitle: string) {
    const [downloading, setDownloading] = useState(false);

    /**
     * 詳細版台本（セクション見出し・画像指示込み）をダウンロード
     */
    const handleDownloadScript = async () => {
        setDownloading(true);
        try {
            const script = await getProjectScript(projectId);
            if (!script) {
                alert("台本データが見つかりません");
                return;
            }

            const blob = new Blob([script], { type: "text/plain" });
            const url = URL.createObjectURL(blob);
            const a = document.createElement("a");
            a.href = url;
            a.download = `${projectTitle}_台本_詳細版.txt`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
        } catch (error) {
            console.error("Download script error:", error);
            alert("台本のダウンロードに失敗しました");
        } finally {
            setDownloading(false);
        }
    };

    /**
     * 本文のみ版台本（セクション見出し・画像指示なし）をダウンロード
     */
    const handleDownloadScriptBodyOnly = async () => {
        setDownloading(true);
        try {
            const script = await getProjectScriptBodyOnly(projectId);
            if (!script) {
                alert("台本データが見つかりません");
                return;
            }

            const blob = new Blob([script], { type: "text/plain" });
            const url = URL.createObjectURL(blob);
            const a = document.createElement("a");
            a.href = url;
            a.download = `${projectTitle}_台本_本文のみ.txt`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
        } catch (error) {
            console.error("Download script body only error:", error);
            alert("台本のダウンロードに失敗しました");
        } finally {
            setDownloading(false);
        }
    };

    const handleDownloadImages = async () => {
        setDownloading(true);
        try {
            const images = await getSelectedImages(projectId);
            if (images.length === 0) {
                alert("採用された画像がありません");
                return;
            }

            const zip = new JSZip();
            const folder = zip.folder(`${projectTitle}_採用画像`);

            await Promise.all(images.map(async (img) => {
                const response = await fetch(img.imageUrl);
                const blob = await response.blob();
                // ファイル名を決定（元のファイル名がない場合はIDを使用）
                const ext = img.imageUrl.split('.').pop()?.split('?')[0] || "jpg";
                const filename = `Section${(img.sectionId ? "??" : "Unknown")}_${img.id}.${ext}`;
                // Section index would be nice but hard to get here efficiently without lookup map.
                // Using ID for now. User might want order.
                // Let's keep it simple for now, file name optimization can be done later if requested.

                folder?.file(filename, blob);
            }));

            const content = await zip.generateAsync({ type: "blob" });
            const url = URL.createObjectURL(content);
            const a = document.createElement("a");
            a.href = url;
            a.download = `${projectTitle}_採用画像.zip`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);

        } catch (error) {
            console.error("Download images error:", error);
            alert("画像のダウンロードに失敗しました");
        } finally {
            setDownloading(false);
        }
    };

    const handleDownloadProject = async () => {
        setDownloading(true);
        try {
            const zip = new JSZip();
            const root = zip.folder(projectTitle);

            // 1. Script
            const script = await getProjectScript(projectId);
            if (script) {
                root?.file("台本.txt", script);
            }

            // 2. Images
            const images = await getSelectedImages(projectId);
            if (images.length > 0) {
                const imgFolder = root?.folder("images");
                await Promise.all(images.map(async (img) => {
                    try {
                        const response = await fetch(img.imageUrl);
                        const blob = await response.blob();
                        const ext = img.imageUrl.split('.').pop()?.split('?')[0] || "jpg";
                        imgFolder?.file(`${img.id}.${ext}`, blob);
                    } catch (e) {
                        console.error(`Failed to download image ${img.id}`, e);
                    }
                }));
            }

            const content = await zip.generateAsync({ type: "blob" });
            const url = URL.createObjectURL(content);
            const a = document.createElement("a");
            a.href = url;
            a.download = `${projectTitle}_一式.zip`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);

        } catch (error) {
            console.error("Project download error:", error);
            alert("ダウンロードに失敗しました");
        } finally {
            setDownloading(false);
        }
    };

    return { downloading, handleDownloadScript, handleDownloadScriptBodyOnly, handleDownloadImages, handleDownloadProject };
}
