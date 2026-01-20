"use client";

import { Avatar, Dropdown, DropdownTrigger, DropdownMenu, DropdownItem, Tooltip } from "@heroui/react";
import { LogIn, LogOut } from "lucide-react";
import { signOut } from "@/lib/auth-client";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";
import { useSidebar } from "./sidebar";

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
    gicho: "bg-[#ffdad5] text-[#73342b]",
    giin: "bg-[#d7f0cb] text-[#10200a]",
    meiyo_giin: "bg-[#fbe7a6] text-[#564419]",
    guest: "bg-[var(--md-sys-color-surface-container-high)] text-[var(--md-sys-color-on-surface-variant)]",
};

export function SidebarUser({ userName, userImage, userRole = "guest" }: SidebarUserProps) {
    const { isCollapsed } = useSidebar();
    const isLoggedIn = !!userName;
    const displayName = userName || "ゲスト";
    const roleLabel = roleLabels[userRole] || "ゲスト";
    const roleBadgeClass = roleBadgeClasses[userRole] || roleBadgeClasses.guest;

    const avatarContent = (
        <Dropdown placement="top-start" radius="lg">
            <DropdownTrigger>
                <motion.div whileTap={{ scale: 0.95 }}>
                    <div className={cn(
                        "flex items-center cursor-pointer transition-all duration-200 rounded-[20px]",
                        "hover:bg-[var(--md-sys-color-surface-container-high)]",
                        isCollapsed
                            ? "justify-center p-2"
                            : "gap-4 p-4 bg-[var(--md-sys-color-surface-container)]/80"
                    )}>
                        <Avatar
                            size={isCollapsed ? "sm" : "md"}
                            name={displayName[0]}
                            src={userImage || undefined}
                            classNames={{
                                base: cn(
                                    "shrink-0 ring-2 ring-[var(--md-sys-color-outline-variant)]/30",
                                    isCollapsed ? "rounded-[12px]" : "rounded-[16px]"
                                ),
                            }}
                        />
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
            </DropdownTrigger>
            <DropdownMenu aria-label="ユーザーメニュー">
                {isLoggedIn ? (
                    <DropdownItem
                        key="logout"
                        className="text-[#93000a]"
                        startContent={<LogOut className="w-4 h-4" />}
                        onPress={() => signOut()}
                    >
                        ログアウト
                    </DropdownItem>
                ) : (
                    <DropdownItem
                        key="login"
                        className="text-[#73342b]"
                        startContent={<LogIn className="w-4 h-4" />}
                        href="/login"
                    >
                        ログイン
                    </DropdownItem>
                )}
            </DropdownMenu>
        </Dropdown>
    );

    return (
        <div className={cn("pb-6", isCollapsed ? "px-2" : "px-4")}>
            {isCollapsed ? (
                <Tooltip content={`${displayName} (${isLoggedIn ? roleLabel : "未ログイン"})`} placement="right">
                    {avatarContent}
                </Tooltip>
            ) : (
                avatarContent
            )}
        </div>
    );
}
