import { useState, useEffect, useCallback } from 'react'
import { Card, Form, Select, Button, ColorPicker, Slider, message } from 'antd'
import { BgColorsOutlined } from '@ant-design/icons'
import { useAuthStore } from '../../store/authStore'
import useUserStore from '../../store/userStore'

const getApiUrl = () => {
    return window.location.origin.includes('localhost')
        ? 'http://localhost:8000'
        : 'https://fukaibox.kanjousekai.jp/api'
}

/**
 * AppearanceSection Component  
 * Handles theme, color, language, and font size preferences
 * Props: none
 */
export default function AppearanceSection() {
    const { token } = useAuthStore()
    const { appearancePreferences, setAppearancePreferences } = useUserStore()
    const [form] = Form.useForm()
    const [loading, setLoading] = useState(false)

    const fetchPreferences = useCallback(async () => {
        try {
            const apiUrl = getApiUrl()
            const response = await fetch(`${apiUrl}/users/me/preferences`, {
                headers: { 'Authorization': `Bearer ${token}` }
            })
            if (!response.ok) throw new Error('Failed to fetch preferences')
            const data = await response.json()
            if (Object.keys(data).length > 0) {
                setAppearancePreferences(data)
                form.setFieldsValue(data)
            } else {
                form.setFieldsValue(appearancePreferences)
            }
        } catch (error) {
            message.error('設定の取得に失敗しました')
            console.error(error)
        }
    }, [token, setAppearancePreferences, form, appearancePreferences])

    useEffect(() => {
        fetchPreferences()
    }, [fetchPreferences])

    const handleSave = async (values) => {
        setLoading(true)
        try {
            const apiUrl = getApiUrl()
            const response = await fetch(`${apiUrl}/users/me/preferences`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(values)
            })
            if (!response.ok) throw new Error('Failed to update preferences')
            const data = await response.json()
            setAppearancePreferences(data)
            message.success('外観設定を保存しました')
        } catch (error) {
            message.error('保存に失敗しました')
            console.error(error)
        } finally {
            setLoading(false)
        }
    }

    return (
        <Card title={<><BgColorsOutlined /> 外観カスタマイズ</>}>
            <Form
                form={form}
                layout="vertical"
                onFinish={handleSave}
                initialValues={appearancePreferences}
            >
                <Form.Item
                    label="テーマ"
                    name="theme"
                >
                    <Select>
                        <Select.Option value="light">ライト</Select.Option>
                        <Select.Option value="dark">ダーク</Select.Option>
                        <Select.Option value="auto">自動</Select.Option>
                    </Select>
                </Form.Item>

                <Form.Item
                    label="プライマリーカラー"
                    name="color"
                >
                    <ColorPicker
                        showText
                        format="hex"
                    />
                </Form.Item>

                <Form.Item
                    label="言語"
                    name="language"
                >
                    <Select>
                        <Select.Option value="ja">日本語</Select.Option>
                        <Select.Option value="en">English</Select.Option>
                    </Select>
                </Form.Item>

                <Form.Item
                    label="フォントサイズ"
                    name="fontSize"
                >
                    <Slider
                        min={12}
                        max={20}
                        marks={{ 12: '小', 14: '中', 16: '大', 20: '特大' }}
                    />
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
