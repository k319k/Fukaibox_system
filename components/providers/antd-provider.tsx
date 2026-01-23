"use client";

import { ConfigProvider, App } from "antd";
import jaJP from "antd/locale/ja_JP";
import { AntdRegistry } from '@ant-design/nextjs-registry';

// Material Design 3 (M3) Theme Adaptation
// Reference: https://m3.material.io/styles/color/the-color-system/tokens
const theme = {
    token: {
        // Colors
        colorPrimary: "#73342b", // Primary (Carmine)
        colorSuccess: "#10200a", // Custom green
        colorWarning: "#564419", // Custom brown/gold
        colorError: "#BA1A1A",   // Error (M3 standard)
        colorInfo: "#73342b",

        // Surface Colors (M3 Hierarchy)
        colorBgLayout: "#fff8f6",    // Surface (Background)
        colorBgContainer: "#fceae5", // Surface Container (M3 default container color)
        colorBgElevated: "#fbe7a6",  // Surface Container (Dialogs/Popovers - slightly different for contrast)

        // Borders - M3 Borderless design mostly, but define for Outlined components
        colorBorder: "#85736f",       // Outline
        colorBorderSecondary: "transparent", // Remove default card borders

        // Typography - Headline vs Body distinction
        fontFamily: "'Inter', 'Noto Sans JP', sans-serif",
        fontSizeHeading1: 32,
        fontSizeHeading2: 28,
        fontSizeHeading3: 24,
        fontSizeHeading4: 22,

        // Shapes (Corner Radius)
        borderRadius: 12,   // M3 Medium (12dp) - Default for many small components
        borderRadiusLG: 16, // M3 Large (16dp) - For Cards
        borderRadiusSM: 8,  // M3 Small (8dp)
        borderRadiusXS: 4,  // M3 Extra Small (4dp)

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
            borderRadius: 9999, // Full accessible (Pill shape)
            controlHeight: 40,
            controlHeightLG: 48,
            controlHeightSM: 32,
            primaryShadow: "none", // Remove shadow from primary button
            defaultShadow: "none",
            dangerShadow: "none",
        },
        Card: {
            borderRadiusLG: 12, // M3 Card corner (Medium)
            boxShadowTertiary: "none", // Remove shadow
            colorBorderSecondary: "transparent", // Hide border
            colorBgContainer: "#fceae5", // Surface Container (Default Card)
            headerbg: "transparent", // Transparent header
        },
        Modal: {
            borderRadiusLG: 28, // Dialogs (Extra Large 28dp)
            boxShadow: "0px 1px 3px 0px rgba(0, 0, 0, 0.3), 0px 4px 8px 3px rgba(0, 0, 0, 0.15)", // Dialogs need slight elevation
        },
        Input: {
            borderRadius: 4, // Text Fields usually have small corners in M3 unless search
            controlHeight: 56, // Tall inputs (M3 spec)
            activeShadow: "none",
            colorBorder: "#85736f", // Outline color
        },
        Select: {
            borderRadius: 4,
            controlHeight: 56,
            controlOutline: "none",
            colorBorder: "#85736f",
        },
        Tag: {
            borderRadiusSM: 8, // Assist Chip style
        },
        Layout: {
            colorBgBody: "#fff8f6",
            colorBgHeader: "#fff8f6",
            colorBgTrigger: "#fff8f6",
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
