"use client";

import { Card } from "antd";
import Link from "next/link";
import { Icon } from "@iconify/react";
import { formatRelativeTime } from "@/lib/youtube";
import type { YouTubeVideo } from "@/lib/youtube";
import Image from "next/image";
import { motion } from "framer-motion";

interface ShortsGridProps {
    shorts: YouTubeVideo[];
}

const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
        opacity: 1,
        transition: { staggerChildren: 0.05, delayChildren: 0.1 }
    }
};

const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 }
};

export function ShortsGrid({ shorts }: ShortsGridProps) {
    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.1 }}
        >
            <Card
                className="bg-[var(--md-sys-color-surface-container-low)] rounded-[28px] border-none shadow-none"
                styles={{ body: { padding: 0 } }}
            >
                <div className="p-8 pb-0">
                    <h2 className="text-2xl font-bold tracking-tight flex items-center gap-3 text-[var(--md-sys-color-on-surface)]">
                        <Icon icon="material-symbols:play-arrow" className="w-6 h-6 text-[#73342b]" />
                        最新のShorts
                    </h2>
                </div>
                <div className="p-8">
                    {shorts.length > 0 ? (
                        <motion.div
                            className="grid grid-cols-2 md:grid-cols-4 gap-6"
                            variants={containerVariants}
                            initial="hidden"
                            animate="visible"
                        >
                            {shorts.map((video) => (
                                <motion.div key={video.videoId} variants={itemVariants}>
                                    <Link href={video.videoUrl} target="_blank" className="group cursor-pointer block">
                                        <motion.div
                                            whileHover={{ y: -4, transition: { duration: 0.2 } }}
                                            whileTap={{ scale: 0.95 }}
                                        >
                                            <div className="aspect-[9/16] rounded-[20px] bg-[var(--md-sys-color-surface-container-highest)] mb-3 overflow-hidden relative shadow-sm group-hover:shadow-lg transition-all duration-300">
                                                <Image
                                                    src={video.thumbnailUrl}
                                                    alt={video.title}
                                                    fill
                                                    className="object-cover"
                                                    unoptimized
                                                />
                                                <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity bg-black/20 backdrop-blur-[2px]">
                                                    <div className="w-12 h-12 bg-[#fff8f6]/95 rounded-full flex items-center justify-center shadow-xl transform group-hover:scale-110 transition-transform text-[#73342b] pl-0.5">
                                                        <Icon icon="material-symbols:play-arrow" className="w-6 h-6" />
                                                    </div>
                                                </div>
                                            </div>
                                            <h3 className="text-base font-normal leading-relaxed group-hover:text-[#73342b] transition-colors line-clamp-2 text-[var(--md-sys-color-on-surface)]">
                                                {video.title}
                                            </h3>
                                            <span className="text-sm text-[var(--md-sys-color-on-surface-variant)] mt-1 block">
                                                {formatRelativeTime(video.publishedAt)}
                                            </span>
                                        </motion.div>
                                    </Link>
                                </motion.div>
                            ))}
                        </motion.div>
                    ) : (
                        <div className="text-center py-12 text-[var(--md-sys-color-on-surface-variant)]">
                            <p className="text-base font-normal leading-relaxed">Shorts動画を取得できませんでした</p>
                        </div>
                    )}
                </div>
            </Card>
        </motion.div>
    );
}
