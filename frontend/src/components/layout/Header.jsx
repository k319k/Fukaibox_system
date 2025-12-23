import { Link } from 'react-router-dom'
import { Layout as AntLayout, Button, Avatar, Dropdown, Space } from 'antd'
import { LoginOutlined, UserOutlined, LogoutOutlined, TrophyOutlined } from '@ant-design/icons'
import { useAuthStore } from '../../store/authStore'
import { usePointStore } from '../../store/pointStore'

const { Header } = AntLayout

/**
 * FukaiBox Header - Material 3 スタイル
 */
export default function AppHeader() {
    const { user, isLoggedIn, logout } = useAuthStore()
    const { rankings } = usePointStore()

    const userRank = rankings.findIndex(r => r.uid === user?.id) + 1

    const userMenuItems = [
        {
            key: 'points',
            label: `${user?.points || 0} 点`,
            icon: <TrophyOutlined />,
            disabled: true,
        },
        {
            key: 'rank',
            label: userRank > 0 ? `${userRank}位` : '圏外',
            disabled: true,
        },
        {
            type: 'divider',
        },
        {
            key: 'logout',
            label: 'ログアウト',
            icon: <LogoutOutlined />,
            danger: true,
            onClick: logout,
        },
    ]

    return (
        <Header style={{
            background: 'var(--color-surface-light)',
            borderBottom: '1px solid var(--color-border)',
            padding: '0 24px',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            height: 56,
            position: 'sticky',
            top: 0,
            zIndex: 100
        }}>
            {/* Left: Logo */}
            <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: 12, textDecoration: 'none' }}>
                <img
                    src="/logo.avif"
                    alt="FukaiBox"
                    style={{ width: 32, height: 32, objectFit: 'contain' }}
                />
                <span style={{
                    fontSize: 18,
                    fontWeight: 700,
                    color: 'var(--color-primary)',
                    fontFamily: "'Noto Serif JP', serif"
                }}>
                    封解Box
                </span>
            </Link>

            {/* Right: User/Login */}
            {isLoggedIn ? (
                <Dropdown
                    menu={{ items: userMenuItems }}
                    trigger={['click']}
                    placement="bottomRight"
                    dropdownRender={(menu) => (
                        <div style={{
                            background: '#FFFFFF',
                            borderRadius: '12px',
                            boxShadow: '0 4px 12px rgba(18, 18, 18, 0.15), 0 2px 6px rgba(18, 18, 18, 0.1)',
                            border: '1px solid rgba(18, 18, 18, 0.08)',
                            overflow: 'hidden'
                        }}>
                            {menu}
                        </div>
                    )}
                >
                    <Space style={{ cursor: 'pointer', padding: '4px 12px', borderRadius: '20px', transition: 'background 0.2s' }} className="user-menu-trigger">
                        <Avatar
                            size={32}
                            src={user?.avatarUrl}
                            icon={<UserOutlined />}
                            style={{ border: '2px solid var(--color-primary)' }}
                        />
                        <span style={{ fontWeight: 500, color: 'var(--color-text)', fontSize: '14px' }}>
                            {user?.displayName || user?.username}
                        </span>
                    </Space>
                </Dropdown>
            ) : (
                <Link to="/">
                    <Button
                        type="primary"
                        icon={<LoginOutlined />}
                        style={{ borderRadius: 20 }}
                    >
                        ログイン
                    </Button>
                </Link>
            )}
        </Header>
    )
}
