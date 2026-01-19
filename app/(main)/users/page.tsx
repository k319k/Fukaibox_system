"use client";

import { useEffect, useState } from "react";
import { getAllUsersWithStatus } from "@/app/actions/user";
import { Card, CardBody, Avatar, Chip, Spinner } from "@heroui/react";
import { Icon } from "@iconify/react";
import { motion } from "framer-motion";

interface User {
    id: string;
    name: string | null;
    image: string | null;
    isOnline: boolean;
    discordUsername: string | null;
    role: string;
}

const roleConfig: Record<string, { bg: string; text: string; label: string }> = {
    gicho: { bg: "bg-[#ffdad5]", text: "text-[#73342b]", label: "儀長" },
    giin: { bg: "bg-[#d7f0cb]", text: "text-[#10200a]", label: "儀員" },
    meiyo_giin: { bg: "bg-[#fbe7a6]", text: "text-[#564419]", label: "名誉儀員" },
    guest: { bg: "bg-[#f3f4f6]", text: "text-[#6b7280]", label: "ゲスト" },
};

const containerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.05 } }
};

const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 }
};

export default function UsersPage() {
    const [users, setUsers] = useState<User[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchUsers = async () => {
            try {
                const data = await getAllUsersWithStatus();
                setUsers(data);
            } catch (error) {
                console.error("Failed to fetch users:", error);
            } finally {
                setLoading(false);
            }
        };
        fetchUsers();
        const interval = setInterval(fetchUsers, 30000);
        return () => clearInterval(interval);
    }, []);

    if (loading) {
        return (
            <div className="flex justify-center items-center h-[calc(100vh-200px)]">
                <Spinner size="lg" classNames={{ circle1: "border-b-[#73342b]", circle2: "border-b-[#ffdad5]" }} />
            </div>
        );
    }

    return (
        <motion.div
            className="p-6 md:p-8 max-w-7xl mx-auto"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
        >
            <div className="flex items-center gap-3 mb-8">
                <Icon icon="solar:users-group-rounded-bold" className="text-3xl text-[#73342b]" />
                <h1 className="text-2xl font-bold text-[var(--md-sys-color-on-surface)]">儀員名簿</h1>
                <Chip size="sm" className="rounded-full bg-[#ffdad5] text-[#73342b]">
                    {users.length}名
                </Chip>
            </div>

            <motion.div
                className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4"
                variants={containerVariants}
                initial="hidden"
                animate="visible"
            >
                {users.map((user) => {
                    const role = roleConfig[user.role] || roleConfig.guest;
                    return (
                        <motion.div key={user.id} variants={itemVariants}>
                            <motion.div whileTap={{ scale: 0.95 }}>
                                <Card className="bg-[var(--md-sys-color-surface-container-lowest)] border-none shadow-none hover:shadow-lg transition-all duration-300 rounded-[20px]">
                                    <CardBody className="flex flex-row items-center gap-4 p-4">
                                        <div className="relative">
                                            <Avatar
                                                src={user.image || undefined}
                                                name={user.discordUsername?.[0] || user.name?.[0] || "?"}
                                                size="lg"
                                                classNames={{ base: "rounded-[16px]" }}
                                            />
                                            <span className={`absolute bottom-0 right-0 w-3.5 h-3.5 rounded-full border-2 border-[#fff8f6] ${user.isOnline ? "bg-[#10200a]" : "bg-[#6b7280]"}`} />
                                        </div>
                                        <div className="flex flex-col min-w-0">
                                            <span className="font-bold text-[var(--md-sys-color-on-surface)] truncate">
                                                {user.discordUsername || user.name || "Unknown"}
                                            </span>
                                            <span className={`inline-block px-2 py-0.5 text-xs rounded-full font-medium mt-1 w-fit ${role.bg} ${role.text}`}>
                                                {role.label}
                                            </span>
                                        </div>
                                    </CardBody>
                                </Card>
                            </motion.div>
                        </motion.div>
                    );
                })}
            </motion.div>
        </motion.div>
    );
}
