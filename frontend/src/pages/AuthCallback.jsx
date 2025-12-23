import { useEffect } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { Spin, Result, Typography } from 'antd'
import { useAuthStore } from '../store/authStore'

const { Text } = Typography

/**
 * Discord OAuth2コールバックハンドラー
 * URLパラメータからトークンを取得してストアに保存
 */
export default function AuthCallback() {
    const navigate = useNavigate()
    const [searchParams] = useSearchParams()
    const { setUser } = useAuthStore()

    useEffect(() => {
        const token = searchParams.get('token')
        const error = searchParams.get('error')
        const userId = searchParams.get('user_id')
        const username = searchParams.get('username')
        const role = searchParams.get('role')
        const avatarUrl = searchParams.get('avatar_url')

        if (error) {
            // Handle error
            console.error('Auth error:', error)
            setTimeout(() => navigate('/'), 3000)
            return
        }

        if (token && userId) {
            // Save user info to store
            const user = {
                id: userId,
                username: username || 'User',
                displayName: username || 'User',
                role: role || 'GIIN',
                avatarUrl: avatarUrl || null,
            }

            setUser(user, token)

            // Redirect to home
            navigate('/')
        } else {
            // No token, redirect to home
            navigate('/')
        }
    }, [searchParams, setUser, navigate])

    const error = searchParams.get('error')

    if (error) {
        return (
            <div style={{
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                minHeight: '100vh',
                background: '#fdfaf5'
            }}>
                <Result
                    status="error"
                    title="ログインに失敗しました"
                    subTitle={<Text type="secondary">エラー: {error}</Text>}
                    extra={<Text type="secondary">3秒後にホームに戻ります...</Text>}
                />
            </div>
        )
    }

    return (
        <div style={{
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            minHeight: '100vh',
            background: '#fdfaf5'
        }}>
            <div style={{ textAlign: 'center' }}>
                <Spin size="large" />
                <div style={{ marginTop: 16 }}>
                    <Text type="secondary">ログイン処理中...</Text>
                </div>
            </div>
        </div>
    )
}
