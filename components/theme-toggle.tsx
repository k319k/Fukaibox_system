"use client";

import { MoonOutlined, SunOutlined } from "@ant-design/icons";
import { useTheme } from "next-themes";
import { Button } from "antd";
import { useEffect, useState } from "react";

export function ThemeToggle() {
    const { theme, setTheme } = useTheme();
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    if (!mounted) {
        return null;
    }

    return (
        <Button
            type="text"
            shape="circle"
            onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
            className="text-[var(--md-sys-color-on-surface)]"
        >
            {theme === "dark" ? <SunOutlined /> : <MoonOutlined />}
            <span className="sr-only">Toggle theme</span>
        </Button>
    );
}
