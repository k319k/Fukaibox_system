"use client";

import { Card, CardBody, CardHeader, Button, Chip, Divider, Snippet } from "@heroui/react";
import { Code, Key, FileText, Terminal, Copy, ExternalLink } from "lucide-react";
import { motion } from "framer-motion";

interface UserData {
    id: string;
    name: string;
    role: string;
}

interface DevStudioClientProps {
    user: UserData;
}

const apiEndpoints = [
    { method: "GET", path: "/api/points/health", description: "ヘルスチェック" },
    { method: "GET", path: "/api/points/{userId}", description: "ユーザーの点数を取得" },
    { method: "GET", path: "/api/points/ranking", description: "ランキングを取得" },
    { method: "POST", path: "/api/points/{userId}", description: "点数を増減（要認証）" },
];

export function DevStudioClient({ user }: DevStudioClientProps) {
    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className="max-w-4xl mx-auto space-y-8"
        >
            {/* Header */}
            <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-[#ffdad5] rounded-[16px] flex items-center justify-center">
                    <Code className="w-6 h-6 text-[#73342b]" />
                </div>
                <div>
                    <h1 className="text-3xl font-bold tracking-tight text-[var(--md-sys-color-on-surface)]">
                        DevStudio
                    </h1>
                    <p className="text-[var(--md-sys-color-on-surface-variant)]">
                        開発者向けツールとAPI
                    </p>
                </div>
                <Chip
                    size="sm"
                    variant="flat"
                    className="ml-auto rounded-full px-3 bg-[#ffdad5] text-[#73342b]"
                >
                    儀長専用
                </Chip>
            </div>

            {/* API Key Section */}
            <Card className="bg-[var(--md-sys-color-surface-container-lowest)] rounded-[28px] border-none shadow-none">
                <CardHeader className="p-8 pb-4 flex-row items-center gap-4">
                    <Key className="w-5 h-5 text-[#73342b]" />
                    <h2 className="text-xl font-bold tracking-tight text-[var(--md-sys-color-on-surface)]">
                        APIキー
                    </h2>
                </CardHeader>
                <CardBody className="px-8 pb-8 space-y-6">
                    <div className="p-4 rounded-[20px] bg-[var(--md-sys-color-surface-container-high)]">
                        <p className="text-[var(--md-sys-color-on-surface-variant)] mb-4">
                            儀員点数APIを外部から利用するためのAPIキーです。機密情報として保管してください。
                        </p>
                        <div className="flex items-center gap-4">
                            <Snippet
                                symbol=""
                                variant="flat"
                                className="flex-1 rounded-full bg-[var(--md-sys-color-surface-container-highest)]"
                                copyIcon={<Copy className="w-4 h-4" />}
                            >
                                fk_••••••••••••••••••••
                            </Snippet>
                        </div>
                    </div>
                    <motion.div whileTap={{ scale: 0.95 }}>
                        <Button
                            color="primary"
                            variant="flat"
                            radius="full"
                            className="h-12 px-6 font-bold bg-[#ffdad5] text-[#73342b] flex items-center justify-center gap-2"
                            startContent={<Key className="w-4 h-4" />}
                            isDisabled
                        >
                            新しいAPIキーを発行（準備中）
                        </Button>
                    </motion.div>
                </CardBody>
            </Card>

            {/* API Documentation */}
            <Card className="bg-[var(--md-sys-color-surface-container-lowest)] rounded-[28px] border-none shadow-none">
                <CardHeader className="p-8 pb-4 flex-row items-center gap-4">
                    <FileText className="w-5 h-5 text-[#73342b]" />
                    <h2 className="text-xl font-bold tracking-tight text-[var(--md-sys-color-on-surface)]">
                        API仕様
                    </h2>
                </CardHeader>
                <CardBody className="px-8 pb-8 space-y-4">
                    <p className="text-[var(--md-sys-color-on-surface-variant)]">
                        儀員点数APIのエンドポイント一覧です。
                    </p>
                    <Divider className="bg-[var(--md-sys-color-outline-variant)]/30" />
                    <div className="space-y-3">
                        {apiEndpoints.map((endpoint) => (
                            <div
                                key={endpoint.path}
                                className="flex items-center gap-4 p-4 rounded-[20px] hover:bg-[var(--md-sys-color-surface-container-high)] transition-colors"
                            >
                                <Chip
                                    size="sm"
                                    variant="flat"
                                    className={`rounded-full px-3 font-mono ${endpoint.method === "GET"
                                            ? "bg-[#d7f0cb] text-[#10200a]"
                                            : "bg-[#fbe7a6] text-[#564419]"
                                        }`}
                                >
                                    {endpoint.method}
                                </Chip>
                                <code className="flex-1 font-mono text-sm text-[var(--md-sys-color-on-surface)]">
                                    {endpoint.path}
                                </code>
                                <span className="text-sm text-[var(--md-sys-color-on-surface-variant)]">
                                    {endpoint.description}
                                </span>
                            </div>
                        ))}
                    </div>
                    <Divider className="bg-[var(--md-sys-color-outline-variant)]/30" />
                    <p className="text-xs text-[var(--md-sys-color-on-surface-variant)] text-center">
                        詳細なAPI仕様書はPhase 7で実装予定です
                    </p>
                </CardBody>
            </Card>

            {/* Quick Actions */}
            <Card className="bg-[var(--md-sys-color-surface-container-lowest)] rounded-[28px] border-none shadow-none">
                <CardHeader className="p-8 pb-4 flex-row items-center gap-4">
                    <Terminal className="w-5 h-5 text-[#73342b]" />
                    <h2 className="text-xl font-bold tracking-tight text-[var(--md-sys-color-on-surface)]">
                        クイックリンク
                    </h2>
                </CardHeader>
                <CardBody className="px-8 pb-8">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <motion.div whileTap={{ scale: 0.95 }}>
                            <Button
                                as="a"
                                href="https://github.com/k319k/Fukaibox_system"
                                target="_blank"
                                variant="flat"
                                radius="full"
                                className="w-full h-14 font-medium flex items-center justify-center gap-2 bg-[var(--md-sys-color-surface-container-high)]"
                                endContent={<ExternalLink className="w-4 h-4" />}
                            >
                                GitHub リポジトリ
                            </Button>
                        </motion.div>
                        <motion.div whileTap={{ scale: 0.95 }}>
                            <Button
                                as="a"
                                href="https://vercel.com/k319ks-projects/fukai-box"
                                target="_blank"
                                variant="flat"
                                radius="full"
                                className="w-full h-14 font-medium flex items-center justify-center gap-2 bg-[var(--md-sys-color-surface-container-high)]"
                                endContent={<ExternalLink className="w-4 h-4" />}
                            >
                                Vercel ダッシュボード
                            </Button>
                        </motion.div>
                    </div>
                </CardBody>
            </Card>
        </motion.div>
    );
}
