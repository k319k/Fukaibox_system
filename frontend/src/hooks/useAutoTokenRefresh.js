import { useEffect } from 'react'
import { useAuthStore } from '../store/authStore'

/**
 * Auto Token Refresh Hook
 * Sets up automatic token refresh every 6 hours
 */
export function useAutoTokenRefresh() {
    const { isLoggedIn, setupAutoRefresh } = useAuthStore()

    useEffect(() => {
        if (!isLoggedIn) return

        // Setup auto refresh
        const cleanup = setupAutoRefresh()

        // Cleanup on unmount
        return cleanup
    }, [isLoggedIn, setupAutoRefresh])
}
