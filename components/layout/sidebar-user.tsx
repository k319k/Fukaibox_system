"use client";

import { Avatar, Dropdown, Tooltip } from "antd";
import type { MenuProps } from "antd";
import { Icon } from "@iconify/react";
import { signOut } from "@/lib/auth-client";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";
import { useSidebar } from "./sidebar";
import Link from "next/link";

interface SidebarUserProps {
    userName?: string;
    userImage?: string | null;
    userRole?: string;
}

const roleLabels: Record<string, string> = {
    gicho: "儀長",
    giin: "儀員",
    meiyo_giin: "名誉儀員",
    guest: "ゲスト",
};

const roleBadgeClasses: Record<string, string> = {
    gicho: "bg-[var(--color-kitchen-tag-bg)] text-[var(--color-kitchen-tag-text)]",
    giin: "bg-[var(--color-kitchen-success-bg)] text-[var(--color-kitchen-success-text)]",
    meiyo_giin: "bg-[var(--color-kitchen-gold-bg)] text-[var(--color-kitchen-gold-text)]",
    guest: "bg-[var(--md-sys-color-surface-container-high)] text-[var(--md-sys-color-on-surface-variant)]",
};

export function SidebarUser({ userName, userImage, userRole = "guest" }: SidebarUserProps) {
    const { isCollapsed } = useSidebar();
    const isLoggedIn = !!userName;
    const displayName = userName || "ゲスト";
    const roleLabel = roleLabels[userRole] || "ゲスト";
    const roleBadgeClass = roleBadgeClasses[userRole] || roleBadgeClasses.guest;

    const menuItems: MenuProps["items"] = isLoggedIn
        ? [
            {
                key: "logout",
                icon: <Icon icon="material-symbols:logout" className="w-4 h-4" />,
                label: "ログアウト",
                danger: true,
                onClick: () => signOut(),
            },
        ]
        : [
            {
                key: "login",
                icon: <Icon icon="material-symbols:login" className="w-4 h-4" />,
                label: <Link href="/login">ログイン</Link>,
            },
        ];

    const avatarContent = (
        <Dropdown menu={{ items: menuItems }} placement="topLeft" trigger={["click"]}>
            <motion.div whileTap={{ scale: 0.95 }}>
                <div className={cn(
                    "flex items-center cursor-pointer transition-all duration-200 rounded-[20px]",
                    "hover:bg-[var(--md-sys-color-surface-container-high)]",
                    isCollapsed
                        ? "justify-center p-2"
                        : "gap-4 p-4 bg-[var(--md-sys-color-surface-container)]/80"
                )}>
                    <Avatar
                        size={isCollapsed ? "small" : "default"}
                        src={userImage || undefined}
                        className={cn(
                            "shrink-0 ring-2 ring-[var(--md-sys-color-outline-variant)]/30",
                            isCollapsed ? "rounded-[12px]" : "rounded-[16px]"
                        )}
                    >
                        {displayName[0]}
                    </Avatar>
                    <AnimatePresence>
                        {!isCollapsed && (
                            <motion.div
                                initial={{ opacity: 0, width: 0 }}
                                animate={{ opacity: 1, width: "auto" }}
                                exit={{ opacity: 0, width: 0 }}
                                className="flex-1 min-w-0 overflow-hidden"
                            >
                                <p className="text-lg font-medium tracking-tight truncate text-[var(--md-sys-color-on-surface)]">
                                    {displayName}
                                </p>
                                <span className={cn("inline-block px-3 py-1 text-xs mt-1 rounded-full font-medium", roleBadgeClass)}>
                                    {isLoggedIn ? roleLabel : "未ログイン"}
                                </span>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            </motion.div>
        </Dropdown>
    );

    return (
        <div className={cn("pb-6", isCollapsed ? "px-2" : "px-4")}>
            {isCollapsed ? (
                <Tooltip title={`${displayName} (${isLoggedIn ? roleLabel : "未ログイン"})`} placement="right">
                    {avatarContent}
                </Tooltip>
            ) : (
                avatarContent
            )}
        </div>
    );
}
