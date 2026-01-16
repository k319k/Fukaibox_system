"use client";

import { Button, Avatar, Tooltip } from "@heroui/react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { Home, ChefHat, Book, Wrench, Settings } from "lucide-react";

const navigation = [
    { name: "ホーム", href: "/", icon: Home },
    { name: "台所", href: "/kitchen", icon: ChefHat },
    { name: "界域百科事典", href: "/dictionary", icon: Book },
    { name: "封解Box Tools", href: "/tools", icon: Wrench },
];

const bottomNavigation = [
    { name: "設定", href: "/settings", icon: Settings },
];

interface SidebarProps {
    userRole?: string;
    userName?: string;
    userImage?: string | null;
}

export function Sidebar({ userRole = "guest", userName, userImage }: SidebarProps) {
    const pathname = usePathname();
    const isLoggedIn = !!userName;
    const displayName = userName || "ゲスト";
    const roleLabel = {
        gicho: "儀長",
        giin: "儀員",
        meiyo_giin: "名誉儀員",
        guest: "ゲスト",
    }[userRole] || "ゲスト";

    const roleBadgeClass = {
        gicho: "badge-gicho",
        giin: "badge-giin",
        meiyo_giin: "badge-meiyo-giin",
        guest: "badge-guest",
    }[userRole] || "badge-guest";

    return (
        <aside className="fixed left-0 top-0 h-screen w-64 flex flex-col z-50 bg-[var(--md-sys-color-surface)] border-r border-[var(--md-sys-color-outline-variant)]/20">
            {/* ロゴ - M3 Headline Style */}
            <div className="p-6 flex items-center gap-4">
                <div className="w-12 h-12 bg-[var(--md-sys-color-primary-container)] rounded-2xl flex items-center justify-center">
                    <span className="text-xl font-extrabold text-[var(--md-sys-color-on-primary-container)] tracking-tight">封</span>
                </div>
                <div>
                    <span className="headline-small block tracking-tight font-extrabold text-[var(--md-sys-color-on-surface)]">封解Box</span>
                </div>
            </div>

            {/* メインナビゲーション */}
            <nav className="flex-1 px-4 py-6 space-y-1">
                {navigation.map((item) => {
                    const isActive = pathname === item.href;
                    return (
                        <Link key={item.name} href={item.href} className="group relative block">
                            <Button
                                variant="light"
                                className="w-full justify-start gap-4 h-14 rounded-full relative overflow-hidden"
                                aria-current={isActive ? "page" : undefined}
                            >
                                <div className="relative z-10 flex items-center gap-4">
                                    <item.icon
                                        strokeWidth={1.5}
                                        className={`w-5 h-5 transition-colors duration-200 ${isActive ? "text-[var(--md-sys-color-on-primary-container)]" : "text-[var(--md-sys-color-on-surface-variant)] group-hover:text-[var(--md-sys-color-primary)]"}`}
                                    />
                                    <span className={`font-semibold tracking-tight transition-colors duration-200 ${isActive ? "text-[var(--md-sys-color-on-primary-container)]" : "text-[var(--md-sys-color-on-surface-variant)] group-hover:text-[var(--md-sys-color-on-surface)]"}`}>
                                        {item.name}
                                    </span>
                                </div>

                                {/* Active Background - M3 Primary Container (NOT solid Primary) */}
                                {isActive && (
                                    <div className="absolute inset-0 bg-[var(--md-sys-color-primary-container)] z-0 rounded-full" />
                                )}

                                {/* Hover State Layer */}
                                {!isActive && (
                                    <div className="absolute inset-0 rounded-full bg-[var(--md-sys-color-on-surface)] opacity-0 group-hover:opacity-[0.08] transition-opacity duration-200" />
                                )}
                            </Button>
                        </Link>
                    );
                })}
            </nav>

            {/* 下部ナビゲーション */}
            <div className="px-4 pb-4 space-y-1">
                {bottomNavigation.map((item) => {
                    const isActive = pathname === item.href;
                    return (
                        <Link key={item.name} href={item.href} className="group relative block">
                            <Button
                                variant="light"
                                className="w-full justify-start gap-4 h-14 rounded-full relative overflow-hidden"
                                aria-current={isActive ? "page" : undefined}
                            >
                                <div className="relative z-10 flex items-center gap-4">
                                    <item.icon
                                        strokeWidth={1.5}
                                        className={`w-5 h-5 transition-colors duration-200 ${isActive ? "text-[var(--md-sys-color-on-primary-container)]" : "text-[var(--md-sys-color-on-surface-variant)] group-hover:text-[var(--md-sys-color-primary)]"}`}
                                    />
                                    <span className={`font-semibold tracking-tight transition-colors duration-200 ${isActive ? "text-[var(--md-sys-color-on-primary-container)]" : "text-[var(--md-sys-color-on-surface-variant)] group-hover:text-[var(--md-sys-color-on-surface)]"}`}>
                                        {item.name}
                                    </span>
                                </div>

                                {isActive && (
                                    <div className="absolute inset-0 bg-[var(--md-sys-color-primary-container)] z-0 rounded-full" />
                                )}

                                {!isActive && (
                                    <div className="absolute inset-0 rounded-full bg-[var(--md-sys-color-on-surface)] opacity-0 group-hover:opacity-[0.08] transition-opacity duration-200" />
                                )}
                            </Button>
                        </Link>
                    );
                })}
            </div>

            {/* ユーザー情報 - M3 Surface Container */}
            <div className="px-4 pb-6">
                <Tooltip content="プロフィール">
                    <div className="flex items-center gap-4 p-4 rounded-2xl bg-[var(--md-sys-color-surface-container)]/80 hover:bg-[var(--md-sys-color-surface-container-high)] cursor-pointer transition-all duration-200">
                        <Avatar
                            size="md"
                            name={displayName[0]}
                            src={userImage || undefined}
                            classNames={{
                                base: "ring-2 ring-[var(--md-sys-color-outline-variant)]/30",
                            }}
                        />
                        <div className="flex-1 min-w-0">
                            <p className="title-medium truncate tracking-tight font-semibold text-[var(--md-sys-color-on-surface)]">
                                {displayName}
                            </p>
                            <span className={cn("inline-block px-3 py-1 text-xs mt-1 rounded-full font-medium", roleBadgeClass)}>
                                {isLoggedIn ? roleLabel : "未ログイン"}
                            </span>
                        </div>
                    </div>
                </Tooltip>
            </div>
        </aside>
    );
}
