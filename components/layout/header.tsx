"use client";

import { usePathname } from "next/navigation";

const pageTitles: Record<string, string> = {
    "/": "ホーム",
    "/cooking": "炊事場",
    "/dictionary": "界域百科事典",
    "/tools": "封解Box Tools",
    "/settings": "設定",
    "/users": "儀員名簿",
};

export function Header() {
    const pathname = usePathname();
    const title = pageTitles[pathname] || "封解Box";

    return (
        <header className="h-16 flex items-center px-8 pl-16 md:pl-8 bg-background/70 backdrop-blur-xl border-none">
            <h1 className="text-2xl font-bold tracking-tight text-[var(--md-sys-color-on-surface)]">
                {title}
            </h1>
        </header>
    );
}
