import { useEffect } from 'react'
import { Card, Table, Avatar, Tag, Divider, Empty, Spin, Badge } from 'antd'
import { TrophyOutlined, CrownOutlined, FireOutlined, UserOutlined } from '@ant-design/icons'
import { usePointStore } from '../store/pointStore'

/**
 * ランキングページ - Professional Edition
 */
export default function Ranking() {
    const { rankings, fetchRankings, isLoading } = usePointStore()

    useEffect(() => {
        fetchRankings(100)
    }, [fetchRankings])

    const columns = [
        {
            title: '順位',
            dataIndex: 'rank',
            key: 'rank',
            width: 120,
            align: 'center',
            render: (rank) => {
                if (rank === 1) {
                    return (
                        <div className="rank-badge rank-1">
                            <CrownOutlined style={{ fontSize: '24px' }} />
                        </div>
                    )
                }
                if (rank === 2) {
                    return <div className="rank-badge rank-2">2</div>
                }
                if (rank === 3) {
                    return <div className="rank-badge rank-3">3</div>
                }
                return (
                    <span style={{
                        fontSize: '18px',
                        fontWeight: '600',
                        color: '#666'
                    }}>
                        {rank}
                    </span>
                )
            },
        },
        {
            title: 'ユーザー',
            key: 'user',
            render: (_, record) => (
                <div className="flex items-center gap-4">
                    <Badge
                        dot
                        status={Math.random() > 0.3 ? 'success' : 'default'}
                        offset={[-4, 4]}
                    >
                        <Avatar
                            size={record.rank <= 3 ? 56 : 48}
                            src={record.avatar_url}
                            style={{
                                border: record.rank === 1 ? '3px solid #FFD700' :
                                    record.rank === 2 ? '3px solid #C0C0C0' :
                                        record.rank === 3 ? '3px solid #CD7F32' :
                                            '2px solid rgba(179, 66, 74, 0.2)',
                                boxShadow: record.rank <= 3 ? '0 4px 12px rgba(0,0,0,0.15)' : '0 2px 8px rgba(0,0,0,0.08)'
                            }}
                        >
                            {(record.display_name || record.username)?.[0]}
                        </Avatar>
                    </Badge>
                    <div>
                        <p
                            className={`${record.rank <= 3 ? 'font-bold text-lg' : 'font-semibold text-base'}`}
                            style={{
                                color: record.rank === 1 ? '#FFD700' :
                                    record.rank === 2 ? '#C0C0C0' :
                                        record.rank === 3 ? '#CD7F32' :
                                            '#1a1a1a'
                            }}
                        >
                            {record.display_name || record.username}
                        </p>
                        {record.rank <= 3 && (
                            <Tag
                                icon={<FireOutlined />}
                                color={record.rank === 1 ? 'gold' : record.rank === 2 ? 'default' : 'orange'}
                                style={{ marginTop: '4px' }}
                            >
                                TOP {record.rank}
                            </Tag>
                        )}
                    </div>
                </div>
            ),
        },
        {
            title: '貢献点数',
            dataIndex: 'points',
            key: 'points',
            align: 'right',
            width: 200,
            sorter: (a, b) => a.points - b.points,
            render: (points, record) => (
                <div className="text-right">
                    <div className="flex items-center justify-end gap-2 mb-1">
                        <FireOutlined style={{
                            color: record.rank === 1 ? '#FFD700' :
                                record.rank === 2 ? '#C0C0C0' :
                                    record.rank === 3 ? '#CD7F32' : '#B3424A',
                            fontSize: record.rank <= 3 ? '20px' : '16px'
                        }} />
                        <span
                            className={record.rank <= 3 ? 'text-3xl font-bold' : 'text-2xl font-semibold'}
                            style={{
                                background: record.rank === 1 ? 'linear-gradient(135deg, #FFD700 0%, #FFA500 100%)' :
                                    record.rank === 2 ? 'linear-gradient(135deg, #C0C0C0 0%, #A8A8A8 100%)' :
                                        record.rank === 3 ? 'linear-gradient(135deg, #CD7F32 0%, #B8702A 100%)' :
                                            'linear-gradient(135deg, #B3424A 0%, #d4af37 100%)',
                                WebkitBackgroundClip: 'text',
                                WebkitTextFillColor: 'transparent'
                            }}
                        >
                            {points.toLocaleString()}
                        </span>
                    </div>
                    <p className="text-xs text-gray-500 font-medium">POINTS</p>
                </div>
            ),
        },
    ]

    return (
        <div className="animate-fade-in">
            {/* Hero Header */}
            <div className="hero-section section-spacing">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-5xl font-bold flex items-center gap-4 mb-3">
                            <TrophyOutlined className="gold-accent" style={{ fontSize: '52px' }} />
                            <span className="gold-accent">点数ランキング</span>
                        </h1>
                        <p className="text-gray-600 text-lg font-medium ml-1">
                            儀員の貢献度をリアルタイムで確認
                        </p>
                    </div>
                    <div className="text-right">
                        <p className="text-sm text-gray-500 font-medium">総参加者数</p>
                        <p className="text-4xl font-bold gold-accent">{rankings.length}</p>
                    </div>
                </div>
            </div>

            {/* Ranking Table Card */}
            <Card
                className="card-spacing"
                title={
                    <div className="flex items-center gap-2">
                        <UserOutlined />
                        <span className="font-bold text-lg">ユーザー一覧</span>
                    </div>
                }
            >
                {isLoading ? (
                    <div className="text-center py-20">
                        <Spin size="large" tip="読み込み中..." />
                    </div>
                ) : rankings.length === 0 ? (
                    <Empty
                        description="ランキングデータがありません"
                        image={Empty.PRESENTED_IMAGE_SIMPLE}
                    />
                ) : (
                    <Table
                        columns={columns}
                        dataSource={rankings}
                        rowKey="uid"
                        pagination={{
                            pageSize: 20,
                            showSizeChanger: false,
                            showTotal: (total) => `全 ${total} 名`,
                        }}
                        rowClassName={(record) =>
                            record.rank <= 3 ? 'bg-gradient-to-r from-transparent via-yellow-50/30 to-transparent' : ''
                        }
                    />
                )}
            </Card>
        </div>
    )
}
