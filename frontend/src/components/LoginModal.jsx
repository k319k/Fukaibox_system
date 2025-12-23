import { useState } from 'react'
import { Modal, Button, Input, Typography, Divider, Space, message } from 'antd'
import { DiscordOutlined, UserOutlined, CrownOutlined, TeamOutlined } from '@ant-design/icons'
import { useAuthStore } from '../store/authStore'

const { Title, Text } = Typography

/**
 * ログインモーダル
 * 儀長モード/一般モードの選択、Discord認証、ゲストログイン
 */
export default function LoginModal({ open, onClose }) {
    const [mode, setMode] = useState(null) // 'gicho' | 'general' | null
    const [guestName, setGuestName] = useState('')
    const [loading, setLoading] = useState(false)
    const { login } = useAuthStore()

    const handleDiscordLogin = () => {
        // Discord OAuth2認証開始
        // 本番環境対応：window.locationからベースURLを取得
        const baseUrl = window.location.origin.includes('localhost')
            ? 'http://localhost:8000'  // 開発環境
            : 'https://fukaibox.kanjousekai.jp/api'  // 本番環境
        window.location.href = `${baseUrl}/auth/discord/login`
    }

    const handleGuestLogin = async () => {
        if (!guestName.trim()) {
            message.error('ユーザー名を入力してください')
            return
        }

        setLoading(true)
        try {
            await login('guest', { username: guestName.trim() })
            message.success('ログインしました')
            onClose()
        } catch (error) {
            message.error('ログインに失敗しました')
        } finally {
            setLoading(false)
        }
    }

    const handleBack = () => {
        setMode(null)
        setGuestName('')
    }

    const handleClose = () => {
        setMode(null)
        setGuestName('')
        onClose()
    }

    // Mode selection screen
    if (mode === null) {
        return (
            <Modal
                open={open}
                onCancel={handleClose}
                footer={null}
                centered
                width={400}
            >
                <div style={{ textAlign: 'center', padding: '24px 0' }}>
                    <Title level={3} style={{ marginBottom: 8 }}>封解Boxへようこそ</Title>
                    <Text type="secondary">ログインモードを選択してください</Text>

                    <div style={{ marginTop: 32 }}>
                        <Space direction="vertical" size="large" style={{ width: '100%' }}>
                            <Button
                                type="primary"
                                size="large"
                                icon={<CrownOutlined />}
                                block
                                onClick={() => setMode('gicho')}
                                style={{ height: 56, fontSize: 16 }}
                            >
                                儀長としてログイン
                            </Button>

                            <Button
                                size="large"
                                icon={<TeamOutlined />}
                                block
                                onClick={() => setMode('general')}
                                style={{ height: 56, fontSize: 16 }}
                            >
                                一般としてログイン
                            </Button>
                        </Space>
                    </div>

                    <div style={{ marginTop: 24 }}>
                        <Text type="secondary" style={{ fontSize: 12 }}>
                            儀長はシートの作成・管理ができます
                        </Text>
                    </div>
                </div>
            </Modal>
        )
    }

    // Gicho mode - Discord only
    if (mode === 'gicho') {
        return (
            <Modal
                open={open}
                onCancel={handleClose}
                footer={null}
                centered
                width={400}
            >
                <div style={{ textAlign: 'center', padding: '24px 0' }}>
                    <CrownOutlined style={{ fontSize: 48, color: 'var(--color-primary)', marginBottom: 16 }} />
                    <Title level={3} style={{ marginBottom: 8 }}>儀長ログイン</Title>
                    <Text type="secondary">Discord認証で儀長権限を確認します</Text>

                    <div style={{ marginTop: 32 }}>
                        <Button
                            type="primary"
                            size="large"
                            icon={<DiscordOutlined />}
                            block
                            onClick={handleDiscordLogin}
                            style={{
                                height: 56,
                                fontSize: 16,
                                background: '#5865F2',
                                borderColor: '#5865F2'
                            }}
                        >
                            Discordでログイン
                        </Button>
                    </div>

                    <div style={{ marginTop: 24 }}>
                        <Button type="link" onClick={handleBack}>
                            ← モード選択に戻る
                        </Button>
                    </div>
                </div>
            </Modal>
        )
    }

    // General mode - Discord or Guest
    return (
        <Modal
            open={open}
            onCancel={handleClose}
            footer={null}
            centered
            width={400}
        >
            <div style={{ textAlign: 'center', padding: '24px 0' }}>
                <TeamOutlined style={{ fontSize: 48, color: 'var(--color-primary)', marginBottom: 16 }} />
                <Title level={3} style={{ marginBottom: 8 }}>一般ログイン</Title>
                <Text type="secondary">Discordまたはユーザー名でログイン</Text>

                <div style={{ marginTop: 32 }}>
                    <Space direction="vertical" size="middle" style={{ width: '100%' }}>
                        <Button
                            size="large"
                            icon={<DiscordOutlined />}
                            block
                            onClick={handleDiscordLogin}
                            style={{
                                height: 48,
                                background: '#5865F2',
                                borderColor: '#5865F2',
                                color: '#fff'
                            }}
                        >
                            Discordでログイン（推奨）
                        </Button>

                        <Divider plain>または</Divider>

                        <Input
                            size="large"
                            placeholder="ユーザー名を入力"
                            prefix={<UserOutlined />}
                            value={guestName}
                            onChange={(e) => setGuestName(e.target.value)}
                            onPressEnter={handleGuestLogin}
                            style={{ height: 48 }}
                        />

                        <Button
                            type="primary"
                            size="large"
                            block
                            loading={loading}
                            onClick={handleGuestLogin}
                            disabled={!guestName.trim()}
                            style={{ height: 48 }}
                        >
                            ゲストとしてログイン
                        </Button>
                    </Space>
                </div>

                <div style={{ marginTop: 16 }}>
                    <Text type="secondary" style={{ fontSize: 12 }}>
                        Discordログインで点数が貯まります
                    </Text>
                </div>

                <div style={{ marginTop: 16 }}>
                    <Button type="link" onClick={handleBack}>
                        ← モード選択に戻る
                    </Button>
                </div>
            </div>
        </Modal>
    )
}
