"use client";

import { Chip } from "@heroui/react";
import { Icon } from "@iconify/react";
import { useMemo } from "react";

interface CharacterCountDisplayProps {
    text: string;
    /** 1秒あたりの文字数（デフォルト: 250文字/30秒 ≈ 8.33文字/秒） */
    charsPerSecond?: number;
}

/**
 * 文字数と予測完成尺を表示するコンポーネント
 * 計算式: 250文字 = 30秒目安
 */
export default function CharacterCountDisplay({
    text,
    charsPerSecond = 250 / 30
}: CharacterCountDisplayProps) {
    const stats = useMemo(() => {
        const charCount = text.length;
        const totalSeconds = Math.round(charCount / charsPerSecond);
        const minutes = Math.floor(totalSeconds / 60);
        const seconds = totalSeconds % 60;

        let durationText: string;
        if (minutes > 0) {
            durationText = `約${minutes}分${seconds.toString().padStart(2, "0")}秒`;
        } else {
            durationText = `約${seconds}秒`;
        }

        return { charCount, durationText };
    }, [text, charsPerSecond]);

    if (!text || text.trim().length === 0) {
        return null;
    }

    return (
        <div className="flex flex-wrap items-center gap-3">
            <Chip
                size="sm"
                variant="flat"
                color="primary"
                startContent={<Icon icon="mdi:text" className="text-sm" />}
            >
                {stats.charCount.toLocaleString()}文字
            </Chip>
            <Chip
                size="sm"
                variant="flat"
                color="secondary"
                startContent={<Icon icon="mdi:timer-outline" className="text-sm" />}
            >
                予測尺: {stats.durationText}
            </Chip>
            <span className="text-xs text-foreground-muted">
                (250文字≒30秒)
            </span>
        </div>
    );
}
