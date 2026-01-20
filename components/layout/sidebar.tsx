"use client";

import { Button, Tooltip } from "@heroui/react";
import { useState, useEffect, createContext, useContext } from "react";
import { usePathname } from "next/navigation";
import { Menu, X, ChevronsLeft, ChevronsRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";
import { SidebarNav, SidebarBottomNav, navigation } from "./sidebar-nav";
import { SidebarUser } from "./sidebar-user";

interface SidebarProps {
    userRole?: string;
    userName?: string;
    userImage?: string | null;
}

// Context for collapsed state
interface SidebarContextType {
    isCollapsed: boolean;
}
const SidebarContext = createContext<SidebarContextType>({ isCollapsed: false });
export const useSidebar = () => useContext(SidebarContext);

function SidebarLogo({ isCollapsed, onClose, onToggleCollapse }: {
    isCollapsed: boolean;
    onClose?: () => void;
    onToggleCollapse?: () => void;
}) {
    return (
        <div className={cn(
            "p-6 flex items-center gap-4",
            isCollapsed ? "justify-center" : "justify-between"
        )}>
            <div className={cn(
                "flex items-center gap-4",
                isCollapsed && "justify-center"
            )}>
                <div className="w-12 h-12 bg-[#ffdad5] rounded-[16px] flex items-center justify-center shrink-0">
                    <span className="text-xl font-extrabold text-[#73342b] tracking-tight">封</span>
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

            {/* Mobile close button */}
            {onClose && !isCollapsed && (
                <motion.div whileTap={{ scale: 0.95 }}>
                    <Button isIconOnly variant="light" className="md:hidden rounded-full flex items-center justify-center" onPress={onClose}>
                        <X strokeWidth={1.5} className="w-5 h-5" />
                    </Button>
                </motion.div>
            )}

            {/* Desktop collapse toggle */}
            {onToggleCollapse && (
                <motion.div whileTap={{ scale: 0.95 }} className="hidden md:block">
                    <Tooltip content={isCollapsed ? "展開" : "折りたたむ"} placement="right">
                        <Button
                            isIconOnly
                            variant="light"
                            className="rounded-full flex items-center justify-center"
                            onPress={onToggleCollapse}
                        >
                            {isCollapsed ? (
                                <ChevronsRight strokeWidth={1.5} className="w-5 h-5" />
                            ) : (
                                <ChevronsLeft strokeWidth={1.5} className="w-5 h-5" />
                            )}
                        </Button>
                    </Tooltip>
                </motion.div>
            )}
        </div>
    );
}

export function Sidebar({ userRole = "guest", userName, userImage }: SidebarProps) {
    const pathname = usePathname();
    const [isMobileOpen, setIsMobileOpen] = useState(false);
    const [isCollapsed, setIsCollapsed] = useState(false);

    // Load collapsed state from localStorage on mount
    useEffect(() => {
        const saved = localStorage.getItem("sidebar-collapsed");
        if (saved !== null) {
            setIsCollapsed(saved === "true");
        }
    }, []);

    // Save collapsed state to localStorage
    useEffect(() => {
        localStorage.setItem("sidebar-collapsed", String(isCollapsed));
    }, [isCollapsed]);

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
        <SidebarContext.Provider value={{ isCollapsed }}>
            {/* Mobile hamburger button */}
            <motion.div whileTap={{ scale: 0.95 }} className="md:hidden">
                <Button
                    isIconOnly
                    variant="light"
                    className="fixed top-4 left-4 z-50 rounded-full bg-[var(--md-sys-color-surface-container-lowest)] shadow-sm flex items-center justify-center"
                    onPress={() => setIsMobileOpen(true)}
                >
                    <Menu strokeWidth={1.5} className="w-5 h-5" />
                </Button>
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
                "bg-[#fceae7] rounded-r-[28px]",
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
                <SidebarNav items={navigation} />
                <SidebarBottomNav />
                <SidebarUser userName={userName} userImage={userImage} userRole={userRole} />
            </aside>
        </SidebarContext.Provider>
    );
}
