import { useState, useEffect, useCallback } from 'react'
import { Card, Form, Switch, Button, message } from 'antd'
import { SafetyOutlined } from '@ant-design/icons'
import { useAuthStore } from '../../store/authStore'
import useUserStore from '../../store/userStore'

const getApiUrl = () => {
    return window.location.origin.includes('localhost')
        ? 'http://localhost:8000'
        : 'https://fukaibox.kanjousekai.jp/api'
}

/**
 * SecuritySection Component
 * Manages security settings like login alerts and 2FA
 * Props: none
 */
export default function SecuritySection() {
    const { token } = useAuthStore()
    const { securitySettings, setSecuritySettings } = useUserStore()
    const [form] = Form.useForm()
    const [loading, setLoading] = useState(false)

    const fetchSettings = useCallback(async () => {
        try {
            const apiUrl = getApiUrl()
            const response = await fetch(`${apiUrl}/users/me/security`, {
                headers: { 'Authorization': `Bearer ${token}` }
            })
            if (!response.ok) throw new Error('Failed to fetch security settings')
            const data = await response.json()
            setSecuritySettings(data)
            form.setFieldsValue(data)
        } catch (error) {
            message.error('セキュリティ設定の取得に失敗しました')
            console.error(error)
        }
    }, [token, setSecuritySettings, form])

    useEffect(() => {
        fetchSettings()
    }, [fetchSettings])

    const handleSave = async (values) => {
        setLoading(true)
        try {
            const apiUrl = getApiUrl()
            const response = await fetch(`${apiUrl}/users/me/security`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(values)
            })
            if (!response.ok) throw new Error('Failed to update security settings')
            const data = await response.json()
            setSecuritySettings(data)
            message.success('セキュリティ設定を保存しました')
        } catch (error) {
            message.error('保存に失敗しました')
            console.error(error)
        } finally {
            setLoading(false)
        }
    }

    return (
        <Card title={<><SafetyOutlined /> セキュリティ設定</>}>
            <Form
                form={form}
                layout="vertical"
                onFinish={handleSave}
                initialValues={securitySettings}
            >
                <Form.Item
                    label="ログインアラート"
                    name="loginAlerts"
                    valuePropName="checked"
                    extra="新しいデバイスからログインした時に通知"
                >
                    <Switch />
                </Form.Item>

                <Form.Item
                    label="2段階認証 (準備中)"
                    name="twoFactorEnabled"
                    valuePropName="checked"
                    extra="将来実装予定の機能です"
                >
                    <Switch disabled />
                </Form.Item>

                <Form.Item>
                    <Button type="primary" htmlType="submit" loading={loading}>
                        保存
                    </Button>
                </Form.Item>
            </Form>
        </Card>
    )
}
