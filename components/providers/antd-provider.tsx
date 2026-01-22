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
        colorBgContainer: "#ffffff", // Surface Container Lowest (Card default)
        colorBgElevated: "#fceae5",  // Surface Container (Dialogs/Popovers)

        // Borders
        colorBorder: "#CCC6B5",       // Outline
        colorBorderSecondary: "transparent", // Remove default card borders for generic use if needed, but keeping outline is M3 Outlined Card style. 
        // User requested "Filled Card" style (color separation), so we might prefer transparency or specific colored backgrounds.

        // Typography
        fontFamily: "'Inter', 'Noto Sans JP', sans-serif",

        // Shapes (Corner Radius)
        borderRadius: 12,   // Medium (12dp)
        borderRadiusLG: 16, // Large (16dp) - For Cards
        borderRadiusSM: 8,  // Small (8dp)

        // Shadows (Elevation) - 平坦化指示対応
        boxShadow: "none",
        boxShadowSecondary: "none",
        boxShadowTertiary: "none",
    },
    components: {
        Button: {
            borderRadius: 9999, // Full accessible (Pill shape)
            controlHeight: 40,
            controlHeightLG: 48,
            controlHeightSM: 32,
            primaryShadow: "none", // Remove shadow from primary button
        },
        Card: {
            borderRadiusLG: 16, // M3 Card corner
            boxShadowTertiary: "none", // Remove shadow
            colorBorderSecondary: "transparent", // Hide border by default to prefer Filled Card style
        },
        Modal: {
            borderRadiusLG: 28, // Dialogs (Extra Large)
            boxShadow: "0px 8px 24px -6px rgba(0,0,0,0.1)", // Dialogs still need slight separation
        },
        Input: {
            borderRadius: 16, // M3 Text Field (Outlined) is usually 4px, but Search bars are full rounded. Let's keep 16px for friendly look.
            controlHeight: 48, // Taller inputs
            activeShadow: "none",
        },
        Select: {
            borderRadius: 16,
            controlHeight: 48,
            controlOutline: "none",
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
