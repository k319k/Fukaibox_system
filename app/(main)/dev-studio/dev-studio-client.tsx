"use client";

import { Card, Button, Tag, Divider, Typography } from "antd";
import { Icon } from "@iconify/react";
import { motion } from "framer-motion";
import { useState } from "react";
import { checkPointsApiHealth, getUserPoints, manageUserPoints, getUserRank } from "@/app/actions/points";
import { Input, InputNumber, notification } from "antd";

const { Paragraph } = Typography;

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

export function DevStudioClient({ }: DevStudioClientProps) {
    return (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }} className="max-w-4xl mx-auto space-y-8">
            {/* Header */}
            <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-[#ffdad5] rounded-[16px] flex items-center justify-center">
                    <Icon icon="material-symbols:code" className="w-6 h-6 text-[#73342b]" />
                </div>
                <div>
                    <h1 className="text-3xl font-bold tracking-tight text-[var(--md-sys-color-on-surface)]">DevStudio</h1>
                    <p className="text-[var(--md-sys-color-on-surface-variant)]">開発者向けツールとAPI</p>
                </div>
                <Tag className="ml-auto rounded-full px-3 bg-[#ffdad5] text-[#73342b] border-none">儀長専用</Tag>
            </div>

            {/* API Key Section */}
            <Card className="bg-[var(--md-sys-color-surface-container-lowest)] rounded-[28px] border-none shadow-none">
                <div className="p-8 pb-4 flex items-center gap-4">
                    <Icon icon="material-symbols:vpn-key-outline" className="w-5 h-5 text-[#73342b]" />
                    <h2 className="text-xl font-bold tracking-tight text-[var(--md-sys-color-on-surface)]">APIキー</h2>
                </div>
                <div className="px-8 pb-8 space-y-6">
                    <div className="p-4 rounded-[20px] bg-[var(--md-sys-color-surface-container-high)]">
                        <p className="text-[var(--md-sys-color-on-surface-variant)] mb-4">
                            儀員点数APIを外部から利用するためのAPIキーです。機密情報として保管してください。
                        </p>
                        <div className="flex items-center gap-4">
                            <Paragraph copyable={{ icon: <Icon icon="material-symbols:content-copy" className="w-4 h-4" /> }} className="flex-1 rounded-full bg-[var(--md-sys-color-surface-container-highest)] px-4 py-2 font-mono mb-0">
                                fk_••••••••••••••••••••
                            </Paragraph>
                        </div>
                    </div>
                    <motion.div whileTap={{ scale: 0.95 }}>
                        <Button
                            shape="round"
                            size="large"
                            className="h-12 px-6 font-bold bg-[#ffdad5] text-[#73342b] border-none"
                            icon={<Icon icon="material-symbols:vpn-key-outline" className="w-4 h-4" />}
                            disabled
                        >
                            新しいAPIキーを発行（準備中）
                        </Button>
                    </motion.div>
                </div>
            </Card>

            {/* API Documentation */}
            <Card className="bg-[var(--md-sys-color-surface-container-lowest)] rounded-[28px] border-none shadow-none">
                <div className="p-8 pb-4 flex items-center gap-4">
                    <Icon icon="material-symbols:description-outline" className="w-5 h-5 text-[#73342b]" />
                    <h2 className="text-xl font-bold tracking-tight text-[var(--md-sys-color-on-surface)]">API仕様</h2>
                </div>
                <div className="px-8 pb-8 space-y-4">
                    <p className="text-[var(--md-sys-color-on-surface-variant)]">儀員点数APIのエンドポイント一覧です。</p>
                    <Divider className="bg-[var(--md-sys-color-outline-variant)]/30" />
                    <div className="space-y-3">
                        {apiEndpoints.map((endpoint) => (
                            <div key={endpoint.path} className="flex items-center gap-4 p-4 rounded-[20px] hover:bg-[var(--md-sys-color-surface-container-high)] transition-colors">
                                <Tag className={`rounded-full px-3 font-mono border-none ${endpoint.method === "GET" ? "bg-[#d7f0cb] text-[#10200a]" : "bg-[#fbe7a6] text-[#564419]"}`}>
                                    {endpoint.method}
                                </Tag>
                                <code className="flex-1 font-mono text-sm text-[var(--md-sys-color-on-surface)]">{endpoint.path}</code>
                                <span className="text-sm text-[var(--md-sys-color-on-surface-variant)]">{endpoint.description}</span>
                            </div>
                        ))}
                    </div>
                    <Divider className="bg-[var(--md-sys-color-outline-variant)]/30" />
                    <p className="text-xs text-[var(--md-sys-color-on-surface-variant)] text-center">詳細なAPI仕様書はPhase 7で実装予定です</p>
                </div>
            </Card>

            {/* API Test Section */}
            <Card className="bg-[var(--md-sys-color-surface-container-lowest)] rounded-[28px] border-none shadow-none">
                <div className="p-8 pb-4 flex items-center gap-4">
                    <Icon icon="material-symbols:science-outline" className="w-5 h-5 text-[#73342b]" />
                    <h2 className="text-xl font-bold tracking-tight text-[var(--md-sys-color-on-surface)]">APIテストコンソール</h2>
                </div>
                <div className="px-8 pb-8 space-y-6">
                    <ApiTester />
                </div>
            </Card>

            {/* Quick Actions */}
            <Card className="bg-[var(--md-sys-color-surface-container-lowest)] rounded-[28px] border-none shadow-none">
                <div className="p-8 pb-4 flex items-center gap-4">
                    <Icon icon="material-symbols:terminal" className="w-5 h-5 text-[#73342b]" />
                    <h2 className="text-xl font-bold tracking-tight text-[var(--md-sys-color-on-surface)]">クイックリンク</h2>
                </div>
                <div className="px-8 pb-8">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <motion.div whileTap={{ scale: 0.95 }}>
                            <Button
                                href="https://github.com/k319k/Fukaibox_system"
                                target="_blank"
                                shape="round"
                                size="large"
                                block
                                className="h-14 font-medium flex items-center justify-center gap-2 bg-[var(--md-sys-color-surface-container-high)]"
                                icon={<Icon icon="material-symbols:open-in-new" className="w-4 h-4" />}
                            >
                                GitHub リポジトリ
                            </Button>
                        </motion.div>
                        <motion.div whileTap={{ scale: 0.95 }}>
                            <Button
                                href="https://vercel.com/k319ks-projects/fukai-box"
                                target="_blank"
                                shape="round"
                                size="large"
                                block
                                className="h-14 font-medium flex items-center justify-center gap-2 bg-[var(--md-sys-color-surface-container-high)]"
                                icon={<Icon icon="material-symbols:open-in-new" className="w-4 h-4" />}
                            >
                                Vercel ダッシュボード
                            </Button>
                        </motion.div>
                    </div>
                </div>
            </Card>
        </motion.div>
    );
}

function ApiTester() {
    const [loading, setLoading] = useState(false);
    const [result, setResult] = useState<object | null>(null);
    const [targetId, setTargetId] = useState("");
    const [amount, setAmount] = useState<number | null>(100);
    const [reason, setReason] = useState("Debug Test");

    const handleHealthCheck = async () => {
        setLoading(true);
        const res = await checkPointsApiHealth();
        setResult(res);
        setLoading(false);
    };

    const handleGetPoints = async () => {
        if (!targetId) return notification.error({ message: "User ID Required" });
        setLoading(true);
        const res = await getUserPoints(targetId);
        setResult(res);
        setLoading(false);
    };

    const handleGetRank = async () => {
        if (!targetId) return notification.error({ message: "User ID Required" });
        setLoading(true);
        const res = await getUserRank(targetId);
        setResult(res);
        setLoading(false);
    };

    const handleUpdatePoints = async () => {
        if (!targetId) return notification.error({ message: "User ID Required" });
        if (!amount) return notification.error({ message: "Amount Required" });

        setLoading(true);
        const res = await manageUserPoints(targetId, amount, reason);
        setResult(res);
        setLoading(false);
    };

    return (
        <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                    <label className="text-sm font-medium text-[var(--md-sys-color-on-surface-variant)]">Target User ID</label>
                    <Input
                        placeholder="user_..."
                        value={targetId}
                        onChange={(e) => setTargetId(e.target.value)}
                        className="h-10 rounded-lg"
                    />
                </div>
                <div className="flex items-end gap-2">
                    <Button onClick={handleHealthCheck} loading={loading} shape="round">
                        Health Check
                    </Button>
                    <Button onClick={handleGetPoints} loading={loading} shape="round">
                        Get Points
                    </Button>
                    <Button onClick={handleGetRank} loading={loading} shape="round">
                        Get Rank
                    </Button>
                </div>
            </div>

            <div className="p-4 rounded-[20px] bg-[var(--md-sys-color-surface-container-high)] space-y-4">
                <h3 className="text-sm font-bold text-[var(--md-sys-color-on-surface)]">Points Mutation</h3>
                <div className="flex gap-2">
                    <InputNumber
                        placeholder="Amount"
                        value={amount}
                        onChange={(val) => setAmount(val)}
                        className="w-32 h-10 rounded-lg"
                    />
                    <Input
                        placeholder="Reason"
                        value={reason}
                        onChange={(e) => setReason(e.target.value)}
                        className="flex-1 h-10 rounded-lg"
                    />
                    <Button type="primary" onClick={handleUpdatePoints} loading={loading} shape="round" className="bg-[#73342b] h-10">
                        Add/Sub
                    </Button>
                </div>
            </div>

            {result && (
                <div className="p-4 rounded-[20px] bg-black text-green-400 font-mono text-xs overflow-auto max-h-60">
                    <pre>{JSON.stringify(result, null, 2)}</pre>
                </div>
            )}
        </div>
    );
}
