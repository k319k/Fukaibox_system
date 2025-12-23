import { useEffect, useRef, useCallback } from 'react'
import { useAuthStore } from '../store/authStore'

/**
 * useHeartbeat - ハートビート送信フック
 * ログイン中のユーザーに対して60秒ごとにハートビートを送信
 */
export default function useHeartbeat() {
    const { token, isLoggedIn } = useAuthStore()
    const intervalRef = useRef(null)

    const sendHeartbeat = useCallback(async () => {
        if (!token) return

        try {
            const baseUrl = window.location.origin.includes('localhost')
                ? 'http://localhost:8000'
                : 'https://fukaibox.kanjousekai.jp/api'

            const response = await fetch(`${baseUrl}/heartbeat`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            })

            if (!response.ok) {
                console.error('Failed to send heartbeat:', response.status)
            }
        } catch (error) {
            console.error('Heartbeat error:', error)
        }
    }, [token])

    useEffect(() => {
        // If not logged in, don't start heartbeat
        if (!isLoggedIn || !token) {
            if (intervalRef.current) {
                clearInterval(intervalRef.current)
                intervalRef.current = null
            }
            return
        }

        // Send initial heartbeat immediately
        sendHeartbeat()

        // Set up interval to send heartbeat every 60 seconds
        intervalRef.current = setInterval(() => {
            sendHeartbeat()
        }, 60000) // 60 seconds

        // Cleanup on unmount or when dependencies change
        return () => {
            if (intervalRef.current) {
                clearInterval(intervalRef.current)
                intervalRef.current = null
            }
        }
    }, [isLoggedIn, token, sendHeartbeat])
}
