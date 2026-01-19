"use client";

import { Card, CardBody, CardHeader, Chip } from "@heroui/react";
import Link from "next/link";
import { Tv, Play, ExternalLink } from "lucide-react";
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
            <Card className="bg-content1 rounded-[28px] border-none shadow-none hover:shadow-2xl hover:shadow-primary/5 transition-all duration-300 min-h-[440px] relative overflow-hidden">
                <CardHeader className="p-8 pb-0 flex-col items-start">
                    <div className="flex justify-between items-center w-full">
                        <div>
                            <h2 className="text-2xl font-bold tracking-tight flex items-center gap-4">
                                <span className="w-3 h-3 rounded-full bg-[var(--md-sys-color-primary)] shadow-[0_0_12px_rgba(179,66,74,0.4)]" />
                                最新の配信
                            </h2>
                            <p className="text-lg font-medium tracking-normal text-[var(--md-sys-color-on-surface-variant)] mt-1 opacity-80">
                                トキノヒロバ
                            </p>
                        </div>
                        {latestStream && (
                            <Chip
                                size="lg"
                                variant="flat"
                                className="text-[11px] font-bold uppercase tracking-[0.1em] rounded-full px-4 bg-[var(--md-sys-color-primary-container)] text-[var(--md-sys-color-on-primary-container)]"
                            >
                                {formatRelativeTime(latestStream.publishedAt)}
                            </Chip>
                        )}
                    </div>
                </CardHeader>
                <CardBody className="p-8 flex flex-col flex-grow">
                    {latestStream ? (
                        <Link href={latestStream.videoUrl} target="_blank" className="flex flex-col flex-grow group">
                            <div className="aspect-video rounded-[24px] bg-[var(--md-sys-color-surface-container-highest)] mb-5 overflow-hidden relative shadow-sm group-hover:shadow-lg transition-all duration-300">
                                <Image
                                    src={latestStream.thumbnailUrl}
                                    alt={latestStream.title}
                                    fill
                                    className="object-cover"
                                    unoptimized
                                />
                                <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity bg-black/20 backdrop-blur-[2px]">
                                    <div className="w-16 h-16 bg-background/95 rounded-full flex items-center justify-center shadow-xl transform group-hover:scale-110 transition-transform text-[var(--md-sys-color-primary)] pl-1">
                                        <Play className="w-8 h-8 fill-current" />
                                    </div>
                                </div>
                            </div>
                            <h3 className="text-lg font-medium tracking-normal group-hover:text-[var(--md-sys-color-primary)] transition-colors line-clamp-2 leading-relaxed">
                                {latestStream.title}
                            </h3>
                            <div className="flex items-center gap-3 mt-3 text-[var(--md-sys-color-on-surface-variant)]">
                                <Chip size="sm" variant="flat" className="bg-[var(--md-sys-color-surface-container-high)]">配信</Chip>
                                <span className="text-base font-normal leading-relaxed">{formatDate(latestStream.publishedAt)}</span>
                                <ExternalLink className="w-4 h-4 ml-auto opacity-50" />
                            </div>
                        </Link>
                    ) : (
                        <div className="text-center space-y-8 opacity-70 flex-grow flex flex-col items-center justify-center">
                            <div className="w-40 h-40 mx-auto rounded-full bg-[var(--md-sys-color-surface-container-highest)] flex items-center justify-center shadow-inner ring-4 ring-background">
                                <Tv strokeWidth={1} className="w-20 h-20 text-[var(--md-sys-color-on-surface-variant)]" />
                            </div>
                            <p className="text-2xl font-bold tracking-tight text-[var(--md-sys-color-on-surface-variant)]">
                                配信情報を取得できませんでした
                            </p>
                        </div>
                    )}
                </CardBody>
                <div className="absolute -top-20 -right-20 w-[500px] h-[500px] bg-gradient-to-br from-[var(--md-sys-color-primary-container)] to-transparent opacity-20 rounded-full blur-3xl pointer-events-none" />
            </Card>
        </motion.div>
    );
}
