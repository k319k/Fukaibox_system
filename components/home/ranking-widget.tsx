"use client";

import { Card, CardBody, CardHeader, Progress, Avatar, Skeleton } from "@heroui/react";
import { Trophy, Crown } from "lucide-react";
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
    if (rank === 1) return { bg: "bg-[#ffdad5]", text: "text-[#73342b]" };
    if (rank === 2) return { bg: "bg-[#E8E8E8]", text: "text-[#4a4a4a]" };
    if (rank === 3) return { bg: "bg-[#EACDAF]", text: "text-[#6b4423]" };
    return { bg: "bg-[var(--md-sys-color-surface-container-highest)]", text: "text-[var(--md-sys-color-on-surface-variant)]" };
}

function getRankIcon(rank: number) {
    if (rank === 1) return <Crown className="w-4 h-4 text-[#73342b]" />;
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
            <Card className="bg-[var(--md-sys-color-surface-container-low)] rounded-[28px] border-none shadow-none">
                <CardHeader className="p-8 pb-4 flex-col items-start">
                    <h2 className="text-2xl font-bold tracking-tight flex items-center gap-3 text-[var(--md-sys-color-on-surface)]">
                        <Trophy className="w-5 h-5 text-[#564419]" />
                        貢献度ランキング
                    </h2>
                </CardHeader>
                <CardBody className="px-8 pb-8">
                    {loading ? (
                        <div className="space-y-4">
                            {[1, 2, 3, 4, 5].map((i) => (
                                <div key={i} className="flex items-center gap-5 p-4">
                                    <Skeleton className="w-10 h-10 rounded-[12px]" />
                                    <div className="flex-1 space-y-2">
                                        <Skeleton className="h-4 w-24 rounded-full" />
                                        <Skeleton className="h-2 w-full rounded-full" />
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
                                            size="sm"
                                            name={displayName[0]}
                                            src={user.image || undefined}
                                            classNames={{
                                                base: "shrink-0 ring-2 ring-[var(--md-sys-color-outline-variant)]/30 rounded-[12px]",
                                            }}
                                        />
                                        <div className="flex-1 space-y-2">
                                            <div className="flex items-center justify-between">
                                                <p className="text-lg font-medium tracking-normal group-hover:text-[#73342b] transition-colors text-[var(--md-sys-color-on-surface)]">
                                                    {displayName}
                                                </p>
                                                <span className="text-sm font-mono text-[var(--md-sys-color-on-surface-variant)]">
                                                    {user.points.toFixed(1)}pt
                                                </span>
                                            </div>
                                            <Progress
                                                size="sm"
                                                value={(user.points / maxPoints) * 100}
                                                classNames={{
                                                    track: "bg-[var(--md-sys-color-surface-container-highest)]",
                                                    indicator: "bg-[#73342b]"
                                                }}
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
                </CardBody>
            </Card>
        </motion.div>
    );
}
