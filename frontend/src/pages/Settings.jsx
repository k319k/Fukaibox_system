import { useState, useEffect } from 'react'
import { Card, Form, InputNumber, Button, message, Typography } from 'antd'
import { SettingOutlined } from '@ant-design/icons'
import { useAuthStore } from '../store/authStore'

const { Title, Text } = Typography

// Helper function to get API URL
const getApiUrl = () => {
    return window.location.origin.includes('localhost')
        ? 'http://localhost:8000'
        : 'https://fukaibox.kanjousekai.jp/api'
}

/**
 * Settings Page - Reward Configuration
 * Gicho-only page for configuring point rewards
 */
export default function Settings() {
    const { isGicho, token } = useAuthStore()
    const [loading, setLoading] = useState(false)
    const [settings, setSettings] = useState({
        upload_points: 5,
        adoption_points: 20
    })

    useEffect(() => {
        fetchSettings()
    }, [])

    const fetchSettings = async () => {
        try {
            const apiUrl = getApiUrl()
            const response = await fetch(`${apiUrl}/settings/rewards`, {
                headers: { 'Authorization': `Bearer ${token}` }
            })

            if (!response.ok) throw new Error('Failed to fetch settings')

            const data = await response.json()
            setSettings(data)
        } catch (error) {
            message.error('設定の取得に失敗しました')
            console.error(error)
        }
    }

    const handleSave = async () => {
        setLoading(true)
        try {
            const apiUrl = getApiUrl()
            const response = await fetch(`${apiUrl}/settings/rewards`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(settings)
            })

            if (!response.ok) throw new Error('Failed to update settings')

            message.success('設定を保存しました')
        } catch (error) {
            message.error('保存に失敗しました')
            console.error(error)
        } finally {
            setLoading(false)
        }
    }

    if (!isGicho) {
        return (
            <div style={{ maxWidth: 800, margin: '0 auto', padding: 24 }}>
                <Card>
                    <Text type="secondary">儀長のみアクセス可能です</Text>
                </Card>
            </div>
        )
    }

    return (
        <div style={{ maxWidth: 800, margin: '0 auto', padding: 24 }}>
            <Title level={2} style={{ marginBottom: 24 }}>
                <SettingOutlined /> 点数設定
            </Title>

            <Card>
                <Form layout="vertical">
                    <Form.Item
                        label={<span style={{ fontWeight: 600 }}>画像アップロード時の点数</span>}
                    >
                        <InputNumber
                            min={0}
                            max={100}
                            value={settings.upload_points}
                            onChange={(value) => setSettings({ ...settings, upload_points: value })}
                            style={{ width: 200 }}
                            size="large"
                        />
                        <div style={{ fontSize: 12, color: '#666', marginTop: 8 }}>
                            ユーザーが画像をアップロードした時に付与される点数
                        </div>
                    </Form.Item>

                    <Form.Item
                        label={<span style={{ fontWeight: 600 }}>画像採用時のボーナス点数</span>}
                        style={{ marginTop: 24 }}
                    >
                        <InputNumber
                            min={0}
                            max={100}
                            value={settings.adoption_points}
                            onChange={(value) => setSettings({ ...settings, adoption_points: value })}
                            style={{ width: 200 }}
                            size="large"
                        />
                        <div style={{ fontSize: 12, color: '#666', marginTop: 8 }}>
                            アップロードした画像が採用された時に追加で付与される点数
                        </div>
                    </Form.Item>

                    <Form.Item style={{ marginTop: 32 }}>
                        <Button
                            type="primary"
                            onClick={handleSave}
                            loading={loading}
                            size="large"
                        >
                            保存
                        </Button>
                    </Form.Item>
                </Form>
            </Card>
        </div>
    )
}
