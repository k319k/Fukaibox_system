import { useState, useEffect, useCallback } from 'react'
import { Card, Form, Input, Button, Upload, Avatar, message } from 'antd'
import { UserOutlined, UploadOutlined } from '@ant-design/icons'
import { useAuthStore } from '../../store/authStore'
import useUserStore from '../../store/userStore'

// Helper function to get API URL
const getApiUrl = () => {
    return window.location.origin.includes('localhost')
        ? 'http://localhost:8000'
        : 'https://fukaibox.kanjousekai.jp/api'
}

/**
 * ProfileSection Component
 * Handles profile editing: username, display name, and profile image
 * Props: none
 */
export default function ProfileSection() {
    const { token, user, setUser } = useAuthStore()
    const { setProfile } = useUserStore()
    const [form] = Form.useForm()
    const [loading, setLoading] = useState(false)
    const [imageUrl, setImageUrl] = useState(null)

    const fetchProfile = useCallback(async () => {
        try {
            const apiUrl = getApiUrl()
            const response = await fetch(`${apiUrl}/users/me/profile`, {
                headers: { 'Authorization': `Bearer ${token}` }
            })
            if (!response.ok) throw new Error('Failed to fetch profile')
            const data = await response.json()
            setProfile(data)
            form.setFieldsValue({
                username: data.username,
                display_name: data.display_name || ''
            })
            setImageUrl(data.profile_image_url || data.avatar_url)
        } catch (error) {
            message.error('プロフィールの取得に失敗しました')
            console.error(error)
        }
    }, [token, setProfile, form])

    useEffect(() => {
        fetchProfile()
    }, [fetchProfile])

    const handleSave = async (values) => {
        setLoading(true)
        try {
            const apiUrl = getApiUrl()
            const response = await fetch(`${apiUrl}/users/me/profile`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(values)
            })
            if (!response.ok) {
                const error = await response.json()
                throw new Error(error.detail || 'Failed to update profile')
            }
            const data = await response.json()
            setProfile(data)
            setUser({ ...user, username: data.username, display_name: data.display_name })
            message.success('プロフィールを更新しました')
        } catch (error) {
            message.error(error.message || '更新に失敗しました')
            console.error(error)
        } finally {
            setLoading(false)
        }
    }

    const handleImageUpload = async ({ file }) => {
        const formData = new FormData()
        formData.append('file', file)

        try {
            const apiUrl = getApiUrl()
            const response = await fetch(`${apiUrl}/users/me/profile/image`, {
                method: 'POST',
                headers: { 'Authorization': `Bearer ${token}` },
                body: formData
            })
            if (!response.ok) throw new Error('Failed to upload image')
            const data = await response.json()
            setImageUrl(data.profile_image_url)
            message.success('プロフィール画像を更新しました')
        } catch (error) {
            message.error('画像のアップロードに失敗しました')
            console.error(error)
        }
    }

    return (
        <Card title="プロフィール設定">
            <div style={{ marginBottom: 24, textAlign: 'center' }}>
                <Avatar
                    size={120}
                    src={imageUrl}
                    icon={<UserOutlined />}
                    style={{ marginBottom: 16 }}
                />
                <br />
                <Upload
                    accept="image/*"
                    showUploadList={false}
                    customRequest={handleImageUpload}
                >
                    <Button icon={<UploadOutlined />}>プロフィール画像を変更</Button>
                </Upload>
            </div>

            <Form
                form={form}
                layout="vertical"
                onFinish={handleSave}
            >
                <Form.Item
                    label="ユーザー名"
                    name="username"
                    rules={[{ required: true, message: 'ユーザー名を入力してください' }]}
                >
                    <Input />
                </Form.Item>

                <Form.Item
                    label="表示名"
                    name="display_name"
                >
                    <Input placeholder="ニックネームや本名など" />
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
