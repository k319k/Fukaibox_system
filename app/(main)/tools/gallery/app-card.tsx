"use client";

import { PlayCircleFilled, EyeOutlined, ShareAltOutlined } from "@ant-design/icons";
import { ForkOutlined, CodeOutlined, Html5Outlined, PythonOutlined } from "@ant-design/icons";
import { M3Button } from "@/components/ui/m3-button";
import { Tooltip } from "antd";

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
        type?: string;
    };
    onRun: (id: string) => void;
    onRemix?: (id: string) => void;
    onShare?: (id: string) => void;
    isRemixing?: boolean;
    isOwned?: boolean;
}

export function AppCard({ app, onRun, onRemix, onShare, isRemixing, isOwned }: AppCardProps) {
    // Generate a consistent gradient based on app ID or name
    const getGradient = (id: string) => {
        const colors = [
            'from-rose-400 to-orange-300',
            'from-violet-400 to-fuchsia-300',
            'from-cyan-400 to-blue-300',
            'from-emerald-400 to-teal-300',
            'from-amber-400 to-yellow-300',
        ];
        // Use last char code to vary
        const index = id.charCodeAt(id.length - 1) % colors.length;
        return colors[index];
    };

    const gradient = getGradient(app.id);

    const getTypeIcon = (type?: string) => {
        if (type?.includes('html')) return <Html5Outlined />;
        if (type === 'python') return <PythonOutlined />;
        return <CodeOutlined />;
    };

    return (
        <div
            className="group relative flex flex-col overflow-hidden transition-all duration-300 m3-card-elevated hover:shadow-xl hover:-translate-y-1"
            style={{
                backgroundColor: 'var(--md-sys-color-surface-container)',
                borderRadius: 'var(--radius-xl)',
                height: '320px'
            }}
        >
            {/* Status & Type Badges */}
            <div className="absolute top-4 left-4 z-20 flex gap-2">
                <div className="px-3 py-1 text-[10px] font-bold rounded-full shadow-sm backdrop-blur-md bg-white/30 text-white flex items-center gap-1">
                    {getTypeIcon(app.type)}
                    <span>{app.type === 'python' ? 'PYTHON' : (app.type?.includes('html') ? 'HTML' : 'REACT')}</span>
                </div>
            </div>

            <div className={`absolute top-4 right-4 z-20 px-3 py-1 text-[10px] font-bold rounded-full shadow-sm backdrop-blur-md ${app.isPublic
                ? "bg-green-500/80 text-white"
                : "bg-gray-500/80 text-white"
                }`}>
                {app.isPublic ? "PUBLIC" : "PRIVATE"}
            </div>

            {/* Cover Image (Gradient) */}
            <div
                className={`h-40 w-full relative overflow-hidden bg-gradient-to-br ${gradient} cursor-pointer`}
                onClick={() => onRun(app.id)}
            >
                <div className="absolute inset-0 bg-black/10 group-hover:bg-black/20 transition-colors" />

                {/* Play Button Overlay */}
                <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300 transform scale-90 group-hover:scale-100">
                    <PlayCircleFilled className="text-6xl text-white drop-shadow-lg" />
                </div>

                {/* App Initial */}
                <div className="absolute bottom-[-20px] right-[-10px] text-9xl font-black opacity-20 select-none text-white rotate-[-10deg]">
                    {app.name.slice(0, 1).toUpperCase()}
                </div>
            </div>

            {/* Content */}
            <div className="flex flex-col p-5 gap-2 flex-1 relative">
                <h3 className="text-lg font-bold truncate leading-tight tracking-tight" style={{ color: 'var(--md-sys-color-on-surface)' }}>
                    {app.name}
                </h3>

                <p className="text-xs line-clamp-2 leading-relaxed opacity-80 h-10" style={{ color: 'var(--md-sys-color-on-surface-variant)' }}>
                    {app.description || "No description provided."}
                </p>

                {/* Remix Info */}
                {app.remixFrom && (
                    <div className="flex items-center gap-1 text-[10px] mt-1" style={{ color: 'var(--md-sys-color-tertiary)' }}>
                        <ForkOutlined />
                        <span>Remixed</span>
                    </div>
                )}

                <div className="flex-1" />

                {/* Footer: Stats & Actions */}
                <div className="flex items-center justify-between mt-2 pt-3 border-t border-[var(--md-sys-color-outline-variant)]/20">
                    <div className="flex items-center gap-3 text-xs opacity-70" style={{ color: 'var(--md-sys-color-on-surface-variant)' }}>
                        <Tooltip title="View Count">
                            <span className="flex items-center gap-1"><EyeOutlined /> {app.viewCount || 0}</span>
                        </Tooltip>
                        {app.remixCount !== null && app.remixCount > 0 && (
                            <Tooltip title="Remix Count">
                                <span className="flex items-center gap-1"><ForkOutlined /> {app.remixCount}</span>
                            </Tooltip>
                        )}
                    </div>

                    <div className="flex gap-1 opacity-100 transition-opacity">
                        {onShare && (
                            <M3Button
                                variant="text"
                                icon={<ShareAltOutlined />}
                                onClick={() => onShare(app.id)}
                                size="small"
                                className="!w-8 !h-8 !p-0"
                            />
                        )}
                        {onRemix && !isOwned && (
                            <M3Button
                                variant="tonal"
                                icon={<ForkOutlined />}
                                onClick={() => onRemix(app.id)}
                                disabled={isRemixing}
                                size="small"
                                className="!h-8 text-[11px]"
                            >
                                Remix
                            </M3Button>
                        )}
                        {isOwned && onRun && (
                            <M3Button
                                variant="filled"
                                onClick={() => onRun(app.id)}
                                size="small"
                                className="!h-8 text-[11px]"
                            >
                                Edit
                            </M3Button>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
