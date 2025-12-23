import { useState } from 'react'
import { Tabs, Typography } from 'antd'
import { UserOutlined, LinkOutlined, SafetyOutlined, BgColorsOutlined, BellOutlined } from '@ant-design/icons'
import ProfileSection from '../components/settings/ProfileSection'
import AccountsSection from '../components/settings/AccountsSection'
import SecuritySection from '../components/settings/SecuritySection'
import AppearanceSection from '../components/settings/AppearanceSection'
import NotificationsSection from '../components/settings/NotificationsSection'

const { Title } = Typography

/**
 * PersonalSettings Page - Main settings page with tabbed interface
 * All authenticated users can access this page  
 * Organizes settings into 5 categories: Profile, Accounts, Security, Appearance, Notifications
 */
export default function PersonalSettings() {
    const [activeTab, setActiveTab] = useState('profile')

    const tabs = [
        {
            key: 'profile',
            label: (
                <span>
                    <UserOutlined />
                    プロフィール
                </span>
            ),
            children: <ProfileSection />
        },
        {
            key: 'accounts',
            label: (
                <span>
                    <LinkOutlined />
                    アカウント
                </span>
            ),
            children: <AccountsSection />
        },
        {
            key: 'security',
            label: (
                <span>
                    <SafetyOutlined />
                    セキュリティ
                </span>
            ),
            children: <SecuritySection />
        },
        {
            key: 'appearance',
            label: (
                <span>
                    <BgColorsOutlined />
                    外観
                </span>
            ),
            children: <AppearanceSection />
        },
        {
            key: 'notifications',
            label: (
                <span>
                    <BellOutlined />
                    通知
                </span>
            ),
            children: <NotificationsSection />
        }
    ]

    return (
        <div style={{ maxWidth: 900, margin: '0 auto', padding: 24 }}>
            <Title level={2} style={{ marginBottom: 24 }}>
                個人設定
            </Title>

            <Tabs
                activeKey={activeTab}
                onChange={setActiveTab}
                items={tabs}
                size="large"
            />
        </div>
    )
}
