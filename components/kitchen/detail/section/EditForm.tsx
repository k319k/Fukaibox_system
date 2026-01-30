import { useState } from "react";
import { Input, Checkbox, Button, message } from "antd";
import { Icon } from "@iconify/react"; // Assuming Icon is available here, otherwise import
import CharacterCountDisplay from "./CharacterCountDisplay";

interface EditFormProps {
    content: string;
    imageInstruction: string;
    referenceImageUrl: string;
    allowImageSubmission: boolean;
    fontSize: number;
    onContentChange: (val: string) => void;
    onImageInstructionChange: (val: string) => void;
    onReferenceImageUrlChange: (val: string) => void;
    onAllowSubmissionChange: (val: boolean) => void;
    onUploadReferenceImage: (file: File) => Promise<string | null>;
}

export default function EditForm({
    content,
    imageInstruction,
    referenceImageUrl,
    allowImageSubmission,
    fontSize,
    onContentChange,
    onImageInstructionChange,
    onReferenceImageUrlChange,
    onAllowSubmissionChange,
    onUploadReferenceImage
}: EditFormProps) {
    const [isUploading, setIsUploading] = useState(false);

    const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;



        setIsUploading(true);
        try {
            const url = await onUploadReferenceImage(file);
            if (url) {
                onReferenceImageUrlChange(url);
                message.success("画像をアップロードしました");
            }
        } catch (error) {
            console.error("Upload failed", error);
            message.error("アップロードに失敗しました");
        } finally {
            setIsUploading(false);
            e.target.value = ""; // Reset input
        }
    };

    return (
        <div className="space-y-4">
            <textarea
                value={content}
                onChange={(e) => onContentChange(e.target.value)}
                className="w-full p-3 border rounded-md focus:ring-2 focus:ring-[#73342b] focus:border-transparent outline-none bg-[var(--md-sys-color-surface-container)] text-[var(--md-sys-color-on-surface)] resize-y"
                style={{ minHeight: "120px", fontSize: `${fontSize}px`, lineHeight: 1.6 }}
                placeholder="台本を入力..."
                autoFocus
            />
            <CharacterCountDisplay text={content} />

            <div className="space-y-2">
                <label className="text-sm font-medium text-[var(--md-sys-color-on-surface)]">画像指示</label>
                <Input
                    placeholder="このシーンの画像イメージや構図の指示を入力"
                    value={imageInstruction}
                    onChange={(e) => onImageInstructionChange(e.target.value)}
                    size="middle"
                />
            </div>

            <div className="space-y-2">
                <label className="text-sm font-medium text-[var(--md-sys-color-on-surface)]">参考画像URL</label>
                <div className="flex gap-2">
                    <Input
                        placeholder="https://..."
                        value={referenceImageUrl}
                        onChange={(e) => onReferenceImageUrlChange(e.target.value)}
                        size="middle"
                        className="flex-1"
                    />
                    <div className="relative">
                        <input
                            type="file"
                            accept="image/*"
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
                                // Button as label trigger might need `as="span"` or `component="span"` to be valid HTML but AntD Button onclick might interfere.
                                // Better: Button with onClick triggering document.getElementById... No, label wrapping works usually if pointer-events allow.
                                // Safest: onClick triggering ref.
                                onClick={() => document.getElementById("ref-image-upload")?.click()}
                            >
                                UP
                            </Button>
                        </label>
                    </div>
                </div>
                {referenceImageUrl && (
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
