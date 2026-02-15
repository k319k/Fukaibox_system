"use client";

import { useMemo, useState } from "react";
import { Table, Card, Button, Input, Space, Tag, Tooltip } from "antd";
import type { TableProps } from 'antd';
import { SearchOutlined, DownloadOutlined, ReloadOutlined } from "@ant-design/icons";
import { VideoAnalyticsRow } from "@/lib/types/analytics";

interface AnalyticsTableAdvancedProps {
    data: any[];
    loading: boolean;
    onRefresh: () => void;
}

export function AnalyticsTableAdvanced({ data, loading, onRefresh }: AnalyticsTableAdvancedProps) {
    const [searchText, setSearchText] = useState('');

    const filteredData = useMemo(() => {
        if (!searchText) return data;
        return data.filter(item =>
            item.title.toLowerCase().includes(searchText.toLowerCase()) ||
            item.videoId.includes(searchText)
        );
    }, [data, searchText]);

    const columns: TableProps<any>['columns'] = [
        {
            title: '基本情報',
            children: [
                { title: '公開番号', dataIndex: 'publicId', key: 'publicId', width: 80, fixed: 'left' },
                { title: 'サムネ', key: 'thumbnail', width: 80, render: (_, r) => <img src={r.thumbnailUrl} alt="" className="w-16 h-9 object-cover rounded" /> },
                { title: '名前', dataIndex: 'title', key: 'title', width: 200, ellipsis: true },
                { title: '日付', dataIndex: 'publishedAt', key: 'publishedAt', width: 120, render: (v) => new Date(v).toLocaleDateString() },
                { title: '曜日', dataIndex: 'dayOfWeek', key: 'dayOfWeek', width: 60 },
            ]
        },
        {
            title: 'コンテンツ',
            children: [
                { title: '動画尺', dataIndex: 'duration', key: 'duration', width: 100 },
                { title: '秒数', dataIndex: 'durationSec', key: 'durationSec', width: 80, align: 'right' },
                { title: '文字数', dataIndex: 'charCount', key: 'charCount', width: 80, align: 'right' },
                { title: '圧縮度(秒/文字)', dataIndex: 'compressionRateSecPerChar', key: 'compressionRateSecPerChar', width: 100, align: 'right', render: (v) => v?.toFixed(2) },
                { title: '圧縮度(文字/秒)', dataIndex: 'compressionRateCharPerSec', key: 'compressionRateCharPerSec', width: 100, align: 'right', render: (v) => v?.toFixed(2) },
            ]
        },
        {
            title: 'エンゲージメント (自動更新)',
            children: [
                { title: '再生回数', dataIndex: 'views', key: 'views', width: 100, align: 'right', sorter: (a, b) => a.views - b.views, render: v => v?.toLocaleString() },
                { title: 'コメント', dataIndex: 'comments', key: 'comments', width: 90, align: 'right', sorter: (a, b) => a.comments - b.comments },
                { title: '高評価', dataIndex: 'likes', key: 'likes', width: 90, align: 'right', sorter: (a, b) => a.likes - b.likes },
                { title: '低評価', dataIndex: 'dislikes', key: 'dislikes', width: 90, align: 'right', sorter: (a, b) => a.dislikes - b.dislikes },
                { title: '登録増', dataIndex: 'subscribersGained', key: 'subscribersGained', width: 90, align: 'right', sorter: (a, b) => a.subscribersGained - b.subscribersGained },
                { title: '登録減', dataIndex: 'subscribersLost', key: 'subscribersLost', width: 90, align: 'right' },
            ]
        },
        {
            title: '視聴維持 & クリック',
            children: [
                { title: '平均維持率(%)', dataIndex: 'avgViewPercentage', key: 'avgViewPercentage', width: 100, align: 'right', render: v => v ? `${v.toFixed(1)}%` : '-' },
                { title: '総再生時間(分)', dataIndex: 'estimatedMinutesWatched', key: 'estimatedMinutesWatched', width: 110, align: 'right', render: v => v?.toLocaleString() },
                { title: 'カードクリック', dataIndex: 'cardClicks', key: 'cardClicks', width: 100, align: 'right' },
                { title: '終了画面クリック', dataIndex: 'endScreenElementClicks', key: 'endScreenElementClicks', width: 110, align: 'right' },
            ]
        },
        {
            title: '流入元 (Traffic Source)',
            children: [
                { title: 'ショート', dataIndex: 'trafficSourceShorts', key: 'trafficSourceShorts', width: 90, align: 'right' },
                { title: 'ブラウジング', dataIndex: 'trafficSourceBrowse', key: 'trafficSourceBrowse', width: 100, align: 'right' },
                { title: '検索', dataIndex: 'trafficSourceSearch', key: 'trafficSourceSearch', width: 80, align: 'right' },
                { title: 'チャンネル', dataIndex: 'trafficSourceChannel', key: 'trafficSourceChannel', width: 90, align: 'right' },
                { title: '音声ページ', dataIndex: 'trafficSourceSound', key: 'trafficSourceSound', width: 90, align: 'right' },
                { title: 'その他', dataIndex: 'trafficSourceOther', key: 'trafficSourceOther', width: 80, align: 'right' },
            ]
        },
        {
            title: '視聴者属性 (Demographics)',
            children: [
                { title: '女性(%)', dataIndex: 'genderFemale', key: 'genderFemale', width: 80, align: 'right', render: v => v?.toFixed(1) },
                { title: '男性(%)', dataIndex: 'genderMale', key: 'genderMale', width: 80, align: 'right', render: v => v?.toFixed(1) },
                { title: '13-17歳', dataIndex: 'age13_17', key: 'age13_17', width: 80, align: 'right', render: v => v?.toFixed(1) },
                { title: '18-24歳', dataIndex: 'age18_24', key: 'age18_24', width: 80, align: 'right', render: v => v?.toFixed(1) },
                { title: '25-34歳', dataIndex: 'age25_34', key: 'age25_34', width: 80, align: 'right', render: v => v?.toFixed(1) },
                { title: '35-44歳', dataIndex: 'age35_44', key: 'age35_44', width: 80, align: 'right', render: v => v?.toFixed(1) },
                { title: '45-54歳', dataIndex: 'age45_54', key: 'age45_54', width: 80, align: 'right', render: v => v?.toFixed(1) },
                { title: '55-64歳', dataIndex: 'age55_64', key: 'age55_64', width: 80, align: 'right', render: v => v?.toFixed(1) },
                { title: '65歳以上', dataIndex: 'age65_plus', key: 'age65_plus', width: 80, align: 'right', render: v => v?.toFixed(1) },
            ]
        },
        {
            title: '計算指標',
            children: [
                { title: 'エンゲージView', dataIndex: 'engagementView', key: 'engagementView', width: 110, align: 'right', render: v => v?.toLocaleString(), sorter: (a, b) => a.engagementView - b.engagementView },
                { title: 'シェア', dataIndex: 'shares', key: 'shares', width: 80, align: 'right' },
                { title: '適合度', dataIndex: 'matchRate', key: 'matchRate', width: 80, render: () => '-' }, // Placeholder
            ]
        }
    ];

    return (
        <div className="space-y-4">
            <div className="flex justify-between items-center mb-4">
                <Space>
                    <Input
                        prefix={<SearchOutlined />}
                        placeholder="動画名で検索"
                        value={searchText}
                        onChange={e => setSearchText(e.target.value)}
                        style={{ width: 250 }}
                    />
                    <Button icon={<ReloadOutlined />} onClick={onRefresh} loading={loading}>
                        更新
                    </Button>
                </Space>
                <Button icon={<DownloadOutlined />}>CSVエクスポート</Button>
            </div>

            <Table
                columns={columns}
                dataSource={filteredData}
                rowKey="videoId"
                scroll={{ x: 'max-content', y: 600 }}
                pagination={{ pageSize: 20 }}
                loading={loading}
                size="small"
                bordered
            />
        </div>
    );
}
