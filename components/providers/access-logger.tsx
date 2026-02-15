"use client";

import { usePathname } from "next/navigation";
import { useEffect, useRef } from "react";

export function AccessLogger() {
    const pathname = usePathname();
    const lastPathRef = useRef<string | null>(null);

    useEffect(() => {
        // Prevent duplicate logging for same path (React Strict Mode double invocation)
        // But strict mode mounts/unmounts, ref persists? No.
        // Actually pathname changes.

        if (lastPathRef.current === pathname) return;
        lastPathRef.current = pathname;

        const logAccess = async () => {
            try {
                await fetch("/api/log-access", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ path: pathname }),
                });
            } catch (e) {
                // Silent error
            }
        };

        // Small delay to ensure hydration
        const timer = setTimeout(logAccess, 1000);
        return () => clearTimeout(timer);
    }, [pathname]);

    return null;
}
