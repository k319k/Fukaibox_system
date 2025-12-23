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
                    const endpoint = type === 'guest'
                        ? '/auth/guest'
                        : '/auth/discord/login'

                    // 本番環境対応：window.locationからベースURLを取得
                    const baseUrl = window.location.origin.includes('localhost')
                        ? 'http://localhost:8000'  // 開発環境
                        : 'https://fukaibox.kanjousekai.jp/api'  // 本番環境

                    const response = await fetch(`${baseUrl}${endpoint}`, {
                        method: type === 'guest' ? 'POST' : 'GET',
                        headers: { 'Content-Type': 'application/json' },
                        body: type === 'guest' ? JSON.stringify(credentials) : undefined,
                    })

                    if (!response.ok) {
                        throw new Error('Login failed')
                    }

                    const data = await response.json()

                    if (type === 'guest') {
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
                        // Discord OAuth redirects
                        window.location.href = data.redirect_url
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
