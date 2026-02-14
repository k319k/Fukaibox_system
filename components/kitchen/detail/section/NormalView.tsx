"use client";

import { Icon } from "@iconify/react";
import { Section } from "@/types/kitchen";
import React from "react";

interface NormalViewProps {
    section: Section;
    fontSize: number;
}

/**
 * 画像指示テキストをリッチ表示に変換する
 * 対応書式: **太字**, [テキスト](URL), 自動URL検出, 改行
 */
function renderRichText(text: string): React.ReactNode[] {
    const lines = text.split("\n");
    const result: React.ReactNode[] = [];

    lines.forEach((line, lineIdx) => {
        if (lineIdx > 0) result.push(<br key={`br-${lineIdx}`} />);

        // **太字** と [text](url) と 自動URLリンクを処理
        const pattern = /(\*\*(.+?)\*\*)|(\[([^\]]+)\]\((https?:\/\/[^\s)]+)\))|(https?:\/\/[^\s<]+)/g;
        let lastIndex = 0;
        let match;
        let partIdx = 0;

        while ((match = pattern.exec(line)) !== null) {
            // マッチ前のテキスト
            if (match.index > lastIndex) {
                result.push(line.slice(lastIndex, match.index));
            }

            if (match[1]) {
                // **太字**
                result.push(<strong key={`b-${lineIdx}-${partIdx}`}>{match[2]}</strong>);
            } else if (match[3]) {
                // [テキスト](URL)
                result.push(
                    <a key={`a-${lineIdx}-${partIdx}`} href={match[5]} target="_blank" rel="noopener noreferrer"
                        className="text-[var(--color-kitchen-link)] underline hover:text-[var(--color-kitchen-link-hover)]">{match[4]}</a>
                );
            } else if (match[6]) {
                // 自動URL検出
                result.push(
                    <a key={`u-${lineIdx}-${partIdx}`} href={match[6]} target="_blank" rel="noopener noreferrer"
                        className="text-[var(--color-kitchen-link)] underline hover:text-[var(--color-kitchen-link-hover)]">{match[6]}</a>
                );
            }
            lastIndex = match.index + match[0].length;
            partIdx++;
        }

        // 残りのテキスト
        if (lastIndex < line.length) {
            result.push(line.slice(lastIndex));
        }
    });

    return result;
}

export default function NormalView({ section, fontSize }: NormalViewProps) {
    return (
        <div className="space-y-3">
            <div
                className="whitespace-pre-wrap text-[var(--md-sys-color-on-surface)] leading-relaxed"
                style={{ fontSize: `${fontSize}px`, lineHeight: 1.6 }}
            >
                {section.content}
            </div>

            {section.imageInstruction && (
                <div className="bg-[var(--md-sys-color-primary)]/5 border-l-4 border-[var(--md-sys-color-primary)] pl-4 py-3 rounded-r mt-4">
                    <div className="flex items-center gap-2 mb-1">
                        <Icon icon="mdi:image-text" className="text-[var(--md-sys-color-primary)]" />
                        <p className="text-sm font-semibold text-[var(--md-sys-color-primary)]">画像指示</p>
                    </div>
                    <div className="text-sm">{renderRichText(section.imageInstruction)}</div>
                </div>
            )}

            {(() => {
                // Merge referenceImageUrl and referenceImageUrls, deduplicating
                const urls = new Set<string>();
                if (section.referenceImageUrls) section.referenceImageUrls.forEach(u => urls.add(u));
                if (section.referenceImageUrl) urls.add(section.referenceImageUrl);
                const allUrls = Array.from(urls);
                if (allUrls.length === 0) return null;
                return (
                    <div className="bg-[var(--md-sys-color-surface-container)] p-3 rounded-lg mt-4">
                        <p className="text-xs font-semibold text-[var(--md-sys-color-on-surface-variant)] mb-2">参考画像{allUrls.length > 1 ? `（${allUrls.length}枚）` : ""}</p>
                        <div className="flex gap-2 overflow-x-auto pb-2">
                            {allUrls.map((url, idx) => (
                                /* eslint-disable-next-line @next/next/no-img-element */
                                <img
                                    key={idx}
                                    src={url}
                                    alt={`参考画像${idx + 1}`}
                                    className="max-h-60 rounded border border-[var(--md-sys-color-outline-variant)] object-contain flex-shrink-0"
                                />
                            ))}
                        </div>
                    </div>
                );
            })()}
        </div>
    );
}

