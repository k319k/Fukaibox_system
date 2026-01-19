"use client";

import { Checkbox, Input } from "@heroui/react";

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
    onAllowSubmissionChange
}: EditFormProps) {
    return (
        <div className="space-y-4">
            <textarea
                value={content}
                onChange={(e) => onContentChange(e.target.value)}
                className="w-full p-3 border rounded-md focus:ring-2 focus:ring-primary focus:border-transparent outline-none bg-default-50 text-foreground"
                style={{ minHeight: "120px", fontSize: `${fontSize}px`, lineHeight: 1.6 }}
                placeholder="台本を入力..."
                autoFocus
            />

            <div className="space-y-2">
                <Input
                    label="画像指示"
                    placeholder="このシーンの画像イメージや構図の指示を入力"
                    value={imageInstruction}
                    onValueChange={onImageInstructionChange}
                    variant="bordered"
                    size="sm"
                />
            </div>

            <div className="space-y-2">
                <Input
                    label="参考画像URL"
                    placeholder="https://..."
                    value={referenceImageUrl}
                    onValueChange={onReferenceImageUrlChange}
                    variant="bordered"
                    size="sm"
                />
                {referenceImageUrl && (
                    <div className="mt-2 p-2 bg-default-50 rounded border border-default-200 inline-block">
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
                isSelected={allowImageSubmission}
                onValueChange={onAllowSubmissionChange}
            >
                画像の提出を許可する
            </Checkbox>
        </div>
    );
}
