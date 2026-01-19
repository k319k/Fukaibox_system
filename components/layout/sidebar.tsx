"use client";

import { Button } from "@heroui/react";
import { useState, useEffect } from "react";
import { usePathname } from "next/navigation";
import { Menu, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { SidebarNav, SidebarBottomNav, navigation } from "./sidebar-nav";
import { SidebarUser } from "./sidebar-user";

interface SidebarProps {
    userRole?: string;
    userName?: string;
    userImage?: string | null;
}

function SidebarLogo({ onClose }: { onClose?: () => void }) {
    return (
        <div className="p-6 flex items-center justify-between gap-4">
            <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-[var(--md-sys-color-primary-container)] rounded-[16px] flex items-center justify-center">
                    <span className="text-xl font-extrabold text-[var(--md-sys-color-on-primary-container)] tracking-tight">封</span>
                </div>
                <span className="text-2xl font-bold tracking-tight text-[var(--md-sys-color-on-surface)]">封解Box</span>
            </div>
            {onClose && (
                <Button isIconOnly variant="light" className="md:hidden rounded-full" onPress={onClose}>
                    <X strokeWidth={1.5} className="w-5 h-5" />
                </Button>
            )}
        </div>
    );
}

export function Sidebar({ userRole = "guest", userName, userImage }: SidebarProps) {
    const pathname = usePathname();
    const [isOpen, setIsOpen] = useState(false);

    useEffect(() => {
        const timer = setTimeout(() => setIsOpen(false), 0);
        return () => clearTimeout(timer);
    }, [pathname]);

    useEffect(() => {
        document.body.style.overflow = isOpen ? 'hidden' : '';
        return () => { document.body.style.overflow = ''; };
    }, [isOpen]);

    return (
        <>
            {/* Hamburger Menu - Mobile */}
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

            {/* Sidebar Container */}
            <aside className={cn(
                "fixed left-0 top-0 h-screen h-dvh w-72 md:w-64 flex flex-col z-50",
                "bg-[var(--md-sys-color-sidebar)] border-r border-[var(--md-sys-color-outline-variant)]/15",
                "transition-transform duration-300 ease-out",
                isOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"
            )}>
                <SidebarLogo onClose={() => setIsOpen(false)} />
                <SidebarNav items={navigation} />
                <SidebarBottomNav />
                <SidebarUser userName={userName} userImage={userImage} userRole={userRole} />
            </aside>
        </>
    );
}
