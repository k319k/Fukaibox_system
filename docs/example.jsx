import React, { useState } from 'react';
import {
    ConfigProvider, Layout, Menu, Button, Card, Typography, Space,
    Badge, List, Divider, Input, Tag, Table, Avatar, Progress, Tabs, Switch, Slider
} from 'antd';
import {
    BookOpen, Users, Settings, Trophy, Image as ImageIcon,
    LogOut, Zap, PenLine, ChevronRight, Search, Filter,
    Upload, User, Palette, Bell, Shield, Info
} from 'lucide-react';

const { Header, Content, Sider } = Layout;
const { Title, Text, Paragraph } = Typography;

/**
 * デザイントークン設定 (Ant Design v5)
 * M3の丸みと、和の配色を統合。
 */
const themeConfig = {
    token: {
        colorPrimary: '#B3424A',    // 茜色
        colorBgContainer: '#fdfaf5', // 和紙色
        colorBgLayout: '#f7f2ed',    // 表面色 (M3 Surface)
        colorTextBase: '#121212',    // 墨色
        borderRadius: 16,            // M3風の角丸
        fontFamily: '"Noto Serif JP", serif',
    },
    components: {
        Layout: { colorBgHeader: '#fdfaf5', colorBgBody: 'transparent' },
        Card: {
            colorBgContainer: 'rgba(253, 250, 245, 0.8)',
            backdropFilter: 'blur(10px)',
            colorBorderSecondary: 'rgba(179, 66, 74, 0.1)'
        },
        Menu: { itemSelectedBg: '#f2e6e7', itemSelectedColor: '#B3424A' }
    },
};

// --- サブコンポーネント (各タブの内容) ---

// 1. 台本ノ書 (Script Tab)
const ScriptTab = ({ isGicho }) => (
    <Space direction="vertical" size={24} style={{ width: '100%' }}>
        <Card className="washi-surface">
            <Space direction="vertical" size={16} style={{ width: '100%' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <Space><Badge status="processing" color="#B3424A" text="現在進行中の儀" /></Space>
                    <Text type="secondary">最終更新: 12:40</Text>
                </div>
                <Title level={3}>第一相：開門の儀</Title>
                <Paragraph style={{ fontSize: '18px', lineHeight: '2', letterSpacing: '0.05em' }}>
                    「其れは、古き封印が解かれる瞬間に現れる。茜色の空が裂け、墨色の雲が渦巻く時、我らは真実の姿を目撃するであろう。…」
                </Paragraph>
                {isGicho && (
                    <Button type="primary" icon={<PenLine size={16} />}>台本を修正する</Button>
                )}
            </Space>
        </Card>
        <Card title="関連するキーワード" size="small">
            <Space wrap>
                <Tag color="volcano">#封印</Tag><Tag color="volcano">#茜空</Tag><Tag color="volcano">#真実</Tag>
            </Space>
        </Card>
    </Space>
);

// 2. 画像ノ庫 (Gallery Tab)
const GalleryTab = ({ isGicho }) => (
    <Space direction="vertical" size={24} style={{ width: '100%' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Input prefix={<Search size={16} />} placeholder="画像を検索..." style={{ width: 300 }} />
            <Button icon={<Upload size={16} />}>画像を提出</Button>
        </div>
        <List
            grid={{ gutter: 16, xs: 1, sm: 2, md: 3 }}
            dataSource={[
                { id: 1, title: '古びた鍵', user: '儀員A', status: 'adopted' },
                { id: 2, title: '血塗られた書状', user: '儀員B', status: 'pending' },
                { id: 3, title: '隠された紋章', user: '儀員C', status: 'pending' },
            ]}
            renderItem={(item) => (
                <List.Item>
                    <Card
                        hoverable
                        cover={<div style={{ height: 160, background: '#eee', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>[画像プレビュー]</div>}
                        actions={[
                            isGicho && item.status === 'pending' ? <Button type="link" key="a">採用</Button> : null,
                            <Button type="text" key="b">詳細</Button>
                        ].filter(Boolean)}
                    >
                        <Card.Meta
                            title={<Space>{item.title}{item.status === 'adopted' && <Badge status="success" />}</Space>}
                            description={`${item.user} が提出`}
                        />
                    </Card>
                </List.Item>
            )}
        />
    </Space>
);

// 3. 位階一覧 (Ranking Tab)
const RankingTab = () => (
    <Card title="現在の位階（徳の蓄積）">
        <Table
            pagination={false}
            dataSource={[
                { key: '1', rank: 1, name: '九頭竜 斎門', points: 2500, level: '上級儀員' },
                { key: '2', rank: 2, name: '儀員A', points: 1800, level: '中級儀員' },
                { key: '3', rank: 3, name: '儀員B', points: 1200, level: '初級儀員' },
            ]}
            columns={[
                { title: '位', dataIndex: 'rank', key: 'rank', render: (r) => <Text strong>{r}</Text> },
                { title: '氏名', dataIndex: 'name', key: 'name' },
                { title: '徳（pt）', dataIndex: 'points', key: 'points', render: (p) => <Text color="#B3424A">{p.toLocaleString()}</Text> },
                { title: '格付', dataIndex: 'level', key: 'level', render: (l) => <Tag>{l}</Tag> },
            ]}
        />
    </Card>
);

// 4. 儀員名簿 (Members Tab)
const MembersTab = () => (
    <List
        itemLayout="horizontal"
        dataSource={[
            { name: '九頭竜 斎門', role: '儀長', status: 'online' },
            { name: '儀員A', role: '儀員', status: 'online' },
            { name: '儀員B', role: '儀員', status: 'offline' },
        ]}
        renderItem={(item) => (
            <Card style={{ marginBottom: 12 }} size="small">
                <List.Item actions={[<Button size="small">通告</Button>]}>
                    <List.Item.Meta
                        avatar={<Avatar icon={<User size={16} />} />}
                        title={<Space>{item.name}<Tag color={item.role === '儀長' ? 'red' : 'blue'}>{item.role}</Tag></Space>}
                        description={item.status === 'online' ? <Text type="success">顕現中</Text> : <Text type="secondary">離脱中</Text>}
                    />
                </List.Item>
            </Card>
        )}
    />
);

// 5. 設定 (Settings Tab)
const SettingsTab = () => (
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

// --- メインレイアウト ---
const App = () => {
    const [activeKey, setActiveKey] = useState('1');
    const [collapsed, setCollapsed] = useState(false);
    const isGicho = true; // デモ用

    const renderContent = () => {
        switch (activeKey) {
            case '1': return <ScriptTab isGicho={isGicho} />;
            case '2': return <GalleryTab isGicho={isGicho} />;
            case '3': return <RankingTab />;
            case '4': return <MembersTab />;
            case '5': return <SettingsTab />;
            default: return <ScriptTab />;
        }
    };

    return (
        <ConfigProvider theme={themeConfig}>
            <Layout style={{ minHeight: '100vh', background: '#f7f2ed url("https://www.transparenttextures.com/patterns/paper.png") fixed' }}>
                <Sider collapsible collapsed={collapsed} onCollapse={setCollapsed} theme="light" style={{ background: 'rgba(253, 250, 245, 0.6)' }}>
                    <div style={{ height: 80, display: 'flex', alignItems: 'center', padding: '0 24px' }}>
                        <Zap size={24} color="#B3424A" fill="#B3424A" />
                        {!collapsed && <span style={{ marginLeft: 12, fontWeight: 'bold', fontSize: '1.2rem', color: '#B3424A' }}>封解Box</span>}
                    </div>
                    <Menu
                        mode="inline"
                        selectedKeys={[activeKey]}
                        onClick={(e) => setActiveKey(e.key)}
                        items={[
                            { key: '1', icon: <BookOpen size={18} />, label: '台本ノ書' },
                            { key: '2', icon: <ImageIcon size={18} />, label: '画像ノ庫' },
                            { key: '3', icon: <Trophy size={18} />, label: '位階一覧' },
                            { key: '4', icon: <Users size={18} />, label: '儀員名簿' },
                            { key: '5', icon: <Settings size={18} />, label: '設定' },
                        ]}
                    />
                </Sider>

                <Layout style={{ background: 'transparent' }}>
                    <Header style={{ height: 80, padding: '0 32px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: 'rgba(253, 250, 245, 0.4)' }}>
                        <Title level={4} style={{ margin: 0 }}>
                            {activeKey === '1' && '台本ノ書'}
                            {activeKey === '2' && '画像ノ庫'}
                            {activeKey === '3' && '位階一覧'}
                            {activeKey === '4' && '儀員名簿'}
                            {activeKey === '5' && '設定'}
                        </Title>
                        <Space>
                            <Badge count="儀長" color="#B3424A" />
                            <Button type="text" icon={<LogOut size={18} />} />
                        </Space>
                    </Header>
                    <Content style={{ padding: '24px', maxWidth: 1200, margin: '0 auto', width: '100%' }}>
                        {renderContent()}
                    </Content>
                </Layout>
            </Layout>
        </ConfigProvider>
    );
};

export default App;