"use client";

import { Card, Progress, Avatar, Skeleton } from "antd";
import { Icon } from "@iconify/react";
import { motion } from "framer-motion";
import { useEffect, useState } from "react";
import { getTopRankings, type RankingUser } from "@/app/actions/ranking";

const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
        opacity: 1,
        transition: { staggerChildren: 0.05, delayChildren: 0.2 }
    }
};

const itemVariants = {
    hidden: { opacity: 0, x: -20 },
    visible: { opacity: 1, x: 0 }
};

function getRankStyle(rank: number): { bg: string; text: string } {
    if (rank === 1) return { bg: "bg-[var(--color-kitchen-tag-bg)]", text: "text-[var(--color-kitchen-tag-text)]" };
    if (rank === 2) return { bg: "bg-[var(--color-rank-silver-bg)]", text: "text-[var(--color-rank-silver-text)]" };
    if (rank === 3) return { bg: "bg-[var(--color-rank-bronze-bg)]", text: "text-[var(--color-rank-bronze-text)]" };
    return { bg: "bg-[var(--md-sys-color-surface-container-highest)]", text: "text-[var(--md-sys-color-on-surface-variant)]" };
}

function getRankIcon(rank: number) {
    if (rank === 1) return <Icon icon="material-symbols:workspace-premium" className="w-4 h-4 text-[var(--color-kitchen-tag-text)]" />;
    return null;
}

export function RankingWidget() {
    const [rankings, setRankings] = useState<RankingUser[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function fetchRankings() {
            try {
                const data = await getTopRankings(5);
                setRankings(data);
            } catch (error) {
                console.error("Failed to fetch rankings:", error);
            } finally {
                setLoading(false);
            }
        }
        fetchRankings();
    }, []);

    // 最高ポイントの計算（プログレスバー用）
    const maxPoints = rankings.length > 0 ? Math.max(...rankings.map(r => r.points), 1) : 100;

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.2 }}
        >
            <Card
                className="bg-[var(--md-sys-color-surface-container-low)] rounded-[28px] border-none shadow-none"
                styles={{ body: { padding: "0 32px 32px 32px" } }}
            >
                <div className="p-8 pb-4">
                    <h2 className="text-2xl font-bold tracking-tight flex items-center gap-3 text-[var(--md-sys-color-on-surface)]">
                        <Icon icon="material-symbols:trophy" className="w-5 h-5 text-[var(--color-kitchen-gold-text)]" />
                        貢献度ランキング
                    </h2>
                </div>
                <div>
                    {loading ? (
                        <div className="space-y-4">
                            {[1, 2, 3, 4, 5].map((i) => (
                                <div key={i} className="flex items-center gap-5 p-4">
                                    <Skeleton.Avatar active size={40} shape="square" style={{ borderRadius: 12 }} />
                                    <div className="flex-1 space-y-2">
                                        <Skeleton.Input active size="small" style={{ width: 96 }} />
                                        <Skeleton.Input active size="small" style={{ width: "100%", height: 8 }} />
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : rankings.length > 0 ? (
                        <motion.div
                            className="space-y-4"
                            variants={containerVariants}
                            initial="hidden"
                            animate="visible"
                        >
                            {rankings.map((user) => {
                                const style = getRankStyle(user.rank);
                                const displayName = user.discordUsername || user.name;
                                return (
                                    <motion.div
                                        key={user.id}
                                        variants={itemVariants}
                                        whileHover={{ x: 4, transition: { duration: 0.2 } }}
                                        whileTap={{ scale: 0.98 }}
                                        className="flex items-center gap-5 p-4 rounded-[20px] hover:bg-[var(--md-sys-color-surface-container-high)] transition-all cursor-pointer group"
                                    >
                                        <div className={`w-10 h-10 flex items-center justify-center rounded-[12px] font-bold text-lg transition-transform group-hover:scale-110 ${style.bg} ${style.text}`}>
                                            {getRankIcon(user.rank) || user.rank}
                                        </div>
                                        <Avatar
                                            size="small"
                                            src={user.image || undefined}
                                            className="shrink-0 ring-2 ring-[var(--md-sys-color-outline-variant)]/30 rounded-[12px]"
                                        >
                                            {displayName[0]}
                                        </Avatar>
                                        <div className="flex-1 space-y-2">
                                            <div className="flex items-center justify-between">
                                                <p className="text-lg font-medium tracking-normal group-hover:text-[var(--md-sys-color-primary)] transition-colors text-[var(--md-sys-color-on-surface)]">
                                                    {displayName}
                                                </p>
                                                <span className="text-sm font-mono text-[var(--md-sys-color-on-surface-variant)]">
                                                    {user.points.toFixed(1)}pt
                                                </span>
                                            </div>
                                            <Progress
                                                percent={(user.points / maxPoints) * 100}
                                                showInfo={false}
                                                size="small"
                                                strokeColor="var(--color-kitchen-tag-text)"
                                                trailColor="var(--md-sys-color-surface-container-highest)"
                                            />
                                        </div>
                                    </motion.div>
                                );
                            })}
                        </motion.div>
                    ) : (
                        <div className="text-center py-8 text-[var(--md-sys-color-on-surface-variant)]">
                            <p className="text-base font-normal">ランキングデータがありません</p>
                        </div>
                    )}
                </div>
            </Card>
        </motion.div>
    );
}
