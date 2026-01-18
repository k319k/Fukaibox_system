"use client";

import { Button, Avatar, Dropdown, DropdownTrigger, DropdownMenu, DropdownItem } from "@heroui/react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, useEffect } from "react";
import { cn } from "@/lib/utils";
import { Home, ChefHat, Book, Wrench, Settings, Menu, X, LogIn, LogOut, Users } from "lucide-react";
import { signOut } from "@/lib/auth-client";

const navigation = [
    { name: "ホーム", href: "/", icon: Home },
    { name: "儀員名簿", href: "/users", icon: Users },
    { name: "炊事場", href: "/cooking", icon: ChefHat },
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
    const [isOpen, setIsOpen] = useState(false);

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

    // Close sidebar on route change - wrapped in setTimeout to avoid cascading renders
    useEffect(() => {
        const timer = setTimeout(() => setIsOpen(false), 0);
        return () => clearTimeout(timer);
    }, [pathname]);

    // Prevent body scroll when sidebar is open on mobile
    useEffect(() => {
        if (isOpen) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = '';
        }
        return () => {
            document.body.style.overflow = '';
        };
    }, [isOpen]);

    const sidebarContent = (
        <>
            {/* ロゴ - M3 Headline Style */}
            <div className="p-5 md:p-6 flex items-center justify-between gap-4">
                <div className="flex items-center gap-3 md:gap-4">
                    <div className="w-10 h-10 md:w-12 md:h-12 bg-[var(--md-sys-color-primary-container)] rounded-xl md:rounded-2xl flex items-center justify-center">
                        <span className="text-lg md:text-xl font-extrabold text-[var(--md-sys-color-on-primary-container)] tracking-tight">封</span>
                    </div>
                    <div>
                        <span className="text-lg md:headline-small block tracking-tight font-extrabold text-[var(--md-sys-color-on-surface)]">封解Box</span>
                    </div>
                </div>
                {/* Close button - Mobile only */}
                <Button
                    isIconOnly
                    variant="light"
                    className="md:hidden rounded-full"
                    onPress={() => setIsOpen(false)}
                >
                    <X strokeWidth={1.5} className="w-5 h-5" />
                </Button>
            </div>

            {/* メインナビゲーション */}
            <nav className="flex-1 px-3 md:px-4 py-4 md:py-6 space-y-1">
                {navigation.map((item) => {
                    const isActive = pathname === item.href;
                    return (
                        <Link key={item.name} href={item.href} className="group relative block">
                            <Button
                                variant="light"
                                className="w-full justify-start gap-3 md:gap-4 h-12 md:h-14 rounded-full relative overflow-hidden"
                                aria-current={isActive ? "page" : undefined}
                            >
                                <div className="relative z-10 flex items-center gap-3 md:gap-4">
                                    <item.icon
                                        strokeWidth={1.5}
                                        className={`w-5 h-5 transition-colors duration-200 ${isActive ? "text-[var(--md-sys-color-on-primary-container)]" : "text-[var(--md-sys-color-on-surface-variant)] group-hover:text-[var(--md-sys-color-primary)]"}`}
                                    />
                                    <span className={`font-semibold tracking-tight transition-colors duration-200 ${isActive ? "text-[var(--md-sys-color-on-primary-container)]" : "text-[var(--md-sys-color-on-surface-variant)] group-hover:text-[var(--md-sys-color-on-surface)]"}`}>
                                        {item.name}
                                    </span>
                                </div>

                                {/* Active Background - M3 Primary Container */}
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
            <div className="px-3 md:px-4 pb-3 md:pb-4 space-y-1">
                {bottomNavigation.map((item) => {
                    const isActive = pathname === item.href;
                    return (
                        <Link key={item.name} href={item.href} className="group relative block">
                            <Button
                                variant="light"
                                className="w-full justify-start gap-3 md:gap-4 h-12 md:h-14 rounded-full relative overflow-hidden"
                                aria-current={isActive ? "page" : undefined}
                            >
                                <div className="relative z-10 flex items-center gap-3 md:gap-4">
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
            <div className="px-3 md:px-4 pb-4 md:pb-6">
                <Dropdown placement="top-start" radius="lg">
                    <DropdownTrigger>
                        <div className="flex items-center gap-3 md:gap-4 p-3 md:p-4 rounded-2xl bg-[var(--md-sys-color-surface-container)]/80 hover:bg-[var(--md-sys-color-surface-container-high)] cursor-pointer transition-all duration-200">
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
                    </DropdownTrigger>
                    <DropdownMenu aria-label="ユーザーメニュー">
                        {isLoggedIn ? (
                            <DropdownItem
                                key="logout"
                                color="danger"
                                startContent={<LogOut className="w-4 h-4" />}
                                onPress={() => signOut()}
                            >
                                ログアウト
                            </DropdownItem>
                        ) : (
                            <DropdownItem
                                key="login"
                                color="primary"
                                startContent={<LogIn className="w-4 h-4" />}
                                href="/login"
                            >
                                ログイン
                            </DropdownItem>
                        )}
                    </DropdownMenu>
                </Dropdown>
            </div>
        </>
    );

    return (
        <>
            {/* Hamburger Menu Button - Mobile Only */}
            <Button
                isIconOnly
                variant="light"
                className="fixed top-4 left-4 z-50 md:hidden rounded-full bg-[var(--md-sys-color-surface-container-lowest)] shadow-sm"
                onPress={() => setIsOpen(true)}
            >
                <Menu strokeWidth={1.5} className="w-5 h-5" />
            </Button>

            {/* Mobile Overlay */}
            {isOpen && (
                <div
                    className="fixed inset-0 bg-black/30 backdrop-blur-sm z-40 md:hidden"
                    onClick={() => setIsOpen(false)}
                />
            )}

            {/* Sidebar - Desktop: Always visible, Mobile: Drawer */}
            <aside className={cn(
                "fixed left-0 top-0 h-screen h-dvh w-72 md:w-64 flex flex-col z-50 bg-[var(--md-sys-color-sidebar)] border-r border-[var(--md-sys-color-outline-variant)]/15 transition-transform duration-300 ease-out",
                // Mobile: slide in/out
                isOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"
            )}>
                {sidebarContent}
            </aside>
        </>
    );
}
