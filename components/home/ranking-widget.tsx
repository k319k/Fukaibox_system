"use client";

import { Card, CardBody, CardHeader, Progress } from "@heroui/react";
import { Trophy } from "lucide-react";
import { motion } from "framer-motion";

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

function getRankBadgeClass(rank: number): string {
    if (rank === 1) return "bg-[#FFD700] text-white";
    if (rank === 2) return "bg-[#C0C0C0] text-white";
    if (rank === 3) return "bg-[#CD7F32] text-white";
    return "bg-[var(--md-sys-color-surface-container-highest)] text-[var(--md-sys-color-on-surface-variant)]";
}

export function RankingWidget() {
    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.2 }}
        >
            <Card className="bg-content1 rounded-[28px] border-none shadow-none">
                <CardHeader className="p-8 pb-4 flex-col items-start">
                    <h2 className="text-2xl font-bold tracking-tight flex items-center gap-3">
                        <Trophy className="w-5 h-5 text-[var(--md-sys-color-tertiary)]" />
                        貢献度ランキング
                    </h2>
                </CardHeader>
                <CardBody className="px-8 pb-8">
                    <motion.div
                        className="space-y-4"
                        variants={containerVariants}
                        initial="hidden"
                        animate="visible"
                    >
                        {[1, 2, 3, 4, 5].map((rank) => (
                            <motion.div
                                key={rank}
                                variants={itemVariants}
                                whileHover={{ x: 4, transition: { duration: 0.2 } }}
                                className="flex items-center gap-5 p-4 rounded-[20px] hover:bg-[var(--md-sys-color-surface-container-high)] transition-all cursor-pointer group"
                            >
                                <div className={`w-10 h-10 flex items-center justify-center rounded-[12px] font-bold text-lg transition-transform group-hover:scale-110 ${getRankBadgeClass(rank)}`}>
                                    {rank}
                                </div>
                                <div className="flex-1 space-y-2">
                                    <div className="flex items-center justify-between">
                                        <p className="text-lg font-medium tracking-normal group-hover:text-[var(--md-sys-color-primary)] transition-colors">
                                            ユーザー名
                                        </p>
                                        <span className="text-sm font-mono text-[var(--md-sys-color-on-surface-variant)]">
                                            {1000 - rank * 100}pt
                                        </span>
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
                            </motion.div>
                        ))}
                    </motion.div>
                </CardBody>
            </Card>
        </motion.div>
    );
}
