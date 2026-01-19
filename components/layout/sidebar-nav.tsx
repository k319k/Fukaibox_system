"use client";

import { Button } from "@heroui/react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, ChefHat, Book, Wrench, Settings, Users } from "lucide-react";

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

interface SidebarNavProps {
    items: typeof navigation;
}

function NavItem({ item }: { item: typeof navigation[0] }) {
    const pathname = usePathname();
    const isActive = pathname === item.href;

    return (
        <Link href={item.href} className="group relative block">
            <Button
                variant="light"
                className="w-full justify-start gap-4 h-14 rounded-full relative overflow-hidden"
                aria-current={isActive ? "page" : undefined}
            >
                <div className="relative z-10 flex items-center gap-4">
                    <item.icon
                        strokeWidth={1.5}
                        className={`w-5 h-5 transition-colors duration-200 ${isActive
                                ? "text-[var(--md-sys-color-on-primary-container)]"
                                : "text-[var(--md-sys-color-on-surface-variant)] group-hover:text-[var(--md-sys-color-primary)]"
                            }`}
                    />
                    <span className={`font-semibold tracking-tight transition-colors duration-200 ${isActive
                            ? "text-[var(--md-sys-color-on-primary-container)]"
                            : "text-[var(--md-sys-color-on-surface-variant)] group-hover:text-[var(--md-sys-color-on-surface)]"
                        }`}>
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
}

export function SidebarNav({ items }: SidebarNavProps) {
    return (
        <nav className="flex-1 px-4 py-6 space-y-1">
            {items.map((item) => (
                <NavItem key={item.name} item={item} />
            ))}
        </nav>
    );
}

export function SidebarBottomNav() {
    return (
        <div className="px-4 pb-4 space-y-1">
            {bottomNavigation.map((item) => (
                <NavItem key={item.name} item={item} />
            ))}
        </div>
    );
}

export { navigation };
