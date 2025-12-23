import { useState, useEffect } from 'react'
import { Card, List, Avatar, Tag, Spin } from 'antd'
import { TrophyOutlined, CrownOutlined } from '@ant-design/icons'
import { useAuthStore } from '../store/authStore'

// Helper function to get API URL
const getApiUrl = () => {
    return window.location.origin.includes('localhost')
        ? 'http://localhost:8000'
        : 'https://fukaibox.kanjousekai.jp/api'
}

/**
 * Ranking Widget Component
 * Displays top users by points
 * 
 * @param {Object} props
 * @param {number} props.limit - Number of users to display (default: 5)
 */
export default function RankingWidget({ limit = 5 }) {
    const [ranking, setRanking] = useState([])
    const [loading, setLoading] = useState(true)
    const { token } = useAuthStore()

    useEffect(() => {
        fetchRanking()
    }, [limit])

    const fetchRanking = async () => {
        setLoading(true)
        try {
            const apiUrl = getApiUrl()
            const response = await fetch(`${apiUrl}/settings/users/ranking?limit=${limit}`, {
                headers: { 'Authorization': `Bearer ${token}` }
            })

            if (!response.ok) throw new Error('Failed to fetch ranking')

            const data = await response.json()
            setRanking(data)
        } catch (error) {
            console.error('Failed to fetch ranking:', error)
        } finally {
            setLoading(false)
        }
    }

    const getRankColor = (rank) => {
        if (rank === 1) return '#FFD700' // Gold
        if (rank === 2) return '#C0C0C0' // Silver
        if (rank === 3) return '#CD7F32' // Bronze
        return '#B3424A'
    }

    const getRankIcon = (rank) => {
        if (rank <= 3) return '🏆'
        return rank
    }

    return (
        <Card
            title={
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <TrophyOutlined style={{ color: '#B3424A' }} />
                    <span>ランキング</span>
                </div>
            }
            style={{ marginBottom: 24 }}
            className="md-elevation-1"
        >
            {loading ? (
                <div style={{ textAlign: 'center', padding: 24 }}>
                    <Spin />
                </div>
            ) : ranking.length === 0 ? (
                <div style={{ textAlign: 'center', padding: 24, color: '#999' }}>
                    データがありません
                </div>
            ) : (
                <List
                    dataSource={ranking}
                    renderItem={(item) => (
                        <List.Item>
                            <List.Item.Meta
                                avatar={
                                    <Avatar
                                        style={{
                                            backgroundColor: getRankColor(item.rank),
                                            fontWeight: 'bold',
                                            fontSize: 16
                                        }}
                                    >
                                        {getRankIcon(item.rank)}
                                    </Avatar>
                                }
                                title={
                                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                                        <span>{item.display_name || item.username}</span>
                                        {item.is_gicho && (
                                            <Tag icon={<CrownOutlined />} color="gold">
                                                儀長
                                            </Tag>
                                        )}
                                    </div>
                                }
                                description={
                                    <span style={{ fontSize: 14, fontWeight: 600, color: '#B3424A' }}>
                                        {item.points} 点
                                    </span>
                                }
                            />
                        </List.Item>
                    )}
                />
            )}
        </Card>
    )
}
