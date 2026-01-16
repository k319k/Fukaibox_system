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

            {/* Quick Actions Grid - Tonal Palette Harmony & Pill Shape */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
                {[
                    { label: "料理をする", href: "/kitchen", icon: "🍳", color: "bg-[#FFDAD9] text-[#40000A]" }, // Red 90
                    { label: "保管庫を見る", href: "/storage", icon: "📦", color: "bg-[#FFEDE6] text-[#40000A]" }, // Orange 95
                    { label: "道具を使う", href: "/tools", icon: "🛠️", color: "bg-[#F5F0DC] text-[#1E1B16]" },   // Beige
                    { label: "設定", href: "/settings", icon: "⚙️", color: "bg-[#EBEBD4] text-[#191C1C]" },      // Greige
                ].map((action) => (
                    <Link key={action.label} href={action.href} className="group">
                        <Card className={`h-36 border-none shadow-lg hover:shadow-xl transition-all duration-300 ${action.color} !rounded-[32px]`}>
                            <CardBody className="flex flex-col items-center justify-center gap-4">
                                <span className="text-5xl group-hover:scale-110 transition-transform duration-300">{action.icon}</span>
                                <span className="title-medium font-bold tracking-wide">{action.label}</span>
                            </CardBody>
                        </Card>
                    </Link>
                ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
                {/* Main Content Area (2 cols) */}
                <div className="lg:col-span-2 space-y-12">
                    {/* Live Stream Widget - Stronger Gravity & Depth */}
                    <Card className="card-elevated shadow-lg min-h-[440px] relative overflow-hidden group !rounded-[32px] bg-white">
                        <CardHeader className="px-12 pt-12 pb-6 flex justify-between items-center z-10">
                            <div>
                                <h2 className="headline-small text-[var(--md-sys-color-on-surface)] flex items-center gap-4 font-bold">
                                    <span className="w-3 h-3 rounded-full bg-red-500 animate-pulse shadow-[0_0_12px_rgba(239,68,68,0.6)]" />
                                    現在の配信
                                </h2>
                                <p className="title-small text-[var(--md-sys-color-on-surface-variant)] mt-1 tracking-wider opacity-80">YOUTUBE LIVE STATUS</p>
                            </div>
                            <Chip size="lg" variant="flat" color="danger" className="uppercase font-bold tracking-widest rounded-full px-4 border border-red-200">Offline</Chip>
                        </CardHeader>
                        <CardBody className="px-12 pb-12 flex flex-col items-center justify-center z-10 flex-grow">
                            <div className="text-center space-y-8 opacity-70 hover:opacity-100 transition-opacity duration-500">
                                <div className="w-40 h-40 mx-auto rounded-full bg-[var(--md-sys-color-surface-container-highest)] flex items-center justify-center text-8xl shadow-inner mb-6 ring-4 ring-white">
                                    📺
                                </div>
                                <div className="space-y-3">
                                    <p className="headline-medium text-[var(--md-sys-color-on-surface-variant)] font-bold tracking-tight">現在配信されていません</p>
                                    <p className="title-medium text-[var(--md-sys-color-on-surface-variant)] opacity-80">過去のアーカイブをチェックしてみましょう</p>
                                </div>
                                <Button size="lg" variant="ghost" color="primary" className="mt-6 shape-full px-10 text-lg font-bold border-2 border-[var(--md-sys-color-primary)] hover:bg-[var(--md-sys-color-primary)] hover:text-white transition-all">
                                    アーカイブへ移動
                                </Button>
                            </div>
                        </CardBody>
                        {/* Decorative Background - Ultra Soft */}
                        <div className="absolute -top-20 -right-20 w-[500px] h-[500px] bg-gradient-to-br from-[var(--md-sys-color-primary-container)] to-transparent opacity-20 rounded-full blur-3xl pointer-events-none" />
                    </Card>

                    {/* Latest Videos - Consistent P-10 Padding */}
                    <Card className="card-outlined shadow-md !rounded-[32px] bg-[var(--md-sys-color-surface-container-lowest)] border border-[var(--md-sys-color-outline-variant)]/50">
                        <CardHeader className="px-12 pt-12 pb-6">
                            <h2 className="headline-small text-[var(--md-sys-color-on-surface)] font-bold">最新の動画</h2>
                        </CardHeader>
                        <CardBody className="px-12 pb-12">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                                {[1, 2].map((i) => (
                                    <div key={i} className="group cursor-pointer">
                                        <div className="aspect-video rounded-[24px] bg-[var(--md-sys-color-surface-container-highest)] mb-5 overflow-hidden border border-[var(--md-sys-color-outline-variant)] relative shadow-sm group-hover:shadow-lg transition-all duration-300">
                                            <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity bg-black/20 backdrop-blur-[2px]">
                                                <div className="w-16 h-16 bg-white/95 rounded-full flex items-center justify-center shadow-xl transform group-hover:scale-110 transition-transform text-3xl text-[var(--md-sys-color-primary)] pl-1">▶</div>
                                            </div>
                                        </div>
                                        <h3 className="title-large text-[var(--md-sys-color-on-surface)] group-hover:text-[var(--md-sys-color-primary)] transition-colors line-clamp-2 leading-relaxed font-bold tracking-tight">
                                            【封解Box】最新の活動報告とデモ動画 #{i}
                                        </h3>
                                        <div className="flex items-center gap-3 mt-3 text-[var(--md-sys-color-on-surface-variant)]">
                                            <Chip size="sm" variant="flat" className="bg-[var(--md-sys-color-surface-container-high)]">動画</Chip>
                                            <span className="body-medium font-medium">2024.01.{15 + i}</span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </CardBody>
                    </Card>
                </div>

                {/* Sidebar Widgets (1 col) */}
                <div className="space-y-12">
                    {/* Ranking Widget */}
                    <Card className="card-filled h-auto shadow-md !rounded-[32px] bg-white border border-[var(--md-sys-color-outline-variant)]/30">
                        <CardHeader className="px-10 pt-10 pb-4">
                            <h2 className="headline-small text-[var(--md-sys-color-on-surface)] font-bold">貢献度ランキング</h2>
                        </CardHeader>
                        <CardBody className="px-10 pb-10 space-y-6">
                            {[1, 2, 3, 4, 5].map((rank) => (
                                <div key={rank} className="flex items-center gap-5 p-4 rounded-3xl hover:bg-[var(--md-sys-color-surface-container-high)] transition-all cursor-pointer group hover:shadow-sm">
                                    <div className={`w-12 h-12 flex items-center justify-center rounded-full font-bold text-xl shadow-sm transition-transform group-hover:scale-110 ${rank === 1 ? 'bg-[#FFD700] text-white shadow-[#FFD700]/40' :
                                        rank === 2 ? 'bg-[#C0C0C0] text-white shadow-[#C0C0C0]/40' :
                                            rank === 3 ? 'bg-[#CD7F32] text-white shadow-[#CD7F32]/40' :
                                                'bg-[var(--md-sys-color-surface-container-highest)] text-[var(--md-sys-color-on-surface-variant)]'
                                        }`}>
                                        {rank}
                                    </div>
                                    <div className="flex-1">
                                        <p className="title-medium font-bold group-hover:text-[var(--md-sys-color-primary)] transition-colors">ユーザー名</p>
                                        <div className="flex items-center gap-2 mt-1">
                                            <div className="h-1.5 w-full bg-[var(--md-sys-color-surface-container-highest)] rounded-full overflow-hidden">
                                                <div className="h-full bg-[var(--md-sys-color-primary)] rounded-full" style={{ width: `${100 - (rank * 15)}%` }} />
                                            </div>
                                            <p className="body-small font-mono text-[var(--md-sys-color-on-surface-variant)] whitespace-nowrap">{1000 - rank * 100}pt</p>
                                        </div>
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
