import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

/**
 * Tailwind CSSクラスをマージするユーティリティ
 */
export function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}

/**
 * ランダムIDを生成
 */
export function generateId(): string {
    return crypto.randomUUID();
}

/**
 * 日付をフォーマット
 */
export function formatDate(date: Date): string {
    return new Intl.DateTimeFormat("ja-JP", {
        year: "numeric",
        month: "long",
        day: "numeric",
    }).format(date);
}
