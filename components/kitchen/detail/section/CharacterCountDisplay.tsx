"use client";

import { Tag } from "antd";
import { Icon } from "@iconify/react";
import { useMemo } from "react";

interface CharacterCountDisplayProps {
    text: string;
    /** 1秒あたりの文字数（デフォルト: 250文字/30秒 ≈ 8.33文字/秒） */
    charsPerSecond?: number;
    /** セクション分割数をプレビュー表示するか（デフォルト: false） */
    showSectionPreview?: boolean;
}

/**
 * 文字数、予測完成尺、セクション分割数を表示するコンポーネント
 * 計算式: 250文字 = 30秒目安
 * 分割ロジック: 空行（\n\n または \r\n\r\n）で分割
 */
export default function CharacterCountDisplay({
    text,
    charsPerSecond = 250 / 30,
    showSectionPreview = false
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

        // セクション分割数のプレビュー（projects.tsと同じロジック）
        const sectionCount = text.trim()
            ? text.split(/\n\n+|\r\n\r\n+/)
                .map(s => s.trim())
                .filter(s => s.length > 0).length
            : 0;

        return { charCount, durationText, sectionCount };
    }, [text, charsPerSecond]);

    if (!text || text.trim().length === 0) {
        return null;
    }

    return (
        <div className="flex flex-wrap items-center gap-3">
            <Tag
                className="rounded-full bg-[var(--color-kitchen-tag-bg)] text-[var(--color-kitchen-tag-text)] border-none flex items-center gap-1"
            >
                <Icon icon="mdi:text" className="text-sm" />
                {stats.charCount.toLocaleString()}文字
            </Tag>
            <Tag
                className="rounded-full bg-[var(--color-kitchen-candidate-bg)] text-[var(--color-kitchen-candidate-text)] border-none flex items-center gap-1"
            >
                <Icon icon="mdi:timer-outline" className="text-sm" />
                予測尺: {stats.durationText}
            </Tag>
            {showSectionPreview && stats.sectionCount > 0 && (
                <Tag
                    className="rounded-full bg-[var(--color-kitchen-success-bg)] text-[var(--color-kitchen-success-text)] border-none flex items-center gap-1"
                >
                    <Icon icon="mdi:format-list-numbered" className="text-sm" />
                    {stats.sectionCount}セクションに分割
                </Tag>
            )}
            <span className="text-xs text-[var(--md-sys-color-on-surface-variant)]">
                (250文字≒30秒)
            </span>
        </div>
    );
}
