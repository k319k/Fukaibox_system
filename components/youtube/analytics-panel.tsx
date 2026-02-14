"use client";

import { useMemo } from "react";
import {
    AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer
} from "recharts";
import { Card, Statistic, Segmented, Spin, Empty, Table } from "antd";
import type { TableProps } from 'antd';
import { ArrowUpOutlined, ArrowDownOutlined } from "@ant-design/icons";

interface AnalyticsPanelProps {
    data: any | null; // YouTube Analytics API Response
    loading: boolean;
    period: string; // '7d' | '30d' | '90d'
    onPeriodChange: (val: string) => void;
}

export function AnalyticsPanel({ data, loading, period, onPeriodChange }: AnalyticsPanelProps) {

    const chartData = useMemo(() => {
        if (!data?.rows) return [];
        // headers: ["day", "views", "estimatedMinutesWatched", "averageViewDuration"]
        return data.rows.map((row: any) => ({
            date: row[0],
            views: row[1],
            watchTime: Math.round(row[2] / 60), // minutes -> hours? or keep minutes
            avgViewDuration: row[3]
        }));
    }, [data]);

    const totals = useMemo(() => {
        if (!data?.rows) return { views: 0, watchTime: 0 };
        const totalViews = data.rows.reduce((acc: number, row: any) => acc + row[1], 0);
        const totalWatchTime = data.rows.reduce((acc: number, row: any) => acc + row[2], 0);
        return { views: totalViews, watchTime: Math.round(totalWatchTime) };
    }, [data]);

    if (loading) {
        return (
            <Card className="min-h-[400px] flex items-center justify-center">
                <Spin size="large" />
            </Card>
        );
    }

    if (!data || chartData.length === 0) {
        return (
            <Card className="min-h-[400px] flex flex-col items-center justify-center">
                <Empty description="データがありません。期間を変更してみてください。" />
                <div className="mt-4">
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
            </Card>
        );
    }

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
                            render: (val) => `${val.toLocaleString()} 回`,
                            align: 'right',
                        },
                        {
                            title: '総再生時間 (分)',
                            dataIndex: 'watchTime',
                            key: 'watchTime',
                            render: (val) => `${val.toLocaleString()} 分`, // Previously rounded to minutes
                            align: 'right',
                        },
                        {
                            title: '平均視聴時間 (秒)',
                            dataIndex: 'avgViewDuration',
                            key: 'avgViewDuration',
                            render: (val) => `${val} 秒`, // Raw seconds?
                            align: 'right',
                        },
                    ]}
                    pagination={{ pageSize: 10 }}
                    size="small"
                    rowKey="date"
                    scroll={{ x: true }}
                />
            </Card>
        </div >
    );
}
