import { useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { Layout as AntLayout, Button, Avatar, Dropdown, Space } from 'antd'
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
    RightOutlined
} from '@ant-design/icons'
import { useAuthStore } from '../store/authStore'
import { usePointStore } from '../store/pointStore'
import LoginModal from './LoginModal'
import './Layout.css'

const { Header, Sider, Content } = AntLayout

/**
 * FukaiBox Layout - Material Design 3 (Google Style)
 * Navigation Drawer (256px) / Navigation Rail (80px)
 */
export default function Layout({ children }) {
    const [collapsed, setCollapsed] = useState(false)
    const [loginModalOpen, setLoginModalOpen] = useState(false)
    const [otherExpanded, setOtherExpanded] = useState(false)
    const location = useLocation()
    const navigate = useNavigate()
    const { user, isLoggedIn, isGicho, logout } = useAuthStore()
    const { rankings } = usePointStore()

    const userRank = rankings.findIndex(r => r.uid === user?.id) + 1

    // Main navigation items
    const mainMenuItems = [
        { key: '/', icon: <HomeOutlined />, label: 'ホーム' },
        { key: '/ranking', icon: <TrophyOutlined />, label: 'ランキング' },
        { key: '/tools', icon: <CodeOutlined />, label: 'Tools' },
    ]

    // "その他" submenu items (conditionally shown)
    const otherMenuItems = [
        // DevStudio - visible for 儀長 and users with can_manage_api_keys
        ...(isGicho || user?.can_manage_api_keys ? [{
            key: '/dev-studio',
            icon: <CodeOutlined />,
            label: 'DevStudio'
        }] : []),
        // AdminPanel - visible for 儀長 only
        ...(isGicho ? [{
            key: '/admin',
            icon: <ControlOutlined />,
            label: '管理者'
        }] : []),
        // Settings - visible for all logged in users
        ...(isLoggedIn ? [{
            key: '/settings',
            icon: <SettingOutlined />,
            label: '設定'
        }] : []),
    ]

    const userMenuItems = [
        { key: 'profile', label: user?.displayName || user?.username, disabled: true },
        { key: 'points', label: `${user?.points || 0} 点 / ${userRank > 0 ? `${userRank}位` : '圏外'}`, disabled: true },
        { type: 'divider' },
        { key: 'logout', label: 'ログアウト', danger: true, onClick: logout },
    ]

    const isOtherActive = otherMenuItems.some(item => location.pathname === item.key)

    return (
        <AntLayout className="fukaibox-layout">
            {/* Login Modal */}
            <LoginModal open={loginModalOpen} onClose={() => setLoginModalOpen(false)} />

            {/* =============== HEADER (M3) =============== */}
            <Header className="fukaibox-header">
                {/* Left: Hamburger + Logo */}
                <div className="header-left">
                    <Button
                        type="text"
                        icon={<MenuOutlined style={{ fontSize: 20 }} />}
                        onClick={() => setCollapsed(!collapsed)}
                        className="hamburger-btn"
                    />
                    <Link to="/" className="logo-link">
                        <img src="/logo.avif" alt="FukaiBox" className="logo-image" />
                        <span className="logo-text">封解Box</span>
                    </Link>
                </div>

                {/* Right: Login/User */}
                <div className="header-right">
                    {isLoggedIn ? (
                        <Dropdown menu={{ items: userMenuItems }} trigger={['click']} placement="bottomRight">
                            <Space className="user-dropdown">
                                <Avatar
                                    size={36}
                                    src={user?.avatarUrl}
                                    icon={<UserOutlined />}
                                    style={{ border: '2px solid var(--color-primary)' }}
                                />
                                <span className="user-name">{user?.displayName || user?.username}</span>
                            </Space>
                        </Dropdown>
                    ) : (
                        <>
                            <Button
                                type="primary"
                                shape="circle"
                                icon={<LoginOutlined />}
                                className="login-btn-mobile"
                                onClick={() => setLoginModalOpen(true)}
                            />
                            <Button
                                type="primary"
                                shape="round"
                                icon={<LoginOutlined />}
                                className="login-btn-desktop"
                                onClick={() => setLoginModalOpen(true)}
                            >
                                ログイン
                            </Button>
                        </>
                    )}
                </div>
            </Header>

            {/* =============== BODY =============== */}
            <AntLayout className="fukaibox-body">
                {/* =============== SIDEBAR (Navigation Drawer/Rail) =============== */}
                <Sider
                    collapsed={collapsed}
                    width={256}
                    collapsedWidth={80}
                    className="fukaibox-sider"
                >
                    {/* Main Navigation */}
                    <nav className="nav-menu">
                        {mainMenuItems.map(item => (
                            <div
                                key={item.key}
                                className={`nav-item ${location.pathname === item.key ? 'active' : ''}`}
                                onClick={() => navigate(item.key)}
                            >
                                <span className="nav-icon">{item.icon}</span>
                                {!collapsed && <span className="nav-label">{item.label}</span>}
                            </div>
                        ))}

                        {/* その他 Section - Collapsible */}
                        {otherMenuItems.length > 0 && (
                            <>
                                <div
                                    className={`nav-item nav-item-expandable ${isOtherActive ? 'active-parent' : ''}`}
                                    onClick={() => setOtherExpanded(!otherExpanded)}
                                >
                                    <span className="nav-icon">
                                        {otherExpanded ? <DownOutlined /> : <RightOutlined />}
                                    </span>
                                    {!collapsed && <span className="nav-label">その他</span>}
                                </div>

                                {/* Submenu Items */}
                                {(otherExpanded || collapsed) && (
                                    <div className={`nav-submenu ${collapsed ? 'collapsed' : ''}`}>
                                        {otherMenuItems.map(item => (
                                            <div
                                                key={item.key}
                                                className={`nav-item nav-subitem ${location.pathname === item.key ? 'active' : ''}`}
                                                onClick={() => navigate(item.key)}
                                            >
                                                <span className="nav-icon">{item.icon}</span>
                                                {!collapsed && <span className="nav-label">{item.label}</span>}
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </>
                        )}
                    </nav>

                    {/* Copyright */}
                    {!collapsed && (
                        <div className="sidebar-footer">
                            © 2025 封解公儀
                        </div>
                    )}
                </Sider>

                {/* =============== CONTENT =============== */}
                <Content
                    className="fukaibox-content"
                    style={{
                        marginLeft: collapsed ? 80 : 256,
                        transition: 'margin-left 0.3s ease'
                    }}
                >
                    <div className="content-inner">
                        {children}
                    </div>
                </Content>
            </AntLayout>
        </AntLayout>
    )
}
