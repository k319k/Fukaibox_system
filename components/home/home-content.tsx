"use client";

import { Card, CardBody, CardHeader, Chip, Progress } from "@heroui/react";
import Link from "next/link";
import { ChefHat, Package, Wrench, Settings, Tv, Play, Trophy, ExternalLink } from "lucide-react";
import { formatDate, formatRelativeTime } from "@/lib/youtube";
import type { YouTubeVideo } from "@/lib/youtube";
import Image from "next/image";

interface HomeContentProps {
    latestStream: YouTubeVideo | null;
    shorts: YouTubeVideo[];
}

export function HomeContent({ latestStream, shorts }: HomeContentProps) {
    return (
        <div className="flex-1 space-y-10 p-6 md:p-8 max-w-[1600px] mx-auto">

            {/* Quick Actions Grid - M3 Tonal Surface Hierarchy */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                {[
                    { label: "料理をする", href: "/kitchen", icon: ChefHat, color: "bg-[var(--md-sys-color-primary-container)] text-[var(--md-sys-color-on-primary-container)]" },
                    { label: "保管庫を見る", href: "/storage", icon: Package, color: "bg-[var(--md-sys-color-secondary-container)] text-[var(--md-sys-color-on-secondary-container)]" },
                    { label: "道具を使う", href: "/tools", icon: Wrench, color: "bg-[var(--md-sys-color-tertiary-container)] text-[var(--md-sys-color-on-tertiary-container)]" },
                    { label: "設定", href: "/settings", icon: Settings, color: "bg-[var(--md-sys-color-surface-container-high)] text-[var(--md-sys-color-on-surface)]" },
                ].map((action) => (
                    <Link key={action.label} href={action.href} className="group">
                        <Card className={`h-44 border-none shadow-sm hover:shadow-md transition-all duration-300 ${action.color} !rounded-3xl`}>
                            <CardBody className="flex flex-col items-center justify-center gap-5 p-8">
                                <action.icon strokeWidth={1.5} className="w-10 h-10 group-hover:scale-110 transition-transform duration-300" />
                                <span className="title-medium font-extrabold tracking-tight">{action.label}</span>
                            </CardBody>
                        </Card>
                    </Link>
                ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
                {/* Main Content Area (2 cols) */}
                <div className="lg:col-span-2 space-y-10">
                    {/* Live Stream Widget */}
                    <Card className="card-elevated shadow-sm min-h-[440px] relative overflow-hidden group !rounded-3xl bg-[var(--md-sys-color-surface-container-lowest)] border-none">
                        <CardHeader className="px-10 pt-10 pb-6 flex justify-between items-center z-10">
                            <div>
                                <h2 className="headline-small text-[var(--md-sys-color-on-surface)] flex items-center gap-4 font-bold">
                                    <span className="w-3 h-3 rounded-full bg-[var(--md-sys-color-primary)] shadow-[0_0_12px_rgba(179,66,74,0.4)]" />
                                    最新の配信
                                </h2>
                                <p className="title-small text-[var(--md-sys-color-on-surface-variant)] mt-1 tracking-wider opacity-80">トキノヒロバ</p>
                            </div>
                            {latestStream && (
                                <Chip size="lg" variant="flat" className="uppercase font-bold tracking-widest rounded-full px-4 bg-[var(--md-sys-color-primary-container)] text-[var(--md-sys-color-on-primary-container)]">
                                    {formatRelativeTime(latestStream.publishedAt)}
                                </Chip>
                            )}
                        </CardHeader>
                        <CardBody className="px-12 pb-12 flex flex-col z-10 flex-grow">
                            {latestStream ? (
                                <Link href={latestStream.videoUrl} target="_blank" className="flex flex-col flex-grow group/stream">
                                    <div className="aspect-video rounded-[24px] bg-[var(--md-sys-color-surface-container-highest)] mb-5 overflow-hidden relative shadow-sm group-hover/stream:shadow-lg transition-all duration-300">
                                        <Image
                                            src={latestStream.thumbnailUrl}
                                            alt={latestStream.title}
                                            fill
                                            className="object-cover"
                                            unoptimized
                                        />
                                        <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover/stream:opacity-100 transition-opacity bg-black/20 backdrop-blur-[2px]">
                                            <div className="w-16 h-16 bg-white/95 rounded-full flex items-center justify-center shadow-xl transform group-hover/stream:scale-110 transition-transform text-[var(--md-sys-color-primary)] pl-1">
                                                <Play className="w-8 h-8 fill-current" />
                                            </div>
                                        </div>
                                    </div>
                                    <h3 className="title-large text-[var(--md-sys-color-on-surface)] group-hover/stream:text-[var(--md-sys-color-primary)] transition-colors line-clamp-2 leading-relaxed font-bold tracking-tight">
                                        {latestStream.title}
                                    </h3>
                                    <div className="flex items-center gap-3 mt-3 text-[var(--md-sys-color-on-surface-variant)]">
                                        <Chip size="sm" variant="flat" className="bg-[var(--md-sys-color-surface-container-high)]">配信</Chip>
                                        <span className="body-medium font-medium">{formatDate(latestStream.publishedAt)}</span>
                                        <ExternalLink className="w-4 h-4 ml-auto opacity-50" />
                                    </div>
                                </Link>
                            ) : (
                                <div className="text-center space-y-8 opacity-70 flex-grow flex flex-col items-center justify-center">
                                    <div className="w-40 h-40 mx-auto rounded-full bg-[var(--md-sys-color-surface-container-highest)] flex items-center justify-center shadow-inner mb-6 ring-4 ring-white">
                                        <Tv strokeWidth={1} className="w-20 h-20 text-[var(--md-sys-color-on-surface-variant)]" />
                                    </div>
                                    <p className="headline-medium text-[var(--md-sys-color-on-surface-variant)] font-bold tracking-tight">配信情報を取得できませんでした</p>
                                </div>
                            )}
                        </CardBody>
                        <div className="absolute -top-20 -right-20 w-[500px] h-[500px] bg-gradient-to-br from-[var(--md-sys-color-primary-container)] to-transparent opacity-20 rounded-full blur-3xl pointer-events-none" />
                    </Card>

                    {/* Latest Shorts */}
                    <Card className="shadow-sm !rounded-3xl bg-[var(--md-sys-color-surface-container-low)] border-none">
                        <CardHeader className="px-10 pt-10 pb-6">
                            <h2 className="headline-small text-[var(--md-sys-color-on-surface)] font-extrabold flex items-center gap-3 tracking-tight">
                                <Play className="w-6 h-6 fill-current text-[var(--md-sys-color-primary)]" />
                                最新のShorts
                            </h2>
                        </CardHeader>
                        <CardBody className="px-10 pb-10">
                            {shorts.length > 0 ? (
                                <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                                    {shorts.map((video) => (
                                        <Link key={video.videoId} href={video.videoUrl} target="_blank" className="group cursor-pointer">
                                            <div className="aspect-[9/16] rounded-[16px] bg-[var(--md-sys-color-surface-container-highest)] mb-3 overflow-hidden relative shadow-sm group-hover:shadow-lg transition-all duration-300">
                                                <Image
                                                    src={video.thumbnailUrl}
                                                    alt={video.title}
                                                    fill
                                                    className="object-cover"
                                                    unoptimized
                                                />
                                                <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity bg-black/20 backdrop-blur-[2px]">
                                                    <div className="w-12 h-12 bg-white/95 rounded-full flex items-center justify-center shadow-xl transform group-hover:scale-110 transition-transform text-[var(--md-sys-color-primary)] pl-0.5">
                                                        <Play className="w-6 h-6 fill-current" />
                                                    </div>
                                                </div>
                                            </div>
                                            <h3 className="body-medium text-[var(--md-sys-color-on-surface)] group-hover:text-[var(--md-sys-color-primary)] transition-colors line-clamp-2 leading-snug font-semibold">
                                                {video.title}
                                            </h3>
                                            <span className="body-small text-[var(--md-sys-color-on-surface-variant)] mt-1 block">{formatRelativeTime(video.publishedAt)}</span>
                                        </Link>
                                    ))}
                                </div>
                            ) : (
                                <div className="text-center py-12 text-[var(--md-sys-color-on-surface-variant)]">
                                    <p>Shorts動画を取得できませんでした</p>
                                </div>
                            )}
                        </CardBody>
                    </Card>
                </div>

                {/* Sidebar Widgets */}
                <div className="space-y-10">
                    <Card className="shadow-sm !rounded-3xl bg-[var(--md-sys-color-surface-container-low)] border-none">
                        <CardHeader className="px-8 pt-8 pb-4">
                            <h2 className="headline-small text-[var(--md-sys-color-on-surface)] font-extrabold flex items-center gap-3 tracking-tight">
                                <Trophy className="w-5 h-5 text-[var(--md-sys-color-tertiary)]" />
                                貢献度ランキング
                            </h2>
                        </CardHeader>
                        <CardBody className="px-8 pb-8 space-y-4">
                            {[1, 2, 3, 4, 5].map((rank) => (
                                <div key={rank} className="flex items-center gap-5 p-4 rounded-2xl hover:bg-[var(--md-sys-color-surface-container-high)] transition-all cursor-pointer group">
                                    <div className={`w-10 h-10 flex items-center justify-center rounded-xl font-bold text-lg transition-transform group-hover:scale-110 ${rank === 1 ? 'bg-[#FFD700] text-white' :
                                        rank === 2 ? 'bg-[#C0C0C0] text-white' :
                                            rank === 3 ? 'bg-[#CD7F32] text-white' :
                                                'bg-[var(--md-sys-color-surface-container-highest)] text-[var(--md-sys-color-on-surface-variant)]'
                                        }`}>
                                        {rank}
                                    </div>
                                    <div className="flex-1 space-y-2">
                                        <div className="flex items-center justify-between">
                                            <p className="title-small font-semibold tracking-tight group-hover:text-[var(--md-sys-color-primary)] transition-colors">ユーザー名</p>
                                            <span className="body-small font-mono text-[var(--md-sys-color-on-surface-variant)]">{1000 - rank * 100}pt</span>
                                        </div>
                                        <Progress
                                            size="sm"
                                            value={100 - (rank * 15)}
                                            color="primary"
                                            classNames={{
                                                track: "bg-[var(--md-sys-color-surface-container-highest)]",
                                                indicator: "bg-[var(--md-sys-color-primary)]"
                                            }}
                                        />
                                    </div>
                                </div>
                            ))}
                        </CardBody>
                    </Card>
                </div>
            </div>
        </div>
    );
}
