import { useState, useEffect, useCallback } from 'react'
import { Card, Form, Switch, Button, message, Space } from 'antd'
import { BellOutlined } from '@ant-design/icons'
import { useAuthStore } from '../../store/authStore'
import useUserStore from '../../store/userStore'

const getApiUrl = () => {
    return window.location.origin.includes('localhost')
        ? 'http://localhost:8000'
        : 'https://fukaibox.kanjousekai.jp/api'
}

/**
 * NotificationsSection Component
 * Manages notification preferences for email, browser, and event types
 * Props: none
 */
export default function NotificationsSection() {
    const { token } = useAuthStore()
    const { notificationPreferences, setNotificationPreferences } = useUserStore()
    const [form] = Form.useForm()
    const [loading, setLoading] = useState(false)

    const fetchPreferences = useCallback(async () => {
        try {
            const apiUrl = getApiUrl()
            const response = await fetch(`${apiUrl}/users/me/notifications`, {
                headers: { 'Authorization': `Bearer ${token}` }
            })
            if (!response.ok) throw new Error('Failed to fetch notifications')
            const data = await response.json()
            setNotificationPreferences(data)
            form.setFieldsValue(data)
        } catch (error) {
            message.error('通知設定の取得に失敗しました')
            console.error(error)
        }
    }, [token, setNotificationPreferences, form])

    useEffect(() => {
        fetchPreferences()
    }, [fetchPreferences])

    const handleSave = async (values) => {
        setLoading(true)
        try {
            const apiUrl = getApiUrl()
            const response = await fetch(`${apiUrl}/users/me/notifications`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(values)
            })
            if (!response.ok) throw new Error('Failed to update notifications')
            const data = await response.json()
            setNotificationPreferences(data)
            message.success('通知設定を保存しました')
        } catch (error) {
            message.error('保存に失敗しました')
            console.error(error)
        } finally {
            setLoading(false)
        }
    }

    return (
        <Card title={<><BellOutlined /> 通知設定</>}>
            <Form
                form={form}
                layout="vertical"
                onFinish={handleSave}
                initialValues={notificationPreferences}
            >
                <Space direction="vertical" size="large" style={{ width: '100%' }}>
                    <Form.Item
                        label="メール通知"
                        name="email"
                        valuePropName="checked"
                    >
                        <Switch />
                    </Form.Item>

                    <Form.Item
                        label="ブラウザ通知"
                        name="browser"
                        valuePropName="checked"
                    >
                        <Switch />
                    </Form.Item>

                    <div style={{ marginTop: 24, marginBottom: 8 }}>
                        <strong>通知する内容</strong>
                    </div>

                    <Form.Item
                        label="画像アップロード通知"
                        name="upload"
                        valuePropName="checked"
                        extra="自分が作成したシートに画像がアップロードされた時"
                    >
                        <Switch />
                    </Form.Item>

                    <Form.Item
                        label="画像採用通知"
                        name="adoption"
                        valuePropName="checked"
                        extra="自分がアップロードした画像が採用された時"
                    >
                        <Switch />
                    </Form.Item>

                    <Form.Item
                        label="点数変動通知"
                        name="points"
                        valuePropName="checked"
                        extra="点数が増減した時"
                    >
                        <Switch />
                    </Form.Item>
                </Space>

                <Form.Item style={{ marginTop: 32 }}>
                    <Button type="primary" htmlType="submit" loading={loading}>
                        保存
                    </Button>
                </Form.Item>
            </Form>
        </Card>
    )
}
