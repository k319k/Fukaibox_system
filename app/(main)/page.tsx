"use client";

import { Card, CardBody, CardHeader, Button, Chip } from "@heroui/react";
import Link from "next/link";
import { useSession } from "@/lib/auth-client";

export default function HomePage() {
    const { data: session } = useSession();

    return (
        <div className="flex-1 space-y-12 p-8 max-w-[1600px] mx-auto">
            {/* Header Section */}
            <header className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 pb-6 border-b border-[var(--md-sys-color-outline-variant)]">
                <div>
                    <h1 className="display-medium text-[var(--md-sys-color-on-background)] tracking-tight">ホーム</h1>
                    <p className="body-large text-[var(--md-sys-color-on-surface-variant)] mt-2">
                        封解Boxへようこそ。今日の活動を確認しましょう。
                    </p>
                </div>
                {!session && (
                    <div className="flex gap-4">
                        <Button
                            as={Link}
                            href="/login"
                            className="bg-[var(--md-sys-color-primary)] text-[var(--md-sys-color-on-primary)] shadow-md px-8 shape-full font-semibold"
                        >
                            ログイン
                        </Button>
                    </div>
                )}
            </header>

            {/* Quick Actions Grid - Tonal Palette Harmony */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
                {[
                    { label: "料理をする", href: "/kitchen", icon: "🍳", color: "bg-[#FFDAD9] text-[#40000A]" }, // Red 90
                    { label: "保管庫を見る", href: "/storage", icon: "📦", color: "bg-[#FFEDE6] text-[#40000A]" }, // Orange 95 (Warm)
                    { label: "道具を使う", href: "/tools", icon: "🛠️", color: "bg-[#F5F0DC] text-[#1E1B16]" },   // Beige (Surface)
                    { label: "設定", href: "/settings", icon: "⚙️", color: "bg-[#EBEBD4] text-[#191C1C]" },      // Greige (Variant)
                ].map((action) => (
                    <Link key={action.label} href={action.href} className="group">
                        <Card className={`h-32 border-none shadow-lg hover:shadow-xl transition-all duration-300 ${action.color} shape-xl`}>
                            <CardBody className="flex flex-col items-center justify-center gap-3">
                                <span className="text-4xl group-hover:scale-110 transition-transform duration-300">{action.icon}</span>
                                <span className="title-medium font-semibold">{action.label}</span>
                            </CardBody>
                        </Card>
                    </Link>
                ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
                {/* Main Content Area (2 cols) */}
                <div className="lg:col-span-2 space-y-12">
                    {/* Live Stream Widget - Stronger Gravity (Center) & Depth */}
                    <Card className="card-elevated shadow-lg min-h-[400px] relative overflow-hidden group shape-xl bg-white">
                        <CardHeader className="px-10 pt-10 pb-6 flex justify-between items-center z-10">
                            <div>
                                <h2 className="headline-small text-[var(--md-sys-color-on-surface)] flex items-center gap-3">
                                    <span className="w-3 h-3 rounded-full bg-red-500 animate-pulse" />
                                    現在の配信
                                </h2>
                                <p className="body-medium text-[var(--md-sys-color-on-surface-variant)] mt-1">YouTube Live Status</p>
                            </div>
                            <Chip size="sm" variant="flat" color="danger" className="uppercase font-bold tracking-wider rounded-full px-2">Offline</Chip>
                        </CardHeader>
                        <CardBody className="px-10 pb-10 flex flex-col items-center justify-center z-10 flex-grow">
                            <div className="text-center space-y-6 opacity-60 hover:opacity-100 transition-opacity duration-300">
                                <div className="w-32 h-32 mx-auto rounded-full bg-[var(--md-sys-color-surface-container-highest)] flex items-center justify-center text-7xl shadow-inner mb-4">
                                    📺
                                </div>
                                <div className="space-y-2">
                                    <p className="headline-small text-[var(--md-sys-color-on-surface-variant)] font-bold">現在配信されていません</p>
                                    <p className="body-large text-[var(--md-sys-color-on-surface-variant)]">アーカイブをチェックしましょう</p>
                                </div>
                                <Button variant="ghost" color="primary" className="mt-4 shape-full px-8 text-lg font-medium">
                                    アーカイブへ移動
                                </Button>
                            </div>
                        </CardBody>
                        {/* Decorative Background - Softer & Deeper */}
                        <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-br from-[var(--md-sys-color-primary-container)] to-transparent opacity-10 rounded-bl-[100px] pointer-events-none" />
                    </Card>

                    {/* Latest Videos - Consistent Spacing */}
                    <Card className="card-outlined shadow-sm shape-xl bg-[var(--md-sys-color-surface-container-lowest)]">
                        <CardHeader className="px-10 pt-10 pb-6">
                            <h2 className="headline-small text-[var(--md-sys-color-on-surface)]">最新の動画</h2>
                        </CardHeader>
                        <CardBody className="px-10 pb-10">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                {[1, 2].map((i) => (
                                    <div key={i} className="group cursor-pointer">
                                        <div className="aspect-video rounded-2xl bg-[var(--md-sys-color-surface-container-highest)] mb-4 overflow-hidden border border-[var(--md-sys-color-outline-variant)] relative shadow-sm group-hover:shadow-md transition-all">
                                            <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity bg-black/10 backdrop-blur-[2px]">
                                                <div className="w-14 h-14 bg-white/90 rounded-full flex items-center justify-center shadow-lg transform group-hover:scale-110 transition-transform text-2xl text-[var(--md-sys-color-primary)]">▶</div>
                                            </div>
                                        </div>
                                        <h3 className="title-large text-[var(--md-sys-color-on-surface)] group-hover:text-[var(--md-sys-color-primary)] transition-colors line-clamp-2 leading-relaxed">
                                            【封解Box】最新の活動報告とデモ動画 #{i}
                                        </h3>
                                        <p className="body-medium text-[var(--md-sys-color-on-surface-variant)] mt-2 flex items-center gap-2">
                                            <span>📅 2024.01.{15 + i}</span>
                                            <span>•</span>
                                            <span>1{i}:24</span>
                                        </p>
                                    </div>
                                ))}
                            </div>
                        </CardBody>
                    </Card>
                </div>

                {/* Sidebar Widgets (1 col) - Spacing Conformity */}
                <div className="space-y-12">
                    {/* Ranking Widget */}
                    <Card className="card-filled h-auto shadow-md shape-xl bg-white">
                        <CardHeader className="px-8 pt-8 pb-4">
                            <h2 className="headline-small text-[var(--md-sys-color-on-surface)]">貢献度ランキング</h2>
                        </CardHeader>
                        <CardBody className="px-8 pb-8 space-y-4">
                            {[1, 2, 3, 4, 5].map((rank) => (
                                <div key={rank} className="flex items-center gap-4 p-4 rounded-2xl hover:bg-[var(--md-sys-color-surface-container-high)] transition-colors cursor-pointer group">
                                    <div className={`w-10 h-10 flex items-center justify-center rounded-full font-bold text-lg shadow-sm ${rank === 1 ? 'bg-[#FFD700]/20 text-[#B8860B] ring-2 ring-[#FFD700]/30' :
                                        rank === 2 ? 'bg-[#C0C0C0]/20 text-[#696969] ring-2 ring-[#C0C0C0]/30' :
                                            rank === 3 ? 'bg-[#CD7F32]/20 text-[#8B4513] ring-2 ring-[#CD7F32]/30' :
                                                'bg-[var(--md-sys-color-surface-container-highest)] text-[var(--md-sys-color-on-surface-variant)]'
                                        }`}>
                                        {rank}
                                    </div>
                                    <div className="flex-1">
                                        <p className="title-medium group-hover:text-[var(--md-sys-color-primary)] transition-colors">ユーザー名</p>
                                        <p className="body-small text-[var(--md-sys-color-on-surface-variant)]">{1000 - rank * 100} pts</p>
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
