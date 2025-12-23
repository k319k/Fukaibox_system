import { create } from 'zustand'
import { useAuthStore } from './authStore'  // Import authStore to get token

/**
 * シート状態管理ストア
 * シート一覧、詳細、CRUD操作
 */

// Helper function to get API URL based on environment
const getApiUrl = () => {
    return window.location.origin.includes('localhost')
        ? 'http://localhost:8000'  // 開発環境
        : 'https://fukaibox.kanjousekai.jp/api'  // 本番環境
}

// eslint-disable-next-line no-unused-vars
export const useSheetStore = create((set, get) => ({
    // State
    sheets: [],
    currentSheet: null,
    images: [],
    isLoading: false,
    error: null,

    // Actions
    fetchSheets: async (phase = null) => {
        set({ isLoading: true, error: null })
        try {
            const apiUrl = getApiUrl()
            const url = phase ? `${apiUrl}/sheets?phase=${phase}` : `${apiUrl}/sheets`
            const token = useAuthStore.getState().token  // Get token from authStore

            const response = await fetch(url, {
                headers: {
                    'Authorization': `Bearer ${token || ''}`,
                },
            })

            if (!response.ok) throw new Error('Failed to fetch sheets')

            const sheets = await response.json()
            set({ sheets, isLoading: false })
        } catch (error) {
            set({ error: error.message, isLoading: false })
        }
    },

    fetchSheet: async (id) => {
        set({ isLoading: true, error: null })
        try {
            const apiUrl = getApiUrl()
            const token = useAuthStore.getState().token  // Get token from authStore

            const [sheetRes, imagesRes] = await Promise.all([
                fetch(`${apiUrl}/sheets/${id}`, {
                    headers: {
                        'Authorization': `Bearer ${token || ''}`,
                    },
                }),
                fetch(`${apiUrl}/images/${id}/list`, {
                    headers: {
                        'Authorization': `Bearer ${token || ''}`,
                    },
                }),
            ])

            if (!sheetRes.ok) throw new Error('Sheet not found')

            const sheet = await sheetRes.json()
            const images = imagesRes.ok ? await imagesRes.json() : []

            set({ currentSheet: sheet, images, isLoading: false })
        } catch (error) {
            set({ error: error.message, isLoading: false })
        }
    },

    createSheet: async (title, isGiinOnly = false) => {
        set({ isLoading: true, error: null })
        try {
            const apiUrl = getApiUrl()
            const token = useAuthStore.getState().token  // Get token from authStore

            const response = await fetch(`${apiUrl}/sheets`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token || ''}`,
                },
                body: JSON.stringify({
                    title,
                    description: '',
                    script_content: '',
                    is_giin_only: isGiinOnly,
                    is_anonymous_allowed: true
                }),
            })

            if (!response.ok) throw new Error('Failed to create sheet')

            const sheet = await response.json()
            set((state) => ({
                sheets: [sheet, ...state.sheets],
                isLoading: false,
            }))

            return sheet
        } catch (error) {
            set({ error: error.message, isLoading: false })
            throw error
        }
    },

    updateScript: async (id, scriptContent) => {
        try {
            const apiUrl = getApiUrl()
            const token = useAuthStore.getState().token  // Get token from authStore

            const response = await fetch(`${apiUrl}/sheets/${id}/script`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token || ''}`,
                },
                body: JSON.stringify({ script_content: scriptContent }),
            })

            if (!response.ok) throw new Error('Failed to update script')

            const updatedSheet = await response.json()
            set({ currentSheet: updatedSheet })

            return updatedSheet
        } catch (error) {
            set({ error: error.message })
            throw error
        }
    },

    changePhase: async (id, phase) => {
        try {
            const apiUrl = getApiUrl()
            const token = useAuthStore.getState().token  // Get token from authStore

            const response = await fetch(`${apiUrl}/sheets/${id}/phase`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token || ''}`,
                },
                body: JSON.stringify({ phase }),
            })

            if (!response.ok) throw new Error('Failed to change phase')

            const updatedSheet = await response.json()
            set({ currentSheet: updatedSheet })

            return updatedSheet
        } catch (error) {
            set({ error: error.message })
            throw error
        }
    },

    clearCurrent: () => set({ currentSheet: null, images: [] }),
}))
