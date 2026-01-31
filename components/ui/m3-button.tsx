"use client";

import { ButtonHTMLAttributes, forwardRef } from "react";
import { cn } from "@/lib/utils";

interface M3ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
    variant?: "filled" | "tonal" | "outlined" | "text" | "elevated";
    icon?: React.ReactNode;
}

export const M3Button = forwardRef<HTMLButtonElement, M3ButtonProps>(
    ({ className, variant = "filled", icon, children, ...props }, ref) => {

        // Base styles mimicking M3 State Layer and shape
        const baseStyles = "relative inline-flex items-center justify-center gap-2 px-6 h-10 text-sm font-medium transition-all duration-200 disabled:opacity-50 disabled:pointer-events-none rounded-[var(--radius-full)] overflow-hidden";

        // Variants mapping to globals.css variables
        const variants = {
            filled: "bg-[var(--md-sys-color-primary)] text-[var(--md-sys-color-on-primary)] hover:opacity-90 hover:shadow-md active:opacity-100",
            tonal: "bg-[var(--md-sys-color-secondary-container)] text-[var(--md-sys-color-on-secondary-container)] hover:bg-[var(--md-sys-color-secondary-container)]/90 hover:shadow-sm",
            outlined: "border border-[var(--md-sys-color-outline)] text-[var(--md-sys-color-primary)] bg-transparent hover:bg-[var(--md-sys-color-primary)]/10",
            text: "bg-transparent text-[var(--md-sys-color-primary)] hover:bg-[var(--md-sys-color-primary)]/10 px-3",
            elevated: "bg-[var(--md-sys-color-surface-container-low)] text-[var(--md-sys-color-primary)] shadow-sm hover:shadow-md hover:bg-[var(--md-sys-color-surface-container)]"
        };

        return (
            <button
                ref={ref}
                className={cn(baseStyles, variants[variant], className)}
                {...props}
            >
                {/* State Layer (Ripple effect could be added here) */}
                {icon && <span className="text-lg">{icon}</span>}
                {children}
            </button>
        );
    }
);
M3Button.displayName = "M3Button";
