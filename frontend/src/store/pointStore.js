import { create } from 'zustand'

/**
 * 点数状態管理ストア
 * ユーザー点数、ランキング
 */
export const usePointStore = create((set) => ({
    // State
    points: 0,
    rank: 0,
    history: [],
    rankings: [],
    isLoading: false,
    error: null,

    // Actions
    fetchPoints: async (userId) => {
        set({ isLoading: true, error: null })
        try {
            const apiUrl = import.meta.env.VITE_API_URL || ''

            const response = await fetch(`${apiUrl}/v1/public/points/${userId}`)
            if (!response.ok) throw new Error('Failed to fetch points')

            const data = await response.json()
            set({
                points: data.points,
                rank: data.rank,
                isLoading: false
            })
        } catch (error) {
            set({ error: error.message, isLoading: false })
        }
    },

    fetchRankings: async (limit = 50) => {
        set({ isLoading: true, error: null })
        try {
            const apiUrl = import.meta.env.VITE_API_URL || ''

            const response = await fetch(`${apiUrl}/v1/public/users/list?limit=${limit}`)
            if (!response.ok) throw new Error('Failed to fetch rankings')

            const data = await response.json()
            set({ rankings: data.rankings, isLoading: false })
        } catch (error) {
            set({ error: error.message, isLoading: false })
        }
    },

    updatePoints: (points, rank) => set({ points, rank }),
}))
