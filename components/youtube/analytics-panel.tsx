"use client";

import { useMemo, useState, useEffect } from "react";
import {
    AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer
} from "recharts";
import { Card, Statistic, Segmented, Spin, Empty, Table } from "antd";
import type { TableProps } from 'antd';
import { ArrowUpOutlined, ArrowDownOutlined } from "@ant-design/icons";

import { getAdvancedAnalytics } from "@/app/actions/youtube-manager";
import { AnalyticsTableAdvanced } from "./analytics-table-advanced";

interface AnalyticsPanelProps {
    data: any | null; // YouTube Analytics API Response
    loading: boolean;
    period: string; // '7d' | '30d' | '90d'
    onPeriodChange: (val: string) => void;
}

export function AnalyticsPanel({ data, loading, period, onPeriodChange }: AnalyticsPanelProps) {
    const [viewMode, setViewMode] = useState<'dashboard' | 'advanced'>('dashboard');
    const [advancedData, setAdvancedData] = useState<any[]>([]);
    const [advancedLoading, setAdvancedLoading] = useState(false);

    const fetchAdvancedData = async () => {
        setAdvancedLoading(true);
        try {
            const res = await getAdvancedAnalytics();
            if (res.success && res.data) {
                setAdvancedData(res.data);
            }
        } catch (error) {
            console.error(error);
        } finally {
            setAdvancedLoading(false);
        }
    };

    // Load advanced data when tab switched
    useEffect(() => {
        if (viewMode === 'advanced' && advancedData.length === 0) {
            fetchAdvancedData();
        }
    }, [viewMode]);

    const chartData = useMemo(() => {
        if (!data?.rows) return [];
        // headers matches the order in youtube-manager.ts
        return data.rows.map((row: any) => ({
            date: row[0],
            views: row[1],
            watchTime: Math.round(row[2]), // Minutes
            avgViewDuration: row[3],
            avgViewPercentage: row[4],
            subscribersGained: row[5],
            subscribersLost: row[6],
            likes: row[7],
            dislikes: row[8],
            comments: row[9],
            shares: row[10],
            cardClicks: row[11],
            endScreenElementClicks: row[12],
        }));
    }, [data]);

    const totals = useMemo(() => {
        if (!data?.rows) return { views: 0, watchTime: 0 };
        const totalViews = data.rows.reduce((acc: number, row: any) => acc + row[1], 0);
        const totalWatchTime = data.rows.reduce((acc: number, row: any) => acc + row[2], 0);
        return { views: totalViews, watchTime: Math.round(totalWatchTime) }; // Total Minutes
    }, [data]);

    // Early return ONLY if loading. If data is empty, we still might want to show Advanced Tab.
    if (loading) {
        return (
            <Card className="min-h-[400px] flex items-center justify-center">
                <Spin size="large" />
            </Card>
        );
    }

    const isDashboardEmpty = !data || chartData.length === 0;

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h2 className="text-xl font-bold text-[var(--md-sys-color-on-surface)]">チャンネルアナリティクス</h2>
                <Segmented
                    options={[
                        { label: '7日間', value: '7d' },
                        { label: '30日間', value: '30d' },
                        { label: '90日間', value: '90d' },
                    ]}
                    value={period}
                    onChange={onPeriodChange}
                />
            </div>

            <div className="mb-4">
                <Segmented
                    options={[
                        { label: 'ダッシュボード', value: 'dashboard' },
                        { label: '詳細レポート (example.ods)', value: 'advanced' },
                    ]}
                    value={viewMode}
                    onChange={(v: any) => setViewMode(v)}
                    block
                />
            </div>

            {viewMode === 'advanced' ? (
                <AnalyticsTableAdvanced
                    data={advancedData}
                    loading={advancedLoading}
                    onRefresh={fetchAdvancedData}
                />
            ) : (
                <>
                    {isDashboardEmpty ? (
                        <Card className="min-h-[400px] flex flex-col items-center justify-center">
                            <Empty description="データがありません。期間を変更してみてください。" />
                        </Card>
                    ) : (
                        <>

                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                                <Card bordered={false} className="bg-[var(--md-sys-color-surface-container)]">
                                    <Statistic
                                        title="総視聴回数"
                                        value={totals.views}
                                        valueStyle={{ color: 'var(--md-sys-color-primary)' }}
                                        prefix={<ArrowUpOutlined />} // Dummy trend
                                        suffix="回"
                                    />
                                </Card>
                                <Card bordered={false} className="bg-[var(--md-sys-color-surface-container)]">
                                    <Statistic
                                        title="総再生時間"
                                        value={Math.round(totals.watchTime / 60)} // Hours
                                        precision={1}
                                        valueStyle={{ color: 'var(--md-sys-color-tertiary)' }}
                                        suffix="時間"
                                    />
                                </Card>
                            </div>

                            <Card
                                className="w-full bg-[var(--md-sys-color-surface-container-low)] border-none"
                                title="視聴回数推移"
                            >
                                <div className="h-[300px] w-full">
                                    <ResponsiveContainer width="100%" height="100%">
                                        <AreaChart
                                            data={chartData}
                                            margin={{
                                                top: 10,
                                                right: 30,
                                                left: 0,
                                                bottom: 0,
                                            }}
                                        >
                                            <CartesianGrid strokeDasharray="3 3" opacity={0.1} />
                                            <XAxis
                                                dataKey="date"
                                                tick={{ fill: 'var(--md-sys-color-on-surface-variant)', fontSize: 12 }}
                                                tickLine={false}
                                                axisLine={false}
                                                minTickGap={30}
                                            />
                                            <YAxis
                                                tick={{ fill: 'var(--md-sys-color-on-surface-variant)', fontSize: 12 }}
                                                tickLine={false}
                                                axisLine={false}
                                            />
                                            <Tooltip
                                                contentStyle={{
                                                    backgroundColor: 'var(--md-sys-color-surface)',
                                                    borderRadius: '8px',
                                                    border: 'none',
                                                    boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'
                                                }}
                                            />
                                            <Area
                                                type="monotone"
                                                dataKey="views"
                                                stroke="var(--md-sys-color-primary)"
                                                fill="var(--md-sys-color-primary)"
                                                fillOpacity={0.1}
                                                strokeWidth={2}
                                            />
                                        </AreaChart>
                                    </ResponsiveContainer>
                                </div>
                            </Card>

                            <Card
                                className="w-full bg-[var(--md-sys-color-surface-container-low)] border-none"
                                title="詳細データ"
                            >
                                <Table
                                    dataSource={chartData}
                                    columns={[
                                        {
                                            title: '日付',
                                            dataIndex: 'date',
                                            key: 'date',
                                        },
                                        {
                                            title: '視聴回数',
                                            dataIndex: 'views',
                                            key: 'views',
                                            render: (val) => `${val?.toLocaleString() ?? 0}`,
                                            align: 'right',
                                            width: 100,
                                        },
                                        {
                                            title: '総再生時間 (分)',
                                            dataIndex: 'watchTime',
                                            key: 'watchTime',
                                            render: (val) => `${val?.toLocaleString() ?? 0}`,
                                            align: 'right',
                                            width: 120,
                                        },
                                        {
                                            title: '平均視聴時間 (秒)',
                                            dataIndex: 'avgViewDuration',
                                            key: 'avgViewDuration',
                                            render: (val) => `${val ?? 0}`,
                                            align: 'right',
                                            width: 120,
                                        },
                                        {
                                            title: '視聴維持率 (%)',
                                            dataIndex: 'avgViewPercentage',
                                            key: 'avgViewPercentage',
                                            render: (val) => `${val ? Math.round(val * 100) / 100 : 0}%`,
                                            align: 'right',
                                            width: 120,
                                        },
                                        {
                                            title: '登録増',
                                            dataIndex: 'subscribersGained',
                                            key: 'subscribersGained',
                                            align: 'right',
                                            width: 80,
                                        },
                                        {
                                            title: '登録減',
                                            dataIndex: 'subscribersLost',
                                            key: 'subscribersLost',
                                            align: 'right',
                                            width: 80,
                                        },
                                        {
                                            title: '高評価',
                                            dataIndex: 'likes',
                                            key: 'likes',
                                            align: 'right',
                                            width: 80,
                                        },
                                        {
                                            title: '低評価',
                                            dataIndex: 'dislikes',
                                            key: 'dislikes',
                                            align: 'right',
                                            width: 80,
                                        },
                                        {
                                            title: 'コメント',
                                            dataIndex: 'comments',
                                            key: 'comments',
                                            align: 'right',
                                            width: 90,
                                        },
                                        {
                                            title: 'シェア',
                                            dataIndex: 'shares',
                                            key: 'shares',
                                            align: 'right',
                                            width: 80,
                                        },
                                        {
                                            title: 'カード',
                                            dataIndex: 'cardClicks',
                                            key: 'cardClicks',
                                            align: 'right',
                                            width: 80,
                                        },
                                        {
                                            title: '終了画面',
                                            dataIndex: 'endScreenElementClicks',
                                            key: 'endScreenElementClicks',
                                            align: 'right',
                                            width: 90,
                                        },
                                    ]}
                                    pagination={{ pageSize: 10 }}
                                    size="small"
                                    rowKey="date"
                                    scroll={{ x: true }}
                                />
                            </Card>
                        </>
                    )}
                </>
            )}
        </div>
    );
}
