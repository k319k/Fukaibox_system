import { useState, useEffect, useCallback } from 'react'
import { Card, Form, Input, Button, message, Tag, Space } from 'antd'
import { GoogleOutlined, MessageOutlined, LinkOutlined, DisconnectOutlined } from '@ant-design/icons'
import { useAuthStore } from '../../store/authStore'
import useUserStore from '../../store/userStore'

const getApiUrl = () => {
    return window.location.origin.includes('localhost')
        ? 'http://localhost:8000'
        : 'https://fukaibox.kanjousekai.jp/api'
}

/**
 * AccountsSection Component
 * Manages linked accounts (Google, Discord)
 * Props: none
 */
export default function AccountsSection() {
    const { token } = useAuthStore()
    const { linkedAccounts, setLinkedAccounts } = useUserStore()
    const [loading, setLoading] = useState(false)
    const [passwordForm] = Form.useForm()

    const fetchLinkedAccounts = useCallback(async () => {
        try {
            const apiUrl = getApiUrl()
            const response = await fetch(`${apiUrl}/users/me/linked-accounts`, {
                headers: { 'Authorization': `Bearer ${token}` }
            })
            if (!response.ok) throw new Error('Failed to fetch linked accounts')
            const data = await response.json()
            setLinkedAccounts(data)
        } catch (error) {
            message.error('連携アカウント情報の取得に失敗しました')
            console.error(error)
        }
    }, [token, setLinkedAccounts])

    useEffect(() => {
        fetchLinkedAccounts()
    }, [fetchLinkedAccounts])

    const handlePasswordChange = async (values) => {
        setLoading(true)
        try {
            const apiUrl = getApiUrl()
            const response = await fetch(`${apiUrl}/users/me/change-password`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({
                    current_password: values.current_password,
                    new_password: values.new_password
                })
            })
            if (!response.ok) {
                const error = await response.json()
                throw new Error(error.detail || 'Failed to change password')
            }
            message.success('パスワードを変更しました')
            passwordForm.resetFields()
            fetchLinkedAccounts()
        } catch (error) {
            message.error(error.message || 'パスワード変更に失敗しました')
        } finally {
            setLoading(false)
        }
    }

    return (
        <Card title="アカウント連携">
            <Space direction="vertical" size="large" style={{ width: '100%' }}>
                {/* Discord Account */}
                <div>
                    <div style={{ marginBottom: 8 }}>
                        <MessageOutlined style={{ marginRight: 8 }} />
                        <strong>Discord</strong>
                    </div>
                    {linkedAccounts.discord_id ? (
                        <Tag color="blue" icon={<LinkOutlined />}>
                            連携済み (ID: {linkedAccounts.discord_id})
                        </Tag>
                    ) : (
                        <Tag color="default">未連携</Tag>
                    )}
                </div>

                {/* Google Account */}
                <div>
                    <div style={{ marginBottom: 8 }}>
                        <GoogleOutlined style={{ marginRight: 8 }} />
                        <strong>Google</strong>
                    </div>
                    {linkedAccounts.google_id ? (
                        <Space>
                            <Tag color="green" icon={<LinkOutlined />}>
                                連携済み (ID: {linkedAccounts.google_id})
                            </Tag>
                            <Button
                                size="small"
                                danger
                                icon={<DisconnectOutlined />}
                                disabled
                            >
                                連携解除 (準備中)
                            </Button>
                        </Space>
                    ) : (
                        <Button icon={<GoogleOutlined />} disabled>
                            Googleアカウントと連携 (準備中)
                        </Button>
                    )}
                </div>

                {/* Password Section (for non-Discord users) */}
                {!linkedAccounts.discord_id && (
                    <Card type="inner" title="パスワード設定">
                        <Form
                            form={passwordForm}
                            layout="vertical"
                            onFinish={handlePasswordChange}
                        >
                            {linkedAccounts.has_password && (
                                <Form.Item
                                    label="現在のパスワード"
                                    name="current_password"
                                    rules={[{ required: true, message: '現在のパスワードを入力してください' }]}
                                >
                                    <Input.Password />
                                </Form.Item>
                            )}

                            <Form.Item
                                label={linkedAccounts.has_password ? '新しいパスワード' : 'パスワード'}
                                name="new_password"
                                rules={[
                                    { required: true, message: 'パスワードを入力してください' },
                                    { min: 8, message: 'パスワードは8文字以上必要です' }
                                ]}
                            >
                                <Input.Password />
                            </Form.Item>

                            <Form.Item
                                label="パスワード確認"
                                name="confirm_password"
                                dependencies={['new_password']}
                                rules={[
                                    { required: true, message: 'パスワードを再入力してください' },
                                    ({ getFieldValue }) => ({
                                        validator(_, value) {
                                            if (!value || getFieldValue('new_password') === value) {
                                                return Promise.resolve()
                                            }
                                            return Promise.reject(new Error('パスワードが一致しません'))
                                        }
                                    })
                                ]}
                            >
                                <Input.Password />
                            </Form.Item>

                            <Form.Item>
                                <Button type="primary" htmlType="submit" loading={loading}>
                                    {linkedAccounts.has_password ? 'パスワードを変更' : 'パスワードを設定'}
                                </Button>
                            </Form.Item>
                        </Form>
                    </Card>
                )}

                {linkedAccounts.discord_id && (
                    <div style={{ fontSize: 12, color: '#666' }}>
                        Discordアカウントでログインしているため、パスワード設定は不要です。
                    </div>
                )}
            </Space>
        </Card>
    )
}
