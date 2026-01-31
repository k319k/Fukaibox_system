"use client";

import { PlayCircleOutlined, EyeOutlined, ShareAltOutlined } from "@ant-design/icons";
import { ForkOutlined } from "@ant-design/icons";
import { M3Button } from "@/components/ui/m3-button";

interface AppCardProps {
    app: {
        id: string;
        name: string;
        description: string | null;
        isPublic: boolean | null;
        viewCount: number | null;
        remixCount: number | null;
        remixFrom: string | null;
        updatedAt: Date;
    };
    onRun: (id: string) => void;
    onRemix?: (id: string) => void;
    onShare?: (id: string) => void;
    isRemixing?: boolean;
    isOwned?: boolean;
}

export function AppCard({ app, onRun, onRemix, onShare, isRemixing, isOwned }: AppCardProps) {
    return (
        <div
            className="group relative flex flex-col overflow-hidden transition-all duration-200 m3-card-filled hover:shadow-md"
            style={{
                backgroundColor: 'var(--md-sys-color-surface-container-high)',
                borderRadius: 'var(--radius-lg)'
            }}
        >
            {/* Status Badge */}
            <div className={`absolute top-3 right-3 z-20 px-2 py-1 text-[10px] font-bold rounded-full shadow-sm ${app.isPublic
                ? "bg-[var(--md-sys-color-primary-container)] text-[var(--md-sys-color-on-primary-container)]"
                : "bg-[var(--md-sys-color-surface-container-highest)] text-[var(--md-sys-color-on-surface-variant)]"
                }`}>
                {app.isPublic ? "PUBLIC" : "PRIVATE"}
            </div>

            {/* Cover */}
            <div
                className="h-32 w-full relative overflow-hidden bg-[var(--md-sys-color-surface-container-highest)] cursor-pointer"
                onClick={() => onRun(app.id)}
            >
                <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity bg-black/20 z-10">
                    <PlayCircleOutlined className="text-3xl text-white drop-shadow-md" />
                </div>
                {/* Gradient Placeholder */}
                <div className="absolute inset-0 bg-gradient-to-br from-[var(--md-sys-color-surface-container-low)] to-[var(--md-sys-color-surface-container-highest)]" />

                {/* App Icon / Initial */}
                <div className="absolute inset-0 flex items-center justify-center">
                    <span className="text-4xl font-bold opacity-10 select-none pb-2" style={{ color: 'var(--md-sys-color-on-surface-variant)' }}>
                        {app.name.slice(0, 1).toUpperCase()}
                    </span>
                </div>
            </div>

            {/* Content */}
            <div className="flex flex-col p-4 gap-2 flex-1">
                <h3 className="text-base font-medium truncate leading-tight" style={{ color: 'var(--md-sys-color-on-surface)' }}>
                    {app.name}
                </h3>
                <p className="text-xs line-clamp-2 h-8" style={{ color: 'var(--md-sys-color-on-surface-variant)' }}>
                    {app.description || "No description provided."}
                </p>

                {/* Remix Info */}
                {app.remixFrom && (
                    <div className="flex items-center gap-1 text-[10px]" style={{ color: 'var(--md-sys-color-tertiary)' }}>
                        <ForkOutlined />
                        <span>Remixed</span>
                    </div>
                )}

                {/* Stats */}
                <div className="flex items-center justify-between mt-auto pt-2 border-t border-[var(--md-sys-color-outline-variant)]/20">
                    <div className="flex items-center gap-3">
                        <span className="text-[10px] flex items-center gap-1" style={{ color: 'var(--md-sys-color-on-surface-variant)' }}>
                            <EyeOutlined /> {app.viewCount || 0}
                        </span>
                        {app.remixCount !== null && app.remixCount > 0 && (
                            <span className="text-[10px] flex items-center gap-1" style={{ color: 'var(--md-sys-color-on-surface-variant)' }}>
                                <ForkOutlined /> {app.remixCount}
                            </span>
                        )}
                    </div>
                    <span className="text-[10px]" style={{ color: 'var(--md-sys-color-on-surface-variant)' }}>
                        {new Intl.DateTimeFormat('ja-JP', { dateStyle: 'medium' }).format(new Date(app.updatedAt))}
                    </span>
                </div>

                {/* Action Buttons */}
                <div className="flex gap-2 mt-2">
                    {onRemix && !isOwned && (
                        <M3Button
                            variant="tonal"
                            icon={<ForkOutlined />}
                            onClick={(e) => {
                                e.stopPropagation();
                                onRemix(app.id);
                            }}
                            disabled={isRemixing}
                            className="flex-1 text-xs h-8"
                        >
                            {isRemixing ? "..." : "Remix"}
                        </M3Button>
                    )}
                    {onShare && (
                        <M3Button
                            variant="outlined"
                            icon={<ShareAltOutlined />}
                            onClick={(e) => {
                                e.stopPropagation();
                                onShare(app.id);
                            }}
                            className="flex-1 text-xs h-8"
                        >
                            共有
                        </M3Button>
                    )}
                </div>
            </div>

            {/* M3 State Layer */}
            <div className="absolute inset-0 bg-[var(--md-sys-color-on-surface)] opacity-0 group-hover:opacity-[0.08] transition-opacity pointer-events-none" />
        </div>
    );
}
