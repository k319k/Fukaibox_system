"use client";

import { ConfigProvider, App } from "antd";
import jaJP from "antd/locale/ja_JP";
import { AntdRegistry } from '@ant-design/nextjs-registry';

// Material Design 3 (M3) Theme Adaptation
// Ant Design v5+ supports CSS variables in theme tokens
const theme = {
    token: {
        // Colors - Use CSS variables so they adapt to dark mode automatically
        colorPrimary: "var(--md-sys-color-primary)",
        colorSuccess: "var(--color-kitchen-success-text)",
        colorWarning: "var(--color-kitchen-gold-text)",
        colorError: "var(--color-kitchen-error-text)",
        colorInfo: "var(--md-sys-color-primary)",

        // Surface Colors (M3 Hierarchy) - Use CSS variables
        colorBgLayout: "var(--md-sys-color-surface)",
        colorBgContainer: "var(--md-sys-color-surface-container)",
        colorBgElevated: "var(--md-sys-color-surface-container-low)",

        // Borders
        colorBorder: "var(--md-sys-color-outline)",
        colorBorderSecondary: "transparent",

        // Typography - Headline vs Body distinction
        fontFamily: "'Inter', 'Noto Sans JP', sans-serif",
        fontSizeHeading1: 32,
        fontSizeHeading2: 28,
        fontSizeHeading3: 24,
        fontSizeHeading4: 22,

        // Shapes (Corner Radius)
        borderRadius: 12,
        borderRadiusLG: 16,
        borderRadiusSM: 8,
        borderRadiusXS: 4,

        // Shadows (Elevation) - Remove shadows for flat, color-based hierarchy
        boxShadow: "none",
        boxShadowSecondary: "none",
        boxShadowTertiary: "none",

        // Spacing - 8dp grid base
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
            colorBgContainer: "var(--md-sys-color-surface-container)",
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
            colorBorder: "var(--md-sys-color-outline)",
        },
        Select: {
            borderRadius: 4,
            controlHeight: 56,
            controlOutline: "none",
            colorBorder: "var(--md-sys-color-outline)",
        },
        Tag: {
            borderRadiusSM: 8,
        },
        Layout: {
            colorBgBody: "var(--md-sys-color-surface)",
            colorBgHeader: "var(--md-sys-color-surface)",
            colorBgTrigger: "var(--md-sys-color-surface)",
        }
    },
};

export function Providers({ children }: { children: React.ReactNode }) {
    return (
        <AntdRegistry>
            <ConfigProvider theme={theme} locale={jaJP}>
                <App>{children}</App>
            </ConfigProvider>
        </AntdRegistry>
    );
}
