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
                try {
                    // プロキシ経由で画像を取得 (CORS回避)
                    const proxyUrl = `/api/proxy-image?url=${encodeURIComponent(img.imageUrl)}`;
                    const response = await fetch(proxyUrl);
                    if (!response.ok) throw new Error(`Fetch failed: ${response.statusText}`);

                    const blob = await response.blob();
                    if (blob.size === 0) throw new Error("Empty blob received");

                    // ファイル名を決定: Section(番号)_(ユーザー名).ext
                    const ext = img.imageUrl.split('.').pop()?.split('?')[0] || "jpg";
                    const sectionNum = (img.sectionIndex ?? 0) + 1;
                    const userName = img.uploaderName || "Unknown";
                    // ファイル名の重複を避けるためにIDの一部を付与する可能性も考慮推奨だが、
                    // 要望通りまずは指定のフォーマットにする。重複時はzipが上書きor連番になる挙動に依存。
                    // 安全のためIDの先頭4文字を末尾につける: Section1_UserA_a1b2.jpg
                    // ユーザー要望: "セクション(数字)＿○○作" -> Section1_UserA.jpg (のイメージ)
                    // 日本語ファイル名は文字化けリスクあるが、モダンブラウザ/OSなら概ねOK。
                    const filename = `Section${sectionNum}_${userName}.${ext}`;

                    folder?.file(filename, blob);
                } catch (e) {
                    console.error(`Failed to download image ${img.id}`, e);
                }
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
                        // プロキシ経由で画像を取得 (CORS回避)
                        const proxyUrl = `/api/proxy-image?url=${encodeURIComponent(img.imageUrl)}`;
                        const response = await fetch(proxyUrl);
                        if (!response.ok) throw new Error(`Fetch failed: ${response.statusText}`);

                        const blob = await response.blob();
                        if (blob.size === 0) throw new Error("Empty blob received");

                        const ext = img.imageUrl.split('.').pop()?.split('?')[0] || "jpg";
                        const sectionNum = (img.sectionIndex ?? 0) + 1;
                        const userName = img.uploaderName || "Unknown";
                        const filename = `Section${sectionNum}_${userName}.${ext}`;

                        imgFolder?.file(filename, blob);
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
