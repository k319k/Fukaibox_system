"use client";

import { Card, CardBody, CardHeader, Avatar, Skeleton } from "@heroui/react";
import { Star } from "lucide-react";
import { motion } from "framer-motion";
import { useEffect, useState } from "react";
import { getHonoraryMembers } from "@/app/actions/ranking";

interface HonoraryMember {
    id: string;
    name: string;
    image: string | null;
    discordUsername: string | null;
}

const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
        opacity: 1,
        transition: { staggerChildren: 0.1, delayChildren: 0.2 }
    }
};

const itemVariants = {
    hidden: { opacity: 0, scale: 0.9 },
    visible: { opacity: 1, scale: 1 }
};

export function HonoraryMemberWidget() {
    const [members, setMembers] = useState<HonoraryMember[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function fetchMembers() {
            try {
                const data = await getHonoraryMembers();
                setMembers(data);
            } catch (error) {
                console.error("Failed to fetch honorary members:", error);
            } finally {
                setLoading(false);
            }
        }
        fetchMembers();
    }, []);

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.3 }}
        >
            <Card className="bg-[var(--md-sys-color-surface-container-low)] rounded-[28px] border-none shadow-none">
                <CardHeader className="p-8 pb-4 flex-col items-start">
                    <h2 className="text-2xl font-bold tracking-tight flex items-center gap-3 text-[var(--md-sys-color-on-surface)]">
                        <Star className="w-5 h-5 text-[#fbe7a6] fill-[#fbe7a6]" />
                        名誉儀員
                    </h2>
                    <p className="text-sm text-[var(--md-sys-color-on-surface-variant)] mt-1">
                        封解公儀に貢献した方々
                    </p>
                </CardHeader>
                <CardBody className="px-8 pb-8">
                    {loading ? (
                        <div className="flex flex-wrap gap-4">
                            {[1, 2, 3].map((i) => (
                                <Skeleton key={i} className="w-20 h-20 rounded-[20px]" />
                            ))}
                        </div>
                    ) : members.length > 0 ? (
                        <motion.div
                            className="flex flex-wrap gap-4"
                            variants={containerVariants}
                            initial="hidden"
                            animate="visible"
                        >
                            {members.map((member) => {
                                const displayName = member.discordUsername || member.name;
                                return (
                                    <motion.div
                                        key={member.id}
                                        variants={itemVariants}
                                        whileHover={{ y: -4, transition: { duration: 0.2 } }}
                                        whileTap={{ scale: 0.95 }}
                                        className="flex flex-col items-center gap-2 p-4 rounded-[20px] hover:bg-[var(--md-sys-color-surface-container-high)] transition-all cursor-pointer group"
                                    >
                                        <div className="relative">
                                            <Avatar
                                                size="lg"
                                                name={displayName[0]}
                                                src={member.image || undefined}
                                                classNames={{
                                                    base: "ring-2 ring-[#fbe7a6] rounded-[16px] group-hover:ring-4 transition-all",
                                                }}
                                            />
                                            <div className="absolute -top-1 -right-1 w-5 h-5 bg-[#fbe7a6] rounded-full flex items-center justify-center shadow-sm">
                                                <Star className="w-3 h-3 text-[#564419] fill-[#564419]" />
                                            </div>
                                        </div>
                                        <p className="text-sm font-medium text-center text-[var(--md-sys-color-on-surface)] group-hover:text-[#73342b] transition-colors max-w-[80px] truncate">
                                            {displayName}
                                        </p>
                                    </motion.div>
                                );
                            })}
                        </motion.div>
                    ) : (
                        <div className="text-center py-6 text-[var(--md-sys-color-on-surface-variant)]">
                            <p className="text-base font-normal">名誉儀員はまだいません</p>
                        </div>
                    )}
                </CardBody>
            </Card>
        </motion.div>
    );
}
