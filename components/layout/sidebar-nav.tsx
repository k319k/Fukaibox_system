"use client";

import { Button, Tooltip, Divider } from "@heroui/react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, ChefHat, Book, Wrench, Settings, Users, Code, Shield } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useSidebar } from "./sidebar";

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

const gichoNavigation = [
    { name: "DevStudio", href: "/dev-studio", icon: Code },
    { name: "AdminPanel", href: "/admin", icon: Shield },
];

interface SidebarNavProps {
    items: typeof navigation;
    userRole?: string;
}

function NavItem({ item }: { item: typeof navigation[0] }) {
    const pathname = usePathname();
    const { isCollapsed } = useSidebar();
    const isActive = pathname === item.href;

    const button = (
        <Link href={item.href} className="group relative block">
            <motion.div whileTap={{ scale: 0.95 }}>
                <Button
                    variant="light"
                    isIconOnly={isCollapsed}
                    className={`
                        w-full h-14 rounded-full relative overflow-hidden
                        flex items-center justify-center
                        ${isCollapsed ? "" : "justify-start gap-4 px-6"}
                        ${isActive
                            ? "bg-[#ffdad5] text-[#73342b]"
                            : "text-[var(--md-sys-color-on-surface-variant)] hover:bg-[var(--md-sys-color-surface-container-high)]"
                        }
                    `}
                    aria-current={isActive ? "page" : undefined}
                >
                    <item.icon
                        strokeWidth={1.5}
                        className={`w-5 h-5 shrink-0 ${isActive ? "text-[#73342b]" : ""}`}
                    />
                    <AnimatePresence>
                        {!isCollapsed && (
                            <motion.span
                                initial={{ opacity: 0, width: 0 }}
                                animate={{ opacity: 1, width: "auto" }}
                                exit={{ opacity: 0, width: 0 }}
                                className="font-semibold tracking-tight whitespace-nowrap overflow-hidden"
                            >
                                {item.name}
                            </motion.span>
                        )}
                    </AnimatePresence>
                </Button>
            </motion.div>
        </Link>
    );

    // Show tooltip when collapsed
    if (isCollapsed) {
        return (
            <Tooltip content={item.name} placement="right">
                {button}
            </Tooltip>
        );
    }

    return button;
}

export function SidebarNav({ items, userRole }: SidebarNavProps) {
    const { isCollapsed } = useSidebar();
    const isGicho = userRole === "gicho";

    return (
        <nav className={`flex-1 py-6 space-y-1 ${isCollapsed ? "px-2" : "px-4"}`}>
            {items.map((item) => (
                <NavItem key={item.name} item={item} />
            ))}

            {/* 儀長専用ナビゲーション */}
            {isGicho && (
                <>
                    <Divider className="my-4 bg-[var(--md-sys-color-outline-variant)]/30" />
                    <AnimatePresence>
                        {!isCollapsed && (
                            <motion.p
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                                className="text-xs font-medium text-[var(--md-sys-color-on-surface-variant)] px-6 py-2"
                            >
                                儀長専用
                            </motion.p>
                        )}
                    </AnimatePresence>
                    {gichoNavigation.map((item) => (
                        <NavItem key={item.name} item={item} />
                    ))}
                </>
            )}
        </nav>
    );
}

export function SidebarBottomNav() {
    const { isCollapsed } = useSidebar();
    return (
        <div className={`pb-4 space-y-1 ${isCollapsed ? "px-2" : "px-4"}`}>
            {bottomNavigation.map((item) => (
                <NavItem key={item.name} item={item} />
            ))}
        </div>
    );
}

export { navigation };
