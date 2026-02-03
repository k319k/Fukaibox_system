"use client";

import { ConfigProvider, App, theme as antTheme } from "antd";
import jaJP from "antd/locale/ja_JP";
import { AntdRegistry } from '@ant-design/nextjs-registry';
import { ThemeProvider, useTheme } from "next-themes";
import { useEffect, useState } from "react";

// Material Design 3 (M3) Theme Adaptation
const lightTheme = {
    token: {
        // Colors
        colorPrimary: "#73342b", // Primary (Carmine)
        colorSuccess: "#10200a",
        colorWarning: "#564419",
        colorError: "#BA1A1A",
        colorInfo: "#73342b",

        // Surface Colors (M3 Hierarchy)
        colorBgLayout: "#fff8f6",
        colorBgContainer: "#fceae5",
        colorBgElevated: "#fbe7a6",

        // Borders
        colorBorder: "#85736f",
        colorBorderSecondary: "transparent",

        // Typography
        fontFamily: "'Inter', 'Noto Sans JP', sans-serif",
        fontSizeHeading1: 32,
        fontSizeHeading2: 28,
        fontSizeHeading3: 24,
        fontSizeHeading4: 22,

        // Shapes
        borderRadius: 12,
        borderRadiusLG: 16,
        borderRadiusSM: 8,
        borderRadiusXS: 4,

        // Shadows
        boxShadow: "none",
        boxShadowSecondary: "none",
        boxShadowTertiary: "none",

        // Spacing
        marginXS: 4,
        marginSM: 8,
        margin: 16,
        marginMD: 24,
        marginLG: 32,
        paddingXS: 4,
        paddingSM: 8,
        padding: 16,
        paddingMD: 24,
        paddingLG: 32,
    },
    components: {
        Button: {
            borderRadius: 9999,
            controlHeight: 40,
            controlHeightLG: 48,
            controlHeightSM: 32,
            primaryShadow: "none",
            defaultShadow: "none",
            dangerShadow: "none",
        },
        Card: {
            borderRadiusLG: 12,
            boxShadowTertiary: "none",
            colorBorderSecondary: "transparent",
            colorBgContainer: "#fceae5",
            headerbg: "transparent",
        },
        Modal: {
            borderRadiusLG: 28,
            boxShadow: "0px 1px 3px 0px rgba(0, 0, 0, 0.3), 0px 4px 8px 3px rgba(0, 0, 0, 0.15)",
        },
        Input: {
            borderRadius: 4,
            controlHeight: 56,
            activeShadow: "none",
            colorBorder: "#85736f",
        },
        Select: {
            borderRadius: 4,
            controlHeight: 56,
            controlOutline: "none",
            colorBorder: "#85736f",
        },
        Tag: {
            borderRadiusSM: 8,
        },
        Layout: {
            colorBgBody: "#fff8f6",
            colorBgHeader: "#fff8f6",
            colorBgTrigger: "#fff8f6",
        }
    },
};

const darkTheme = {
    algorithm: antTheme.darkAlgorithm,
    token: {
        ...lightTheme.token,
        colorPrimary: "#ffb4a9", // Light Red for dark mode
        colorBgLayout: "#121212", // Jet Black
        colorBgContainer: "#1e1e1e",
        colorBgElevated: "#2c2c2c",
        colorBorder: "#444444",
        colorText: "#e2e2e2",
        colorTextSecondary: "#a0a0a0",
    },
    components: {
        ...lightTheme.components,
        Card: {
            ...lightTheme.components.Card,
            colorBgContainer: "#1e1e1e",
        },
        Layout: {
            colorBgBody: "#121212",
            colorBgHeader: "#121212",
            colorBgTrigger: "#121212",
        }
    }
};

function AntdProvider({ children }: { children: React.ReactNode }) {
    const { theme } = useTheme();
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    if (!mounted) {
        return (
            <ConfigProvider theme={lightTheme} locale={jaJP}>
                <App>{children}</App>
            </ConfigProvider>
        );
    }

    const currentTheme = theme === "dark" ? darkTheme : lightTheme;

    return (
        <ConfigProvider theme={currentTheme} locale={jaJP}>
            <App>{children}</App>
        </ConfigProvider>
    );
}

export function Providers({ children }: { children: React.ReactNode }) {
    return (
        <AntdRegistry>
            <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
                <AntdProvider>
                    {children}
                </AntdProvider>
            </ThemeProvider>
        </AntdRegistry>
    );
}
