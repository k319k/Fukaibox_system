import { create } from 'zustand'
import { persist } from 'zustand/middleware'

/**
 * 認証状態管理ストア
 * Discord/ゲストログイン、ユーザー情報、認証トークン
 */
export const useAuthStore = create(
    persist(
        (set, get) => ({
            // State
            user: null,
            token: null,
            isLoggedIn: false,
            isGicho: false,
            isLoading: false,
            error: null,

            // Actions
            setUser: (user, token) => set({
                user,
                token,
                isLoggedIn: !!user,
                isGicho: user?.role === 'gicho',  // Backend uses lowercase
                error: null,
            }),

            login: async (type, credentials) => {
                set({ isLoading: true, error: null })
                try {
                    try {
                        if (type === 'guest') {
                            // ... existing guest logic ...
                            const endpoint = '/auth/guest' // Relative path for proxy or same-origin
                            const baseUrl = window.location.origin.includes('localhost')
                                ? 'http://localhost:8000/api'
                                : 'https://fukaibox.kanjousekai.jp/api'

                            const response = await fetch(`${baseUrl}${endpoint}`, {
                                method: 'POST',
                                headers: { 'Content-Type': 'application/json' },
                                body: JSON.stringify(credentials),
                            })

                            if (!response.ok) throw new Error('Login failed')
                            const data = await response.json()

                            set({
                                user: {
                                    id: data.user_id,
                                    username: data.username,
                                    displayName: data.username,
                                    role: 'GUEST',
                                },
                                token: data.access_token,
                                isLoggedIn: true,
                                isGicho: false,
                                isLoading: false,
                            })
                        } else {
                            // Discord OAuth - Direct Redirect
                            const baseUrl = window.location.origin.includes('localhost')
                                ? 'http://localhost:8000'
                                : 'https://fukaibox.kanjousekai.jp' // Explicit production URL

                            const redirectUrl = `${baseUrl}/api/auth/discord/login`
                            console.log('Redirecting to Discord login:', redirectUrl)
                            window.location.href = redirectUrl
                            // Execution stops here as page redirects
                            return
                        }
                    } catch (error) {
                        console.error('Auth login error:', error)
                        set({ error: error.message, isLoading: false })
                    }
                } catch (error) {
                    set({ error: error.message, isLoading: false })
                }
            },

            logout: () => set({
                user: null,
                token: null,
                isLoggedIn: false,
                isGicho: false,
                error: null,
            }),

            refreshToken: async () => {
                const { token } = get()
                if (!token) return

                try {
                    const baseUrl = window.location.origin.includes('localhost')
                        ? 'http://localhost:8000'
                        : 'https://fukaibox.kanjousekai.jp/api'

                    const response = await fetch(`${baseUrl}/auth/refresh`, {
                        method: 'POST',
                        headers: {
                            'Authorization': `Bearer ${token}`,
                        },
                    })

                    if (!response.ok) {
                        // Token refresh failed, logout user
                        get().logout()
                        return
                    }

                    const data = await response.json()
                    set({ token: data.access_token })
                } catch (error) {
                    console.error('Token refresh failed:', error)
                    get().logout()
                }
            },

            checkAuth: async () => {
                const { token } = get()
                if (!token) return

                try {
                    // 本番環境対応：window.locationからベースURLを取得
                    const baseUrl = window.location.origin.includes('localhost')
                        ? 'http://localhost:8000'  // 開発環境
                        : 'https://fukaibox.kanjousekai.jp/api'  // 本番環境

                    const response = await fetch(`${baseUrl}/auth/me`, {
                        headers: {
                            'Authorization': `Bearer ${token}`,
                        },
                    })

                    if (!response.ok) {
                        get().logout()
                        return
                    }

                    const user = await response.json()
                    set({
                        user,
                        isLoggedIn: true,
                        isGicho: user.role === 'gicho',  // Backend uses lowercase
                    })
                } catch {
                    get().logout()
                }
            },

            // Setup auto token refresh (every 6 hours)
            setupAutoRefresh: () => {
                const refreshInterval = setInterval(() => {
                    const { token, isLoggedIn } = get()
                    if (token && isLoggedIn) {
                        get().refreshToken()
                    }
                }, 6 * 60 * 60 * 1000) // 6 hours

                // Return cleanup function
                return () => clearInterval(refreshInterval)
            },
        }),
        {
            name: 'fukaibox-auth',
            // Persist all state including isLoggedIn and isGicho
            // This is simpler than using onRehydrateStorage
        }
    )
)
