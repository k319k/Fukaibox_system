// Main navigation layout component
import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router";
import { Layout as AntLayout, Button, Avatar, Dropdown, Space, Modal } from "antd";
import {
    MenuOutlined,
    HomeOutlined,
    TrophyOutlined,
    CodeOutlined,
    LoginOutlined,
    UserOutlined,
    SettingOutlined,
    ControlOutlined,
    DownOutlined,
    RightOutlined,
} from "@ant-design/icons";
import "./Layout.css";

const { Header, Sider, Content } = AntLayout;

interface LayoutProps {
    user?: { id: number; username: string; displayName: string | null; avatarUrl: string | null; points: number | null; isGicho: boolean | null } | null;
    isLoggedIn: boolean;
    isGicho: boolean;
    children: React.ReactNode;
}

export default function Layout({ user, isLoggedIn, isGicho, children }: LayoutProps) {
    const [collapsed, setCollapsed] = useState(false);
    const [loginModalOpen, setLoginModalOpen] = useState(false);
    const [otherExpanded, setOtherExpanded] = useState(false);
    const location = useLocation();
    const navigate = useNavigate();

    const mainMenuItems = [
        { key: "/", icon: <HomeOutlined />, label: "ホーム" },
        { key: "/ranking", icon: <TrophyOutlined />, label: "ランキング" },
        { key: "/tools", icon: <CodeOutlined />, label: "Tools" },
    ];

    const otherMenuItems = [
        ...(isGicho ? [{ key: "/admin", icon: <ControlOutlined />, label: "管理者" }] : []),
        ...(isLoggedIn ? [{ key: "/settings", icon: <SettingOutlined />, label: "設定" }] : []),
    ];

    const userMenuItems = [
        { key: "profile", label: user?.displayName || user?.username, disabled: true },
        { key: "points", label: `${user?.points || 0} 点`, disabled: true },
        { type: "divider" as const },
        { key: "logout", label: "ログアウト", danger: true, onClick: () => navigate("/auth/logout") },
    ];

    const isOtherActive = otherMenuItems.some((item) => location.pathname === item.key);

    return (
        <AntLayout className="fukaibox-layout">
            {/* Login Modal */}
            <Modal title="ログイン" open={loginModalOpen} onCancel={() => setLoginModalOpen(false)} footer={null} centered>
                <div style={{ textAlign: "center", padding: 24 }}>
                    <a href="/auth/discord/login">
                        <Button type="primary" size="large" icon={<LoginOutlined />}>
                            Discordでログイン
                        </Button>
                    </a>
                </div>
            </Modal>

            {/* Header */}
            <Header className="fukaibox-header">
                <div className="header-left">
                    <Button type="text" icon={<MenuOutlined style={{ fontSize: 20 }} />} onClick={() => setCollapsed(!collapsed)} className="hamburger-btn" />
                    <Link to="/" className="logo-link">
                        <img src="/logo.avif" alt="FukaiBox" className="logo-image" />
                        <span className="logo-text">封解Box</span>
                    </Link>
                </div>

                <div className="header-right">
                    {isLoggedIn ? (
                        <Dropdown menu={{ items: userMenuItems }} trigger={["click"]} placement="bottomRight">
                            <Space className="user-dropdown">
                                <Avatar size={36} src={user?.avatarUrl} icon={<UserOutlined />} style={{ border: "2px solid var(--color-primary)" }} />
                                <span className="user-name">{user?.displayName || user?.username}</span>
                            </Space>
                        </Dropdown>
                    ) : (
                        <>
                            <Button type="primary" shape="circle" icon={<LoginOutlined />} className="login-btn-mobile" onClick={() => setLoginModalOpen(true)} />
                            <Button type="primary" shape="round" icon={<LoginOutlined />} className="login-btn-desktop" onClick={() => setLoginModalOpen(true)}>
                                ログイン
                            </Button>
                        </>
                    )}
                </div>
            </Header>

            <AntLayout className="fukaibox-body">
                {/* Sidebar */}
                <Sider collapsed={collapsed} width={256} collapsedWidth={80} className="fukaibox-sider">
                    <nav className="nav-menu">
                        {mainMenuItems.map((item) => (
                            <div key={item.key} className={`nav-item ${location.pathname === item.key ? "active" : ""}`} onClick={() => navigate(item.key)}>
                                <span className="nav-icon">{item.icon}</span>
                                {!collapsed && <span className="nav-label">{item.label}</span>}
                            </div>
                        ))}

                        {otherMenuItems.length > 0 && (
                            <>
                                <div className={`nav-item nav-item-expandable ${isOtherActive ? "active-parent" : ""}`} onClick={() => setOtherExpanded(!otherExpanded)}>
                                    <span className="nav-icon">{otherExpanded ? <DownOutlined /> : <RightOutlined />}</span>
                                    {!collapsed && <span className="nav-label">その他</span>}
                                </div>

                                {(otherExpanded || collapsed) && (
                                    <div className={`nav-submenu ${collapsed ? "collapsed" : ""}`}>
                                        {otherMenuItems.map((item) => (
                                            <div key={item.key} className={`nav-item nav-subitem ${location.pathname === item.key ? "active" : ""}`} onClick={() => navigate(item.key)}>
                                                <span className="nav-icon">{item.icon}</span>
                                                {!collapsed && <span className="nav-label">{item.label}</span>}
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </>
                        )}
                    </nav>

                    {!collapsed && <div className="sidebar-footer">© 2025 封解公儀</div>}
                </Sider>

                {/* Content */}
                <Content className="fukaibox-content" style={{ marginLeft: collapsed ? 80 : 256, transition: "margin-left 0.3s ease" }}>
                    <div className="content-inner">{children}</div>
                </Content>
            </AntLayout>
        </AntLayout>
    );
}
