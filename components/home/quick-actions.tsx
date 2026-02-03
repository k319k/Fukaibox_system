"use client";

import { Card } from "antd";
import Link from "next/link";
import { Icon } from "@iconify/react";
import { motion } from "framer-motion";

const actions = [
    {
        label: "料理をする",
        href: "/cooking",
        icon: "material-symbols:skillet",
        bgColor: "bg-[#ffdad5]",
        textColor: "text-[#73342b]"
    },
    {
        label: "保管庫を見る",
        href: "/storage",
        icon: "material-symbols:package-2-outline",
        bgColor: "bg-[#fbe7a6]",
        textColor: "text-[#564419]"
    },
    {
        label: "道具を使う",
        href: "/tools",
        icon: "material-symbols:build",
        bgColor: "bg-[#d7f0cb]",
        textColor: "text-[#10200a]"
    },
    {
        label: "設定",
        href: "/settings",
        icon: "material-symbols:settings",
        bgColor: "bg-[var(--md-sys-color-surface-container-high)]",
        textColor: "text-[var(--md-sys-color-on-surface)]"
    },
];

const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
        opacity: 1,
        transition: { staggerChildren: 0.05 }
    }
};

const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 }
};

export function QuickActions() {
    return (
        <motion.div
            className="grid grid-cols-2 md:grid-cols-4 gap-6"
            variants={containerVariants}
            initial="hidden"
            animate="visible"
        >
            {actions.map((action) => (
                <motion.div key={action.label} variants={itemVariants}>
                    <Link href={action.href} className="group block">
                        <motion.div
                            whileHover={{ y: -4, transition: { duration: 0.2 } }}
                            whileTap={{ scale: 0.95 }}
                        >
                            <Card
                                className={`h-44 border-none shadow-none hover:shadow-lg transition-all duration-300 ${action.bgColor} ${action.textColor} rounded-[28px]`}
                                styles={{ body: { height: "100%", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 20, padding: 32 } }}
                            >
                                <Icon
                                    icon={action.icon}
                                    className="w-10 h-10 group-hover:scale-110 transition-transform duration-300"
                                />
                                <span className="text-lg font-medium tracking-normal">
                                    {action.label}
                                </span>
                            </Card>
                        </motion.div>
                    </Link>
                </motion.div>
            ))}
        </motion.div>
    );
}
