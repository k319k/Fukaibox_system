"use client";

import { ReactNode } from "react";
import { Sidebar } from "./sidebar";
import { useSidebar, SidebarProvider } from "./sidebar-provider";
import { Header } from "./header";
import { cn } from "@/lib/utils";

interface MainLayoutContentProps {
    children: ReactNode;
}

function MainContent({ children }: MainLayoutContentProps) {
    const { isCollapsed } = useSidebar();

    return (
        <div className={cn(
            "flex flex-col min-h-screen transition-all duration-300 ease-out",
            // Mobile: デフォルトはマージンなし
            "ml-0",
            // Desktop: 動的マージン
            isCollapsed ? "md:ml-20" : "md:ml-64"
        )}>
            <Header />
            <main className="flex-1 p-6">
                {children}
            </main>
        </div>
    );
}

interface MainLayoutClientProps {
    children: ReactNode;
    userRole?: string;
    userName?: string;
    userImage?: string | null;
}

export function MainLayoutClient({ children, userRole, userName, userImage }: MainLayoutClientProps) {
    return (
        <SidebarProvider>
            <div className="min-h-screen">
                <Sidebar userRole={userRole} userName={userName} userImage={userImage} />
                <MainContent>
                    {children}
                </MainContent>
            </div>
        </SidebarProvider>
    );
}
