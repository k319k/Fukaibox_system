"use client";

import { Radio, Tooltip } from "antd";
import { PresenceStatus } from "@/hooks/kitchen/usePresence";

interface StatusSelectionFooterProps {
    myStatus: PresenceStatus;
    myUploadCount: number;
    onStatusUpdate: (status: PresenceStatus) => Promise<void>;
}

export default function StatusSelectionFooter({ myStatus, myUploadCount, onStatusUpdate }: StatusSelectionFooterProps) {
    return (
        <div className="fixed bottom-0 left-0 right-0 p-4 bg-[var(--md-sys-color-surface-container-high)] border-t border-[var(--md-sys-color-outline-variant)] shadow-lg z-40 flex justify-center items-center gap-4">
            <span className="text-label-large font-bold hidden sm:inline">あなたのステータス:</span>
            <Radio.Group
                value={myStatus}
                onChange={(e) => {
                    if (e.target.value === "completed" && myUploadCount === 0) {
                        return;
                    }
                    onStatusUpdate(e.target.value);
                }}
                buttonStyle="solid"
                className="flex gap-2"
            >
                <Radio.Button value="not_participating">不参加</Radio.Button>
                <Radio.Button value="participating">画像提出参加</Radio.Button>
                <Tooltip title={myUploadCount === 0 ? "画像を1枚以上提出すると選択できます" : ""}>
                    <Radio.Button value="completed" disabled={myUploadCount === 0}>
                        提出完了
                    </Radio.Button>
                </Tooltip>
            </Radio.Group>
        </div>
    );
}
