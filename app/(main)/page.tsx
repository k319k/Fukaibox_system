"use client";

import { Card, CardBody, CardHeader, Button, Chip, Avatar } from "@heroui/react";
import Link from "next/link";

export default function HomePage() {
    const isAuthenticated = false; // Mock authentication status for demonstration
    return (
        <div className="flex-1 space-y-8 p-8 max-w-[1600px] mx-auto">
            {/* Header Section */}
            <header className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 pb-6 border-b border-[var(--md-sys-color-outline-variant)]">
                <div>
                    <h1 className="display-medium text-[var(--md-sys-color-on-background)] tracking-tight">ホーム</h1>
                    <p className="body-large text-[var(--md-sys-color-on-surface-variant)] mt-2">
                        封解Boxへようこそ。今日の活動を確認しましょう。
                    </p>
                </div>
                {!isAuthenticated && (
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

            {/* Quick Actions Grid */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                {[
                    { label: "料理をする", href: "/kitchen", icon: "🍳", color: "bg-[#FFDAD9] text-[#40000A]" },
                    { label: "保管庫を見る", href: "/storage", icon: "📦", color: "bg-[#E7DECD] text-[#1E1B16]" },
                    { label: "道具を使う", href: "/tools", icon: "🛠️", color: "bg-[#D0E6F0] text-[#001E2F]" },
                    { label: "設定", href: "/settings", icon: "⚙️", color: "bg-[#E2E2E2] text-[#191C1C]" },
                ].map((action) => (
                    <Link key={action.label} href={action.href} className="group">
                        <Card className={`h-24 border-none shadow-sm hover:shadow-md transition-all duration-300 ${action.color} shape-lg`}>
                            <CardBody className="flex flex-row items-center justify-center gap-4">
                                <span className="text-2xl group-hover:scale-110 transition-transform duration-300">{action.icon}</span>
                                <span className="title-medium font-semibold">{action.label}</span>
                            </CardBody>
                        </Card>
                    </Link>
                ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Main Content Area (2 cols) */}
                <div className="lg:col-span-2 space-y-8">
                    {/* Live Stream Widget */}
                    <Card className="card-elevated min-h-[300px] relative overflow-hidden group">
                        <CardHeader className="px-8 pt-8 pb-4 flex justify-between items-center z-10">
                            <div>
                                <h2 className="headline-small text-[var(--md-sys-color-on-surface)] flex items-center gap-3">
                                    <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
                                    現在の配信
                                </h2>
                                <p className="body-medium text-[var(--md-sys-color-on-surface-variant)] mt-1">YouTube Live Status</p>
                            </div>
                            <Chip size="sm" variant="flat" color="danger" className="uppercase font-bold tracking-wider">Offline</Chip>
                        </CardHeader>
                        <CardBody className="px-8 pb-8 flex items-center justify-center">
                            <div className="text-center space-y-4 opacity-50">
                                <div className="w-20 h-20 mx-auto rounded-full bg-[var(--md-sys-color-surface-container-highest)] flex items-center justify-center text-4xl">
                                    📺
                                </div>
                                <p className="title-medium text-[var(--md-sys-color-on-surface-variant)]">現在配信されていません</p>
                                <Button variant="light" className="text-[var(--md-sys-color-primary)]">
                                    アーカイブを確認する
                                </Button>
                            </div>
                        </CardBody>
                        {/* Decorative Background */}
                        <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-[var(--md-sys-color-primary-container)] to-transparent opacity-20 rounded-bl-full pointer-events-none" />
                    </Card>

                    {/* Latest Videos */}
                    <Card className="card-outlined">
                        <CardHeader className="px-8 pt-8 pb-4">
                            <h2 className="headline-small text-[var(--md-sys-color-on-surface)]">最新の動画</h2>
                        </CardHeader>
                        <CardBody className="px-8 pb-8">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                {/* Video Card Mockup */}
                                {[1, 2].map((i) => (
                                    <div key={i} className="group cursor-pointer">
                                        <div className="aspect-video rounded-xl bg-[var(--md-sys-color-surface-container-highest)] mb-3 overflow-hidden border-2 border-[var(--md-sys-color-outline-variant)] relative">
                                            <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity bg-black/20">
                                                <div className="w-12 h-12 bg-white/90 rounded-full flex items-center justify-center shadow-lg">▶</div>
                                            </div>
                                        </div>
                                        <h3 className="title-medium text-[var(--md-sys-color-on-surface)] group-hover:text-[var(--md-sys-color-primary)] transition-colors line-clamp-2">
                                            【封解Box】デモ用動画タイトル #{i}
                                        </h3>
                                        <p className="body-small text-[var(--md-sys-color-on-surface-variant)] mt-1">2024.01.{15 + i}</p>
                                    </div>
                                ))}
                            </div>
                        </CardBody>
                    </Card>
                </div>

                {/* Sidebar Widgets (1 col) */}
                <div className="space-y-8">
                    {/* Ranking Widget */}
                    <Card className="card-filled h-auto">
                        <CardHeader className="px-6 pt-6 pb-2">
                            <h2 className="title-large text-[var(--md-sys-color-on-surface)]">貢献度ランキング</h2>
                        </CardHeader>
                        <CardBody className="px-6 pb-6 space-y-4">
                            {[1, 2, 3].map((rank) => (
                                <div key={rank} className="flex items-center gap-4 p-3 rounded-xl hover:bg-[var(--md-sys-color-surface-container-high)] transition-colors cursor-pointer">
                                    <div className={`w-8 h-8 flex items-center justify-center rounded-full font-bold ${rank === 1 ? 'bg-[#FFD700]/20 text-[#B8860B]' :
                                        rank === 2 ? 'bg-[#C0C0C0]/20 text-[#696969]' :
                                            'bg-[#CD7F32]/20 text-[#8B4513]'
                                        }`}>
                                        {rank}
                                    </div>
                                    <div className="flex-1">
                                        <p className="label-large">ユーザー名</p>
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
