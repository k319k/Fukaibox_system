"use client";

import { ConfigProvider, App } from "antd";
import jaJP from "antd/locale/ja_JP";
import { AntdRegistry } from '@ant-design/nextjs-registry';

// M3カラーパレットをAnt Designテーマに変換
const theme = {
    token: {
        colorPrimary: "#73342b",
        colorSuccess: "#10200a",
        colorWarning: "#564419",
        colorError: "#BA1A1A",
        colorInfo: "#73342b",
        colorBgContainer: "#fff8f6",
        colorBgElevated: "#ffffff",
        colorBgLayout: "#fff8f6",
        colorBorder: "#CCC6B5",
        colorBorderSecondary: "#f5e0db",
        borderRadius: 16,
        borderRadiusLG: 20,
        borderRadiusSM: 8,
        fontFamily: "'Inter', 'Noto Sans JP', sans-serif",
    },
    components: {
        Button: {
            borderRadius: 9999,
            controlHeight: 40,
            controlHeightLG: 48,
            controlHeightSM: 32,
        },
        Card: {
            borderRadiusLG: 28,
        },
        Modal: {
            borderRadiusLG: 28,
        },
        Input: {
            borderRadius: 16,
            controlHeight: 48,
        },
        Select: {
            borderRadius: 16,
            controlHeight: 48,
        },
        Tag: {
            borderRadiusSM: 9999,
        },
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
