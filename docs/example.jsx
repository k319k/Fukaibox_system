import React, { useState } from 'react';
import { ConfigProvider, Layout, Menu, Button, Space, Badge, Typography } from 'antd';
import {
    BookOpen, Users, Settings, Trophy, Image as ImageIcon,
    LogOut, Zap
} from 'lucide-react';
import { ScriptTab } from './components/ScriptTab';
import { GalleryTab } from './components/GalleryTab';
import { RankingTab } from './components/RankingTab';
import { MembersTab } from './components/MembersTab';
import { SettingsTab } from './components/SettingsTab';

const { Header, Content, Sider } = Layout;
const { Title } = Typography;

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
            default: return <ScriptTab isGicho={isGicho} />;
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
