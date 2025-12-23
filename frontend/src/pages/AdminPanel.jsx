import { useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { Tabs, Card, Typography } from 'antd'
import { SettingOutlined, TeamOutlined, DatabaseOutlined } from '@ant-design/icons'
import { useAuthStore } from '../store/authStore'
import SettingsContent from '../components/admin/SettingsContent'
import UserManagementContent from '../components/admin/UserManagementContent'
import BackupManagementContent from '../components/admin/BackupManagementContent'

const { Title, Text } = Typography

/**
 * Admin Panel - Unified admin interface
 * Consolidates Settings, UserManagement, and BackupManagement
 */
export default function AdminPanel() {
    const { isGicho } = useAuthStore()
    const [searchParams, setSearchParams] = useSearchParams()

    // Initialize from URL parameter, default to 'settings'
    const initialTab = searchParams.get('tab') || 'settings'
    const [activeTab, setActiveTab] = useState(initialTab)

    const handleTabChange = (key) => {
        setActiveTab(key)
        setSearchParams({ tab: key })
    }

    if (!isGicho) {
        return (
            <div style={{ maxWidth: 1400, margin: '0 auto', padding: 24 }}>
                <Card>
                    <Text type="secondary">
                        儀長のみアクセス可能です
                    </Text>
                </Card>
            </div>
        )
    }

    const tabItems = [
        {
            key: 'settings',
            label: (
                <span>
                    <SettingOutlined />
                    報酬設定
                </span>
            ),
            children: <SettingsContent />
        },
        {
            key: 'users',
            label: (
                <span>
                    <TeamOutlined />
                    ユーザー管理
                </span>
            ),
            children: <UserManagementContent />
        },
        {
            key: 'backup',
            label: (
                <span>
                    <DatabaseOutlined />
                    バックアップ
                </span>
            ),
            children: <BackupManagementContent />
        }
    ]

    return (
        <div style={{ maxWidth: 1400, margin: '0 auto', padding: 24 }}>
            <Title level={2} style={{ marginBottom: 24 }}>
                管理パネル
            </Title>

            <Tabs
                activeKey={activeTab}
                onChange={handleTabChange}
                items={tabItems}
                size="large"
            />
        </div>
    )
}
