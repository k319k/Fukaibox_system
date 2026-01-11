/**
 * HeroUI カスタム設定
 * 封解Boxのブランドカラーとテーマを定義
 * 
 * このファイルはTailwind CSSの拡張設定として使用します
 */

export const heroColors = {
    // 封解Box プライマリカラー
    primary: {
        50: "#eef2ff",
        100: "#e0e7ff",
        200: "#c7d2fe",
        300: "#a5b4fc",
        400: "#818cf8",
        500: "#6366f1",
        600: "#4f46e5",
        700: "#4338ca",
        800: "#3730a3",
        900: "#312e81",
        DEFAULT: "#6366f1",
        foreground: "#ffffff",
    },
    // 封解Box セカンダリカラー
    secondary: {
        50: "#fdf2f8",
        100: "#fce7f3",
        200: "#fbcfe8",
        300: "#f9a8d4",
        400: "#f472b6",
        500: "#ec4899",
        600: "#db2777",
        700: "#be185d",
        800: "#9d174d",
        900: "#831843",
        DEFAULT: "#ec4899",
        foreground: "#ffffff",
    },
    // ロール別カラー
    gicho: {
        DEFAULT: "#fbbf24",
        foreground: "#1a1a2e",
    },
    meiyoGiin: {
        DEFAULT: "#a78bfa",
        foreground: "#ffffff",
    },
    giin: {
        DEFAULT: "#34d399",
        foreground: "#1a1a2e",
    },
    guest: {
        DEFAULT: "#9ca3af",
        foreground: "#ffffff",
    },
};

export const heroRadius = {
    small: "8px",
    medium: "12px",
    large: "16px",
};
