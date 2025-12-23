import { useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { Layout, Menu, Button, Avatar, Tag } from 'antd'
import { HomeOutlined, UserOutlined, SettingOutlined, MenuOutlined, CodeOutlined, ControlOutlined } from '@ant-design/icons'
import useAuthStore from '../../store/authStore'
import OnlineStatusBadge from '../common/OnlineStatusBadge'

const { Sider } = Layout

/**
 * FukaiBox Sidebar - ナビゲーションのみ
 * シンプルでクリーンなデザイン
 */
export default function Sidebar() {
    const [collapsed, setCollapsed] = useState(false)
    const location = useLocation()
    const navigate = useNavigate()
    const { user, isGicho } = useAuthStore()

    const menuItems = [
        {
            key: '/',
            icon: <HomeOutlined style={{ fontSize: 18 }} />,
            label: 'ホーム',
            onClick: () => navigate('/')
        },
        {
            key: '/users',
            icon: <UserOutlined style={{ fontSize: 18 }} />,
            label: 'ユーザー一覧',
            onClick: () => navigate('/users')
        },
    ]

    const bottomMenuItems = [
        // DevStudio - visible for 儀長 and users with can_manage_api_keys
        ...(isGicho || user?.can_manage_api_keys ? [{
            key: '/dev-studio',
            icon: <CodeOutlined style={{ fontSize: 18 }} />,
            label: 'DevStudio',
            onClick: () => navigate('/dev-studio')
        }] : []),

        // AdminPanel - visible for 儀長 only
        ...(isGicho ? [{
            key: '/admin',
            icon: <ControlOutlined style={{ fontSize: 18 }} />,
            label: '管理者',
            onClick: () => navigate('/admin')
        }] : []),

        {
            key: '/settings',
            icon: <SettingOutlined style={{ fontSize: 18 }} />,
            label: '設定',
            onClick: () => navigate('/settings')
        },
    ]

    return (
        <Sider
            collapsible
            collapsed={collapsed}
            onCollapse={setCollapsed}
            width={200}
            collapsedWidth={64}
            trigger={null}
            style={{
                background: 'var(--color-surface-light)',
                borderRight: '1px solid var(--color-border)',
            }}
        >
            <div style={{
                display: 'flex',
                flexDirection: 'column',
                height: '100%',
                padding: '16px 8px'
            }}>
                {/* Collapse Toggle */}
                <Button
                    type="text"
                    icon={<MenuOutlined style={{ fontSize: 18 }} />}
                    onClick={() => setCollapsed(!collapsed)}
                    style={{
                        color: 'var(--color-text-secondary)',
                        width: 40,
                        height: 40,
                        marginBottom: 16,
                        marginLeft: collapsed ? 4 : 8
                    }}
                />

                {/* User Profile Section */}
                {user && (
                    <div style={{
                        padding: collapsed ? '8px 0' : '12px 8px',
                        marginBottom: 16,
                        borderBottom: '1px solid var(--color-border)',
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: collapsed ? 'center' : 'flex-start',
                        gap: collapsed ? 0 : 8
                    }}>
                        <div style={{ position: 'relative' }}>
                            <Avatar
                                src={user.avatar_url || user.profile_image_url}
                                icon={<UserOutlined />}
                                size={collapsed ? 32 : 48}
                            />
                            <div style={{
                                position: 'absolute',
                                bottom: -2,
                                right: -2,
                                background: 'white',
                                borderRadius: '50%',
                                width: 16,
                                height: 16,
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                boxShadow: '0 1px 3px rgba(0,0,0,0.12)'
                            }}>
                                <OnlineStatusBadge isOnline={user.is_online} size={12} />
                            </div>
                        </div>

                        {!collapsed && (
                            <>
                                <div style={{
                                    fontWeight: 500,
                                    fontSize: '14px',
                                    color: 'var(--color-text-primary)',
                                    maxWidth: '100%',
                                    overflow: 'hidden',
                                    textOverflow: 'ellipsis',
                                    whiteSpace: 'nowrap'
                                }}>
                                    {user.display_name || user.username}
                                </div>
                                {isGicho && (
                                    <Tag color="gold" style={{ margin: 0, fontSize: '11px' }}>
                                        儀長
                                    </Tag>
                                )}
                            </>
                        )}
                    </div>
                )}

                {/* Navigation Menu */}
                <Menu
                    mode="inline"
                    selectedKeys={[location.pathname]}
                    items={menuItems}
                    style={{
                        flex: 1,
                        border: 'none',
                        background: 'transparent'
                    }}
                />

                {/* Bottom Menu - Settings */}
                <Menu
                    mode="inline"
                    selectedKeys={[location.pathname]}
                    items={bottomMenuItems}
                    style={{
                        border: 'none',
                        background: 'transparent',
                        marginBottom: 8
                    }}
                />

                {/* Copyright */}
                {!collapsed && (
                    <div style={{
                        textAlign: 'center',
                        fontSize: '10px',
                        color: 'var(--color-text-tertiary)',
                        paddingTop: 16
                    }}>
                        © 2025 封解公儀
                    </div>
                )}
            </div>
        </Sider>
    )
}
