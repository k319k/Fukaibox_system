"use client";

import { usePathname } from "next/navigation";

// ページタイトルのマッピング
const pageTitles: Record<string, string> = {
    "/": "ホーム",
    "/kitchen": "台所",
    "/dictionary": "界域百科事典",
    "/tools": "封解Box Tools",
    "/settings": "設定",
};

export function Header() {
    const pathname = usePathname();
    const title = pageTitles[pathname] || "封解Box";

    return (
        <header className="h-14 md:h-16 flex items-center px-6 md:px-8 pl-16 md:pl-8 bg-[var(--md-sys-color-surface)]/98 backdrop-blur-xl border-b border-[var(--md-sys-color-outline-variant)]/15">
            <h1 className="title-large md:headline-small text-[var(--md-sys-color-on-surface)] font-extrabold tracking-tight">
                {title}
            </h1>
        </header>
    );
}
