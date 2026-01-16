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
        <aside className="fixed left-0 top-0 h-screen w-64 elevated-2 flex flex-col z-50">
            {/* ロゴ - M3 Headline Style */}
            <div className="p-5 flex items-center gap-3 border-b border-[var(--md-sys-color-outline-variant)]">
                <div className="w-11 h-11 gradient-primary shape-lg flex items-center justify-center shadow-lg">
                    <span className="text-lg font-bold text-white">封</span>
                </div>
                <div>
                    <span className="headline-small block">封解Box</span>
                </div>
            </div>

            {/* メインナビゲーション */}
            <nav className="flex-1 px-3 py-5 space-y-1">
                {navigation.map((item) => {
                    const isActive = pathname === item.href;
                    return (
                        <Link key={item.name} href={item.href} className="group relative block">
                            <Button
                                variant="light"
                                className="w-full justify-start gap-3 h-12 shape-full state-layer relative overflow-hidden"
                                aria-current={isActive ? "page" : undefined}
                            >
                                <div className="relative z-10 flex items-center gap-3">
                                    {/* Icon */}
                                    <div className={`transition-colors duration-200 ${isActive ? "text-[var(--md-sys-color-on-primary)]" : "text-[var(--md-sys-color-on-surface-variant)] group-hover:text-[var(--md-sys-color-primary)]"}`}>
                                        <item.icon className="w-5 h-5" />
                                    </div>
                                    <span className={`font-medium tracking-wide transition-colors duration-200 ${isActive ? "text-[var(--md-sys-color-on-primary)] label-large" : "text-[var(--md-sys-color-on-surface-variant)] label-large group-hover:text-[var(--md-sys-color-on-surface)]"}`}>
                                        {item.name}
                                    </span>
                                </div>

                                {/* Active Background - High Contrast Primary */}
                                {isActive && (
                                    <div className="absolute inset-0 bg-[var(--md-sys-color-primary)] shadow-md z-0 rounded-full" />
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
            <div className="px-3 pb-3 space-y-1">
                {bottomNavigation.map((item) => {
                    const isActive = pathname === item.href;
                    return (
                        <Link key={item.name} href={item.href} className="group relative block">
                            <Button
                                variant="light"
                                className="w-full justify-start gap-3 h-12 shape-full state-layer relative overflow-hidden"
                                aria-current={isActive ? "page" : undefined}
                            >
                                <div className="relative z-10 flex items-center gap-3">
                                    <div className={`transition-colors duration-200 ${isActive ? "text-[var(--md-sys-color-on-primary)]" : "text-[var(--md-sys-color-on-surface-variant)] group-hover:text-[var(--md-sys-color-primary)]"}`}>
                                        <item.icon className="w-5 h-5" />
                                    </div>
                                    <span className={`font-medium tracking-wide transition-colors duration-200 ${isActive ? "text-[var(--md-sys-color-on-primary)] label-large" : "text-[var(--md-sys-color-on-surface-variant)] label-large group-hover:text-[var(--md-sys-color-on-surface)]"}`}>
                                        {item.name}
                                    </span>
                                </div>

                                {/* Active Background */}
                                {isActive && (
                                    <div className="absolute inset-0 bg-[var(--md-sys-color-primary)] shadow-md z-0 rounded-full" />
                                )}

                                {/* Hover State Layer */}
                                {!isActive && (
                                    <div className="absolute inset-0 rounded-full bg-[var(--md-sys-color-on-surface)] opacity-0 group-hover:opacity-[0.08] transition-opacity duration-200" />
                                )}
                            </Button>
                        </Link>
                    );
                })}
            </div>

            {/* ユーザー情報 - M3 Surface Container High */}
            <div className="px-3 pb-4 border-t border-[var(--md-sys-color-outline-variant)] pt-4">
                <Tooltip content="プロフィール">
                    <div className="flex items-center gap-3 p-3 shape-lg surface-container-high hover:surface-container-highest cursor-pointer transition-colors">
                        <Avatar
                            size="sm"
                            name={displayName[0]}
                            src={userImage || undefined}
                            classNames={{
                                base: "bg-gradient-to-br from-primary to-secondary ring-2 ring-[var(--md-sys-color-outline-variant)]",
                            }}
                        />
                        <div className="flex-1 min-w-0">
                            <p className="title-medium truncate">
                                {displayName}
                            </p>
                            <span className={cn("inline-block px-2 py-0.5 text-xs mt-1", roleBadgeClass)}>
                                {isLoggedIn ? roleLabel : "未ログイン"}
                            </span>
                        </div>
                    </div>
                </Tooltip>
            </div>
        </aside>
    );
}

// アイコンコンポーネント
function HomeIcon({ className }: { className?: string }) {
    return (
        <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
        </svg>
    );
}

function KitchenIcon({ className }: { className?: string }) {
    return (
        <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
        </svg>
    );
}

function BookIcon({ className }: { className?: string }) {
    return (
        <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
        </svg>
    );
}

function ToolsIcon({ className }: { className?: string }) {
    return (
        <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
        </svg>
    );
}

function SettingsIcon({ className }: { className?: string }) {
    return (
        <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
        </svg>
    );
}
