"use client";

import { Card, CardBody, CardHeader, Button, Chip, Avatar } from "@heroui/react";
import Link from "next/link";

export default function HomePage() {
    return (
        <div className="max-w-7xl mx-auto space-y-6">
            {/* ヘッダー */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold text-foreground">ホーム</h1>
                    <p className="text-foreground-muted mt-1">封解Boxへようこそ</p>
                </div>
                <Link href="/login">
                    <Button color="primary" variant="shadow">
                        ログイン
                    </Button>
                </Link>
            </div>

            {/* ウィジェットグリッド */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {/* ライブ配信通知 */}
                <Card className="card-gradient hover-glow">
                    <CardHeader className="pb-2">
                        <div className="flex items-center gap-2">
                            <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />
                            <h3 className="font-semibold text-foreground">ライブ配信</h3>
                        </div>
                    </CardHeader>
                    <CardBody className="pt-0">
                        <p className="text-foreground-muted text-sm">
                            現在配信中のライブはありません
                        </p>
                    </CardBody>
                </Card>

                {/* ランキング */}
                <Card className="card-gradient hover-glow">
                    <CardHeader className="pb-2">
                        <h3 className="font-semibold text-foreground">🏆 ランキング</h3>
                    </CardHeader>
                    <CardBody className="pt-0 space-y-3">
                        {[1, 2, 3].map((rank) => (
                            <div key={rank} className="flex items-center gap-3">
                                <span className="w-6 h-6 rounded-full bg-gradient-to-br from-yellow-400 to-orange-500 flex items-center justify-center text-xs font-bold text-white">
                                    {rank}
                                </span>
                                <Avatar size="sm" name={`U${rank}`} />
                                <div className="flex-1">
                                    <p className="text-sm font-medium text-foreground">ユーザー{rank}</p>
                                    <p className="text-xs text-foreground-muted">{1000 - rank * 100}pt</p>
                                </div>
                            </div>
                        ))}
                    </CardBody>
                </Card>

                {/* 今日の名誉儀員 */}
                <Card className="card-gradient hover-glow">
                    <CardHeader className="pb-2">
                        <h3 className="font-semibold text-foreground">✨ 今日の名誉儀員</h3>
                    </CardHeader>
                    <CardBody className="pt-0 flex items-center gap-4">
                        <Avatar
                            size="lg"
                            name="M"
                            classNames={{
                                base: "bg-gradient-to-br from-purple-400 to-violet-600",
                            }}
                        />
                        <div>
                            <p className="font-medium text-foreground">名誉儀員さん</p>
                            <Chip size="sm" className="badge-meiyo-giin mt-1">
                                名誉儀員
                            </Chip>
                        </div>
                    </CardBody>
                </Card>

                {/* 最新動画 */}
                <Card className="card-gradient hover-glow md:col-span-2 lg:col-span-3">
                    <CardHeader className="pb-2">
                        <h3 className="font-semibold text-foreground">📺 最新ショート動画</h3>
                    </CardHeader>
                    <CardBody className="pt-0">
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                            {[1, 2, 3, 4].map((i) => (
                                <div
                                    key={i}
                                    className="aspect-[9/16] bg-background-elevated rounded-lg flex items-center justify-center"
                                >
                                    <p className="text-foreground-muted text-sm">動画 {i}</p>
                                </div>
                            ))}
                        </div>
                    </CardBody>
                </Card>
            </div>

            {/* クイックアクション */}
            <Card className="card-gradient">
                <CardHeader>
                    <h3 className="font-semibold text-foreground">クイックアクション</h3>
                </CardHeader>
                <CardBody className="flex flex-wrap gap-3">
                    <Link href="/kitchen">
                        <Button variant="flat" color="primary">
                            🍳 台所へ
                        </Button>
                    </Link>
                    <Link href="/dictionary">
                        <Button variant="flat" color="secondary">
                            📚 百科事典を見る
                        </Button>
                    </Link>
                    <Link href="/tools">
                        <Button variant="flat" color="success">
                            🔧 Toolsを探す
                        </Button>
                    </Link>
                </CardBody>
            </Card>
        </div>
    );
}
