import { create } from 'zustand'
import { useAuthStore } from './authStore'

/**
 * スクリプトセクション状態管理ストア
 */

// Helper function to get API URL
const getApiUrl = () => {
    return window.location.origin.includes('localhost')
        ? 'http://localhost:8000'
        : 'https://fukaibox.kanjousekai.jp/api'
}

export const useSectionStore = create((set, get) => ({
    // State
    sections: [],
    isLoading: false,
    error: null,

    // Actions
    fetchSections: async (sheetId) => {
        set({ isLoading: true, error: null })
        try {
            const apiUrl = getApiUrl()
            const token = useAuthStore.getState().token

            const response = await fetch(`${apiUrl}/sheets/${sheetId}/sections`, {
                headers: {
                    'Authorization': `Bearer ${token || ''}`,
                },
            })

            if (!response.ok) throw new Error('Failed to fetch sections')

            const sections = await response.json()
            set({ sections, isLoading: false })
            return sections
        } catch (error) {
            set({ error: error.message, isLoading: false })
            throw error
        }
    },

    createSection: async (sheetId, sectionData) => {
        try {
            const apiUrl = getApiUrl()
            const token = useAuthStore.getState().token

            const response = await fetch(`${apiUrl}/sheets/${sheetId}/sections`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token || ''}`,
                },
                body: JSON.stringify(sectionData),
            })

            if (!response.ok) throw new Error('Failed to create section')

            const newSection = await response.json()
            set((state) => ({
                sections: [...state.sections, newSection].sort((a, b) => a.order - b.order)
            }))

            return newSection
        } catch (error) {
            set({ error: error.message })
            throw error
        }
    },

    updateSection: async (sectionId, updates) => {
        try {
            const apiUrl = getApiUrl()
            const token = useAuthStore.getState().token

            const response = await fetch(`${apiUrl}/sections/${sectionId}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token || ''}`,
                },
                body: JSON.stringify(updates),
            })

            if (!response.ok) throw new Error('Failed to update section')

            const updatedSection = await response.json()
            set((state) => ({
                sections: state.sections.map(s =>
                    s.id === sectionId ? updatedSection : s
                ).sort((a, b) => a.order - b.order)
            }))

            return updatedSection
        } catch (error) {
            set({ error: error.message })
            throw error
        }
    },

    deleteSection: async (sectionId) => {
        try {
            const apiUrl = getApiUrl()
            const token = useAuthStore.getState().token

            const response = await fetch(`${apiUrl}/sections/${sectionId}`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${token || ''}`,
                },
            })

            if (!response.ok) throw new Error('Failed to delete section')

            set((state) => ({
                sections: state.sections.filter(s => s.id !== sectionId)
            }))
        } catch (error) {
            set({ error: error.message })
            throw error
        }
    },

    reorderSections: async (sheetId, sectionIds) => {
        try {
            const apiUrl = getApiUrl()
            const token = useAuthStore.getState().token

            const response = await fetch(`${apiUrl}/sheets/${sheetId}/sections/reorder`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token || ''}`,
                },
                body: JSON.stringify({ section_ids: sectionIds }),
            })

            if (!response.ok) throw new Error('Failed to reorder sections')

            const reorderedSections = await response.json()
            set({ sections: reorderedSections })

            return reorderedSections
        } catch (error) {
            set({ error: error.message })
            throw error
        }
    },

    uploadReferenceImage: async (sectionId, file) => {
        try {
            const apiUrl = getApiUrl()
            const token = useAuthStore.getState().token

            const formData = new FormData()
            formData.append('file', file)

            const response = await fetch(`${apiUrl}/sections/${sectionId}/reference-images`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token || ''}`,
                },
                body: formData,
            })

            if (!response.ok) throw new Error('Failed to upload reference image')

            const { url } = await response.json()

            // Update section's reference images
            set((state) => ({
                sections: state.sections.map(s =>
                    s.id === sectionId
                        ? { ...s, reference_image_urls: [...(s.reference_image_urls || []), url] }
                        : s
                )
            }))

            return url
        } catch (error) {
            set({ error: error.message })
            throw error
        }
    },

    deleteReferenceImage: async (sectionId, imageIndex) => {
        try {
            const apiUrl = getApiUrl()
            const token = useAuthStore.getState().token

            const response = await fetch(`${apiUrl}/sections/${sectionId}/reference-images/${imageIndex}`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${token || ''}`,
                },
            })

            if (!response.ok) throw new Error('Failed to delete reference image')

            // Update section's reference images
            set((state) => ({
                sections: state.sections.map(s =>
                    s.id === sectionId
                        ? {
                            ...s,
                            reference_image_urls: s.reference_image_urls.filter((_, i) => i !== imageIndex)
                        }
                        : s
                )
            }))
        } catch (error) {
            set({ error: error.message })
            throw error
        }
    },

    clearSections: () => set({ sections: [], error: null }),
}))
