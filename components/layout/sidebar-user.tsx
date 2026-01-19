"use client";

import { Avatar, Dropdown, DropdownTrigger, DropdownMenu, DropdownItem } from "@heroui/react";
import { LogIn, LogOut } from "lucide-react";
import { signOut } from "@/lib/auth-client";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";

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
    const isLoggedIn = !!userName;
    const displayName = userName || "ゲスト";
    const roleLabel = roleLabels[userRole] || "ゲスト";
    const roleBadgeClass = roleBadgeClasses[userRole] || roleBadgeClasses.guest;

    return (
        <div className="px-4 pb-6">
            <Dropdown placement="top-start" radius="lg">
                <DropdownTrigger>
                    <motion.div whileTap={{ scale: 0.95 }}>
                        <div className="flex items-center gap-4 p-4 rounded-[20px] bg-[var(--md-sys-color-surface-container)]/80 hover:bg-[var(--md-sys-color-surface-container-high)] cursor-pointer transition-all duration-200">
                            <Avatar
                                size="md"
                                name={displayName[0]}
                                src={userImage || undefined}
                                classNames={{
                                    base: "rounded-[16px] ring-2 ring-[var(--md-sys-color-outline-variant)]/30",
                                }}
                            />
                            <div className="flex-1 min-w-0">
                                <p className="text-lg font-medium tracking-tight truncate text-[var(--md-sys-color-on-surface)]">
                                    {displayName}
                                </p>
                                <span className={cn("inline-block px-3 py-1 text-xs mt-1 rounded-full font-medium", roleBadgeClass)}>
                                    {isLoggedIn ? roleLabel : "未ログイン"}
                                </span>
                            </div>
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
        </div>
    );
}
