import { useState } from "react";
import { Input, Checkbox, Button, message } from "antd";
import { Icon } from "@iconify/react"; // Assuming Icon is available here, otherwise import
import CharacterCountDisplay from "./CharacterCountDisplay";

interface EditFormProps {
    content: string;
    imageInstruction: string;
    referenceImageUrl: string;
    referenceImageUrls: string[];
    allowImageSubmission: boolean;
    fontSize: number;
    onContentChange: (val: string) => void;
    onImageInstructionChange: (val: string) => void;
    onReferenceImageUrlChange: (val: string) => void;
    onReferenceImageUrlsChange: (val: string[]) => void;
    onAllowSubmissionChange: (val: boolean) => void;
    onUploadReferenceImage: (file: File) => Promise<string | null>;
}

export default function EditForm({
    content,
    imageInstruction,
    referenceImageUrl,
    referenceImageUrls,
    allowImageSubmission,
    fontSize,
    onContentChange,
    onImageInstructionChange,
    onReferenceImageUrlChange,
    onReferenceImageUrlsChange,
    onAllowSubmissionChange,
    onUploadReferenceImage
}: EditFormProps) {
    const [isUploading, setIsUploading] = useState(false);

    const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = e.target.files;
        if (!files || files.length === 0) return;

        setIsUploading(true);
        try {
            const newUrls: string[] = [];
            for (let i = 0; i < files.length; i++) {
                const url = await onUploadReferenceImage(files[i]);
                if (url) {
                    newUrls.push(url);
                }
            }
            if (newUrls.length > 0) {
                // 既存のURLリストに追加
                onReferenceImageUrlsChange([...referenceImageUrls, ...newUrls]);
                // レガシー: 最初のURLを単体フィールドにも保存
                if (!referenceImageUrl && newUrls[0]) {
                    onReferenceImageUrlChange(newUrls[0]);
                }
                message.success(`${newUrls.length}枚の画像をアップロードしました`);
            }
        } catch (error) {
            console.error("Upload failed", error);
            message.error("アップロードに失敗しました");
        } finally {
            setIsUploading(false);
            e.target.value = ""; // Reset input
        }
    };

    const handleRemoveImage = (index: number) => {
        const updated = referenceImageUrls.filter((_, i) => i !== index);
        onReferenceImageUrlsChange(updated);
        // レガシー: 配列の最初のURLを単体フィールドに反映
        onReferenceImageUrlChange(updated[0] || "");
    };

    return (
        <div className="space-y-4">
            <textarea
                value={content}
                onChange={(e) => onContentChange(e.target.value)}
                className="w-full p-3 border rounded-md focus:ring-2 focus:ring-[var(--color-kitchen-tag-text)] focus:border-transparent outline-none bg-[var(--md-sys-color-surface-container)] text-[var(--md-sys-color-on-surface)] resize-y"
                style={{ minHeight: "120px", fontSize: `${fontSize}px`, lineHeight: 1.6 }}
                placeholder="台本を入力..."
                autoFocus
            />
            <CharacterCountDisplay text={content} />

            <div className="space-y-2">
                <label className="text-sm font-medium text-[var(--md-sys-color-on-surface)]">画像指示</label>
                <Input.TextArea
                    placeholder={"このシーンの画像イメージや構図の指示を入力\n\n書式: **太字** / [リンクテキスト](URL)"}
                    value={imageInstruction}
                    onChange={(e) => onImageInstructionChange(e.target.value)}
                    autoSize={{ minRows: 2, maxRows: 8 }}
                />
            </div>

            <div className="space-y-2">
                <label className="text-sm font-medium text-[var(--md-sys-color-on-surface)]">参考画像</label>
                <div className="flex gap-2">
                    <div className="relative">
                        <input
                            type="file"
                            accept="image/*"
                            multiple
                            onChange={handleFileChange}
                            className="hidden"
                            id="ref-image-upload"
                            disabled={isUploading}
                        />
                        <label htmlFor="ref-image-upload">
                            <Button
                                icon={<Icon icon="mdi:upload" />}
                                loading={isUploading}
                                disabled={isUploading}
                                className="flex items-center"
                                onClick={() => document.getElementById("ref-image-upload")?.click()}
                            >
                                画像をアップロード
                            </Button>
                        </label>
                    </div>
                </div>
                {referenceImageUrls.length > 0 && (
                    <div className="flex gap-2 flex-wrap mt-2">
                        {referenceImageUrls.map((url, idx) => (
                            <div key={idx} className="relative group p-1 bg-[var(--md-sys-color-surface-container)] rounded border border-[var(--md-sys-color-outline-variant)]">
                                {/* eslint-disable-next-line @next/next/no-img-element */}
                                <img
                                    src={url}
                                    alt={`参考画像${idx + 1}`}
                                    className="h-20 object-contain"
                                    onError={(e) => (e.currentTarget.style.display = 'none')}
                                />
                                <button
                                    type="button"
                                    onClick={() => handleRemoveImage(idx)}
                                    className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs opacity-0 group-hover:opacity-100 transition-opacity"
                                    title="削除"
                                >
                                    ×
                                </button>
                            </div>
                        ))}
                    </div>
                )}
                {/* レガシー: referenceImageUrlが設定されているが、referenceImageUrlsが空の場合のフォールバック表示 */}
                {referenceImageUrl && referenceImageUrls.length === 0 && (
                    <div className="mt-2 p-2 bg-[var(--md-sys-color-surface-container)] rounded border border-[var(--md-sys-color-outline-variant)] inline-block">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                            src={referenceImageUrl}
                            alt="preview"
                            className="h-20 object-contain"
                            onError={(e) => (e.currentTarget.style.display = 'none')}
                        />
                    </div>
                )}
            </div>

            <Checkbox
                checked={allowImageSubmission}
                onChange={(e) => onAllowSubmissionChange(e.target.checked)}
            >
                画像の提出を許可する
            </Checkbox>
        </div>
    );
}
