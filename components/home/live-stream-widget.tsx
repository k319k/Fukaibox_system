"use client";

import { Card, Tag } from "antd";
import Link from "next/link";
import { Icon } from "@iconify/react";
import { formatDate, formatRelativeTime } from "@/lib/youtube";
import type { YouTubeVideo } from "@/lib/youtube";
import Image from "next/image";
import { motion } from "framer-motion";

interface LiveStreamWidgetProps {
    latestStream: YouTubeVideo | null;
}

export function LiveStreamWidget({ latestStream }: LiveStreamWidgetProps) {
    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
        >
            <Card
                className="bg-[var(--md-sys-color-surface-container-lowest)] rounded-[28px] border-none shadow-none min-h-[440px] relative overflow-hidden"
                styles={{ body: { padding: 0 } }}
            >
                <div className="p-8 pb-0">
                    <div className="flex justify-between items-center w-full">
                        <div>
                            <h2 className="text-2xl font-bold tracking-tight flex items-center gap-4 text-[var(--md-sys-color-on-surface)]">
                                <span className="w-3 h-3 rounded-full bg-[#73342b] shadow-[0_0_12px_rgba(115,52,43,0.4)]" />
                                最新の配信
                            </h2>
                            <p className="text-lg font-medium tracking-normal text-[var(--md-sys-color-on-surface-variant)] mt-1 opacity-80">
                                トキノヒロバ
                            </p>
                        </div>
                        {latestStream && (
                            <Tag className="text-[11px] font-bold uppercase tracking-[0.1em] rounded-full px-4 py-1 bg-[#ffdad5] text-[#73342b] border-none">
                                {formatRelativeTime(latestStream.publishedAt)}
                            </Tag>
                        )}
                    </div>
                </div>
                <div className="p-8 flex flex-col flex-grow">
                    {latestStream ? (
                        <Link href={latestStream.videoUrl} target="_blank" className="flex flex-col flex-grow group">
                            <motion.div whileTap={{ scale: 0.98 }}>
                                <div className="aspect-video rounded-[20px] bg-[var(--md-sys-color-surface-container-highest)] mb-5 overflow-hidden relative shadow-sm group-hover:shadow-lg transition-all duration-300">
                                    <Image
                                        src={latestStream.thumbnailUrl}
                                        alt={latestStream.title}
                                        fill
                                        className="object-cover"
                                        unoptimized
                                    />
                                    <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity bg-black/20 backdrop-blur-[2px]">
                                        <div className="w-16 h-16 bg-[#fff8f6]/95 rounded-full flex items-center justify-center shadow-xl transform group-hover:scale-110 transition-transform text-[#73342b] pl-1">
                                            <Icon icon="material-symbols:play-arrow" className="w-8 h-8" />
                                        </div>
                                    </div>
                                </div>
                            </motion.div>
                            <h3 className="text-lg font-medium tracking-normal group-hover:text-[#73342b] transition-colors line-clamp-2 leading-relaxed text-[var(--md-sys-color-on-surface)]">
                                {latestStream.title}
                            </h3>
                            <div className="flex items-center gap-3 mt-3 text-[var(--md-sys-color-on-surface-variant)]">
                                <Tag className="rounded-full bg-[var(--md-sys-color-surface-container-high)] border-none">配信</Tag>
                                <span className="text-base font-normal leading-relaxed">{formatDate(latestStream.publishedAt)}</span>
                                <Icon icon="material-symbols:open-in-new" className="w-4 h-4 ml-auto opacity-50" />
                            </div>
                        </Link>
                    ) : (
                        <div className="text-center space-y-8 opacity-70 flex-grow flex flex-col items-center justify-center">
                            <div className="w-40 h-40 mx-auto rounded-full bg-[var(--md-sys-color-surface-container-highest)] flex items-center justify-center shadow-inner ring-4 ring-[#fff8f6]">
                                <Icon icon="material-symbols:tv" className="w-20 h-20 text-[var(--md-sys-color-on-surface-variant)]" />
                            </div>
                            <p className="text-2xl font-bold tracking-tight text-[var(--md-sys-color-on-surface-variant)]">
                                配信情報を取得できませんでした
                            </p>
                        </div>
                    )}
                </div>
                <div className="absolute -top-20 -right-20 w-[500px] h-[500px] bg-gradient-to-br from-[#ffdad5] to-transparent opacity-20 rounded-full blur-3xl pointer-events-none" />
            </Card>
        </motion.div>
    );
}
