"use client";

import { Card, CardBody, CardHeader, Button, Chip, Avatar } from "@heroui/react";
import Link from "next/link";

export default function HomePage() {
    return (
        <div className="max-w-7xl mx-auto space-y-8">
            {/* ヘッダー - M3 Display/Headline */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="headline-large">ホーム</h1>
                    <p className="body-medium mt-2">封解Boxへようこそ</p>
                </div>
                <Link href="/login">
                    <Button
                        color="primary"
                        variant="shadow"
                        className="shape-full font-semibold"
                    >
                        ログイン
                    </Button>
                </Link>
            </div>

            {/* ウィジェットグリッド - M3 Card Elevation */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {/* ライブ配信通知 - Elevated Card */}
                <Card className="card-elevated">
                    <CardHeader className="pb-2 px-5 pt-5">
                        <div className="flex items-center gap-3">
                            <div className="w-3 h-3 bg-[var(--md-sys-color-error)] rounded-full animate-pulse shadow-lg" />
                            <h3 className="title-large">ライブ配信</h3>
                        </div>
                    </CardHeader>
                    <CardBody className="pt-0 px-5 pb-5">
                        <p className="body-medium">
                            現在配信中のライブはありません
                        </p>
                    </CardBody>
                </Card>

                {/* ランキング - Elevated Card */}
                <Card className="card-elevated">
                    <CardHeader className="pb-2 px-5 pt-5">
                        <h3 className="title-large">🏆 ランキング</h3>
                    </CardHeader>
                    <CardBody className="pt-0 px-5 pb-5 space-y-4">
                        {[1, 2, 3].map((rank) => (
                            <div key={rank} className="flex items-center gap-4">
                                <span className="w-8 h-8 rounded-full bg-gradient-to-br from-[var(--color-gicho)] to-orange-500 flex items-center justify-center text-sm font-bold text-white shadow-md">
                                    {rank}
                                </span>
                                <Avatar size="sm" name={`U${rank}`} classNames={{ base: "ring-2 ring-[var(--md-sys-color-outline-variant)]" }} />
                                <div className="flex-1">
                                    <p className="title-small">ユーザー{rank}</p>
                                    <p className="body-small">{1000 - rank * 100}pt</p>
                                </div>
                            </div>
                        ))}
                    </CardBody>
                </Card>

                {/* 今日の名誉儀員 - Filled Card */}
                <Card className="card-filled">
                    <CardHeader className="pb-2 px-5 pt-5">
                        <h3 className="title-large">✨ 今日の名誉儀員</h3>
                    </CardHeader>
                    <CardBody className="pt-0 px-5 pb-5 flex items-center gap-5">
                        <Avatar
                            size="lg"
                            name="M"
                            classNames={{
                                base: "bg-gradient-to-br from-[var(--color-meiyo-giin)] to-violet-600 ring-3 ring-[var(--color-meiyo-giin-container)]",
                            }}
                        />
                        <div>
                            <p className="title-medium">名誉儀員さん</p>
                            <Chip size="sm" className="badge-meiyo-giin mt-2">
                                名誉儀員
                            </Chip>
                        </div>
                    </CardBody>
                </Card>

                {/* 最新動画 - Wide Elevated Card */}
                <Card className="card-elevated md:col-span-2 lg:col-span-3">
                    <CardHeader className="pb-2 px-5 pt-5">
                        <h3 className="title-large">📺 最新ショート動画</h3>
                    </CardHeader>
                    <CardBody className="pt-0 px-5 pb-5">
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                            {[1, 2, 3, 4].map((i) => (
                                <div
                                    key={i}
                                    className="aspect-[9/16] surface-container-high shape-lg flex items-center justify-center hover:surface-container-highest transition-colors cursor-pointer"
                                >
                                    <p className="body-medium">動画 {i}</p>
                                </div>
                            ))}
                        </div>
                    </CardBody>
                </Card>
            </div>

            {/* クイックアクション - Outlined Card */}
            <Card className="card-outlined">
                <CardHeader className="px-5 pt-5">
                    <h3 className="title-large">クイックアクション</h3>
                </CardHeader>
                <CardBody className="flex flex-wrap gap-3 px-5 pb-5">
                    <Link href="/kitchen">
                        <Button variant="flat" color="primary" className="shape-full font-medium">
                            🍳 台所へ
                        </Button>
                    </Link>
                    <Link href="/dictionary">
                        <Button variant="flat" color="secondary" className="shape-full font-medium">
                            📚 百科事典を見る
                        </Button>
                    </Link>
                    <Link href="/tools">
                        <Button variant="flat" color="success" className="shape-full font-medium">
                            🔧 Toolsを探す
                        </Button>
                    </Link>
                </CardBody>
            </Card>
        </div>
    );
}

