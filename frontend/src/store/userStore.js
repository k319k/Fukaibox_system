import { create } from 'zustand'
import { persist } from 'zustand/middleware'

/**
 * User Settings Store - Manages user preferences and settings
 * Persists appearance preferences to localStorage
 */
const useUserStore = create(
    persist(
        (set, get) => ({
            // Profile state
            profile: null,

            // Appearance preferences
            appearancePreferences: {
                theme: 'light',
                color: '#1890ff',
                language: 'ja',
                fontSize: 14
            },

            // Notification preferences
            notificationPreferences: {
                email: false,
                browser: true,
                upload: true,
                adoption: true,
                points: true
            },

            // Security settings
            securitySettings: {
                loginAlerts: true,
                twoFactorEnabled: false
            },

            // Linked accounts
            linkedAccounts: {
                discord_id: null,
                google_id: null,
                has_password: false
            },

            // Actions
            setProfile: (profile) => set({ profile }),

            setAppearancePreferences: (preferences) => set({
                appearancePreferences: { ...get().appearancePreferences, ...preferences }
            }),

            setNotificationPreferences: (preferences) => set({
                notificationPreferences: { ...get().notificationPreferences, ...preferences }
            }),

            setSecuritySettings: (settings) => set({
                securitySettings: { ...get().securitySettings, ...settings }
            }),

            setLinkedAccounts: (accounts) => set({ linkedAccounts: accounts }),

            // Reset all settings
            resetSettings: () => set({
                appearancePreferences: {
                    theme: 'light',
                    color: '#1890ff',
                    language: 'ja',
                    fontSize: 14
                },
                notificationPreferences: {
                    email: false,
                    browser: true,
                    upload: true,
                    adoption: true,
                    points: true
                },
                securitySettings: {
                    loginAlerts: true,
                    twoFactorEnabled: false
                }
            })
        }),
        {
            name: 'fukaibox-user-settings',
            // Only persist appearance preferences
            partialize: (state) => ({
                appearancePreferences: state.appearancePreferences
            })
        }
    )
)

export default useUserStore
