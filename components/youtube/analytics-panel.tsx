"use client";

import { Card, Empty } from "antd";

export function AnalyticsPanel() {
    return (
        <div className="p-6">
            <Card
                className="shadow-sm"
                style={{
                    backgroundColor: "var(--md-sys-color-surface-container-lowest)",
                    borderColor: "var(--md-sys-color-outline-variant)",
                }}
            >
                <Empty
                    description={
                        <span className="text-[var(--md-sys-color-on-surface-variant)]">
                            アナリティクス機能は実装中です
                        </span>
                    }
                />
                <div className="mt-4 text-center text-sm text-[var(--md-sys-color-on-surface-variant)]">
                    <p>近日公開予定の機能:</p>
                    <ul className="mt-2 space-y-1">
                        <li>• チャンネル統計（再生回数、視聴時間、登録者増加数）</li>
                        <li>• 動画別パフォーマンスランキング</li>
                        <li>• トレンドグラフ</li>
                    </ul>
                </div>
            </Card>
        </div>
    );
}
