/**
 * HeroUI カスタム設定
 * Design Definition Document Ver 12.0 準拠
 */

export const heroColors = {
    // Primary (Carmine Red) - Design Definition Ver 12.0
    primary: {
        50: "#fff8f6",
        100: "#ffdad5",  // Primary Container
        200: "#ffb3ac",
        300: "#ff8a80",
        400: "#b3424a",
        500: "#73342b",  // On Primary Container
        600: "#5a1d1d",
        700: "#410000",
        800: "#300004",
        900: "#1f0002",
        DEFAULT: "#73342b",
        foreground: "#ffdad5",
    },
    // Warning (Tertiary - Brown/Yellow)
    warning: {
        50: "#fff8e1",
        100: "#fbe7a6",  // Warning Container  
        200: "#f5d67a",
        300: "#eeab3d",
        400: "#c18200",
        500: "#564419",  // On Warning Container
        600: "#453200",
        700: "#352500",
        800: "#271a00",
        900: "#1a1000",
        DEFAULT: "#564419",
        foreground: "#fbe7a6",
    },
    // Danger (Error)
    danger: {
        50: "#fff5f5",
        100: "#ffdad6",  // Danger Container
        200: "#ffb4ab",
        300: "#ff897d",
        400: "#de3730",
        500: "#93000a",  // On Danger Container
        600: "#7e0007",
        700: "#5c0004",
        800: "#410002",
        900: "#2d0001",
        DEFAULT: "#93000a",
        foreground: "#ffdad6",
    },
    // Success (Green)
    success: {
        50: "#f0fdf4",
        100: "#d7f0cb",  // Success Container
        200: "#b3e4a3",
        300: "#82d86a",
        400: "#4caf50",
        500: "#10200a",  // On Success Container
        600: "#0d1a08",
        700: "#0a1305",
        800: "#060d03",
        900: "#030601",
        DEFAULT: "#10200a",
        foreground: "#d7f0cb",
    },
    // ロール別カラー (Ver 12.0)
    gicho: {
        DEFAULT: "#73342b",
        foreground: "#ffdad5",
    },
    meiyoGiin: {
        DEFAULT: "#564419",
        foreground: "#fbe7a6",
    },
    giin: {
        DEFAULT: "#10200a",
        foreground: "#d7f0cb",
    },
    guest: {
        DEFAULT: "#6b7280",
        foreground: "#f3f4f6",
    },
};

export const heroRadius = {
    small: "16px",   // Input, Alert, Avatar
    medium: "20px",  // Card (Sub)
    large: "28px",   // Card (Main), Modal
};
