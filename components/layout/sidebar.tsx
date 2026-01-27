"use client";

import { Button, Tooltip } from "antd";
import { useState, useEffect } from "react";
import { usePathname } from "next/navigation";
import { Icon } from "@iconify/react";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";
import { SidebarNav, SidebarBottomNav, navigation } from "./sidebar-nav";
import { SidebarUser } from "./sidebar-user";
import { useSidebar } from "./sidebar-provider";

// Re-export for backwards compatibility
export { useSidebar } from "./sidebar-provider";

interface SidebarProps {
    userRole?: string;
    userName?: string;
    userImage?: string | null;
}

function SidebarLogo({ isCollapsed, onClose, onToggleCollapse }: {
    isCollapsed: boolean;
    onClose?: () => void;
    onToggleCollapse?: () => void;
}) {
    return (
        <div className={cn(
            "p-6 flex items-center",
            // Mobile: justify-between (Logo ... Close)
            // Desktop Expanded: justify-start (Toggle ... Logo)
            // Desktop Collapsed: justify-center (Toggle)
            isCollapsed ? "justify-center" : "justify-between md:justify-start md:gap-4"
        )}>
            {/* Desktop collapse toggle - First on Desktop */}
            {onToggleCollapse && (
                <motion.div whileTap={{ scale: 0.95 }} className="hidden md:block">
                    <Tooltip title={isCollapsed ? "展開" : "折りたたむ"} placement="right">
                        <Button
                            type="text"
                            shape="circle"
                            className="flex items-center justify-center"
                            onClick={onToggleCollapse}
                            icon={isCollapsed ? (
                                <Icon icon="material-symbols:keyboard-double-arrow-right" className="w-5 h-5" />
                            ) : (
                                <Icon icon="material-symbols:keyboard-double-arrow-left" className="w-5 h-5" />
                            )}
                        />
                    </Tooltip>
                </motion.div>
            )}

            <div className={cn(
                "flex items-center gap-4",
                // Hide logo group on desktop when collapsed
                isCollapsed && "md:hidden"
            )}>
                <div className="w-12 h-12 flex items-center justify-center shrink-0">
                    <img src="/icon.avif" alt="Logo" className="w-full h-full object-contain rounded-[12px]" />
                </div>
                <AnimatePresence>
                    {!isCollapsed && (
                        <motion.span
                            initial={{ opacity: 0, width: 0 }}
                            animate={{ opacity: 1, width: "auto" }}
                            exit={{ opacity: 0, width: 0 }}
                            className="text-2xl font-bold tracking-tight text-[var(--md-sys-color-on-surface)] whitespace-nowrap overflow-hidden"
                        >
                            封解Box
                        </motion.span>
                    )}
                </AnimatePresence>
            </div>

            {/* Mobile close button - Last on Mobile */}
            {onClose && !isCollapsed && (
                <motion.div whileTap={{ scale: 0.95 }}>
                    <Button
                        type="text"
                        shape="circle"
                        className="md:hidden flex items-center justify-center"
                        onClick={onClose}
                        icon={<Icon icon="material-symbols:close" className="w-5 h-5" />}
                    />
                </motion.div>
            )}
        </div>
    );
}

export function Sidebar({ userRole = "guest", userName, userImage }: SidebarProps) {
    const pathname = usePathname();
    const [isMobileOpen, setIsMobileOpen] = useState(false);
    const { isCollapsed, setIsCollapsed } = useSidebar();

    // Close mobile sidebar on route change
    useEffect(() => {
        setIsMobileOpen(false);
    }, [pathname]);

    // Prevent body scroll when mobile sidebar is open
    useEffect(() => {
        document.body.style.overflow = isMobileOpen ? 'hidden' : '';
        return () => { document.body.style.overflow = ''; };
    }, [isMobileOpen]);

    const toggleCollapse = () => setIsCollapsed(!isCollapsed);

    return (
        <>
            {/* Mobile hamburger button */}
            <motion.div whileTap={{ scale: 0.95 }} className="md:hidden">
                <Button
                    type="text"
                    shape="circle"
                    className="fixed top-4 left-4 z-50 bg-[var(--md-sys-color-surface-container-lowest)] shadow-sm flex items-center justify-center"
                    onClick={() => setIsMobileOpen(true)}
                    icon={<Icon icon="material-symbols:menu" className="w-5 h-5" />}
                />
            </motion.div>

            {/* Mobile backdrop */}
            <AnimatePresence>
                {isMobileOpen && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 bg-black/30 backdrop-blur-sm z-40 md:hidden"
                        onClick={() => setIsMobileOpen(false)}
                    />
                )}
            </AnimatePresence>

            {/* Sidebar */}
            <aside className={cn(
                "fixed left-0 top-0 h-screen h-dvh flex flex-col z-50",
                "bg-[var(--md-sys-color-surface-container)] rounded-r-[28px]",
                "transition-all duration-300 ease-out",
                // Mobile: slide in/out
                isMobileOpen ? "translate-x-0" : "-translate-x-full",
                // Desktop: always visible, dynamic width
                "md:translate-x-0",
                isCollapsed ? "md:w-20" : "md:w-64",
                // Mobile width
                "w-72"
            )}>
                <SidebarLogo
                    isCollapsed={isCollapsed}
                    onClose={() => setIsMobileOpen(false)}
                    onToggleCollapse={toggleCollapse}
                />
                <SidebarNav items={navigation} userRole={userRole} />
                <SidebarBottomNav />
                <SidebarUser userName={userName} userImage={userImage} userRole={userRole} />
            </aside>
        </>
    );
}
