"use client";

interface ProposalFormProps {
    content: string;
    fontSize: number;
    onContentChange: (val: string) => void;
}

export default function ProposalForm({
    content,
    fontSize,
    onContentChange
}: ProposalFormProps) {
    return (
        <div className="space-y-2">
            <textarea
                value={content}
                onChange={(e) => onContentChange(e.target.value)}
                className="w-full p-3 border-2 border-secondary/50 rounded-md focus:ring-2 focus:ring-secondary focus:border-transparent outline-none bg-secondary/5 text-foreground"
                style={{ minHeight: "120px", fontSize: `${fontSize}px`, lineHeight: 1.6 }}
                placeholder="推敲提案を入力..."
                autoFocus
            />
            <div className="text-xs text-secondary mt-1">
                修正案を入力して提案ボタンを押してください。
            </div>
        </div>
    );
}
