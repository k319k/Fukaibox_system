"use client";

import { Icon } from "@iconify/react";
import { Section } from "@/types/kitchen";

interface NormalViewProps {
    section: Section;
    fontSize: number;
}

export default function NormalView({ section, fontSize }: NormalViewProps) {
    return (
        <div className="space-y-3">
            <div
                className="whitespace-pre-wrap text-foreground leading-relaxed"
                style={{ fontSize: `${fontSize}px`, lineHeight: 1.6 }}
            >
                {section.content}
            </div>

            {section.imageInstruction && (
                <div className="bg-primary/5 border-l-4 border-primary pl-4 py-3 rounded-r mt-4">
                    <div className="flex items-center gap-2 mb-1">
                        <Icon icon="mdi:image-text" className="text-primary" />
                        <p className="text-sm font-semibold text-primary">画像指示</p>
                    </div>
                    <p className="text-sm">{section.imageInstruction}</p>
                </div>
            )}

            {section.referenceImageUrl && (
                <div className="bg-default-100 p-3 rounded-lg mt-4">
                    <p className="text-xs font-semibold text-foreground-muted mb-2">参考画像</p>
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                        src={section.referenceImageUrl}
                        alt="参考画像"
                        className="max-h-60 max-w-full rounded border border-default-200 object-contain"
                    />
                </div>
            )}
        </div>
    );
}
