"use client";

import { Button, Tooltip, Divider } from "antd";
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

    // Use CSS classes defined in globals.css for M3 Styling
    // nav-item-active handles background and text color
    const activeClass = "nav-item-active";
    const inactiveClass = "nav-item-inactive";

    const button = (
        <Link href={item.href} className="group relative block my-1">
            <motion.div whileTap={{ scale: 0.95 }}>
                <Button
                    type="text"
                    className={`
                        w-full h-14 relative overflow-hidden
                        flex items-center justify-center border-none
                        ${isCollapsed ? "" : "justify-start gap-4 px-6"}
                        ${isActive ? activeClass : inactiveClass}
                    `}
                    aria-current={isActive ? "page" : undefined}
                >
                    <item.icon
                        strokeWidth={isActive ? 2.5 : 1.5}
                        className={`w-6 h-6 shrink-0 transition-transform duration-200 ${isActive ? "scale-105" : "scale-100"}`}
                    />
                    <AnimatePresence>
                        {!isCollapsed && (
                            <motion.span
                                initial={{ opacity: 0, width: 0 }}
                                animate={{ opacity: 1, width: "auto" }}
                                exit={{ opacity: 0, width: 0 }}
                                className="font-semibold tracking-tight whitespace-nowrap overflow-hidden text-base ml-2"
                            >
                                {item.name}
                            </motion.span>
                        )}
                    </AnimatePresence>
                </Button>
            </motion.div>
        </Link>
    );

    if (isCollapsed) {
        return (
            <Tooltip title={item.name} placement="right" color="var(--md-sys-color-inverse-surface)">
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

            {isGicho && (
                <>
                    <Divider className="my-4 border-t border-[var(--md-sys-color-outline-variant)] opacity-50" />
                    <AnimatePresence>
                        {!isCollapsed && (
                            <motion.p
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                                className="text-xs font-bold text-[var(--md-sys-color-on-surface-variant)] px-6 py-2 uppercase tracking-wider"
                            >
                                Admin Controls
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
            <Divider className="my-2 border-t border-[var(--md-sys-color-outline-variant)] opacity-50" />
            {bottomNavigation.map((item) => (
                <NavItem key={item.name} item={item} />
            ))}
        </div>
    );
}

export { navigation };
