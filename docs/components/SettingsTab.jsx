import React from 'react';
import { Card, Tabs, Space, Typography, Input, Divider, Button, Slider, Switch } from 'antd';
import { User, Palette, Shield } from 'lucide-react';

const { Title, Text } = Typography;

export const SettingsTab = () => (
    <Card>
        <Tabs tabPosition="left" items={[
            {
                key: 'profile',
                label: <Space><User size={16} />プロフィール</Space>,
                children: (
                    <Space direction="vertical" style={{ width: '100%' }}>
                        <Title level={5}>表示名</Title>
                        <Input defaultValue="九頭竜 斎門" style={{ maxWidth: 300 }} />
                        <Divider />
                        <Button type="primary">保存</Button>
                    </Space>
                )
            },
            {
                key: 'appearance',
                label: <Space><Palette size={16} />外観設定</Space>,
                children: (
                    <Space direction="vertical" style={{ width: '100%' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', width: 300 }}>
                            <Text>和紙テクスチャの濃度</Text>
                            <Slider defaultValue={30} style={{ width: 100 }} />
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', width: 300 }}>
                            <Text>ダークモード（墨）</Text>
                            <Switch />
                        </div>
                    </Space>
                )
            },
            {
                key: 'system',
                label: <Space><Shield size={16} />システム</Space>,
                children: <Text type="secondary">バージョン: 0.1.0-alpha (茜)</Text>
            }
        ]} />
    </Card>
);
