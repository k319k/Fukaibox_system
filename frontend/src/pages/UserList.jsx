import { useState, useEffect } from 'react'
import { Card, Table, Avatar, Tag, Select, Space, Typography, message } from 'antd'
import { UserOutlined, TrophyOutlined, SortAscendingOutlined } from '@ant-design/icons'
import axios from 'axios'
import OnlineStatusBadge from '../components/common/OnlineStatusBadge'

const { Title } = Typography
const { Option } = Select

/**
 * UserList - ユーザー一覧ページ
 * 名前順・点数順でソート可能
 */
export default function UserList() {
    const [users, setUsers] = useState([])
    const [loading, setLoading] = useState(true)
    const [sortBy, setSortBy] = useState('points') // 'points' or 'name'

    useEffect(() => {
        fetchUsers()
    }, [])

    const fetchUsers = async () => {
        try {
            setLoading(true)
            const response = await axios.get('/api/users/list')
            setUsers(response.data)
        } catch (error) {
            console.error('Failed to fetch users:', error)
            message.error('ユーザー一覧の取得に失敗しました')
        } finally {
            setLoading(false)
        }
    }

    // ソート処理
    const sortedUsers = [...users].sort((a, b) => {
        if (sortBy === 'points') {
            return (b.points || 0) - (a.points || 0)
        } else {
            const nameA = a.display_name || a.username || ''
            const nameB = b.display_name || b.username || ''
            return nameA.localeCompare(nameB, 'ja')
        }
    })

    const columns = [
        {
            title: '順位',
            key: 'rank',
            width: 80,
            render: (_, __, index) => {
                if (sortBy === 'points') {
                    return (
                        <div style={{
                            fontWeight: 600,
                            fontSize: '16px',
                            color: index === 0 ? '#FFD700' : index === 1 ? '#C0C0C0' : index === 2 ? '#CD7F32' : 'var(--color-text-secondary)'
                        }}>
                            {index + 1}
                        </div>
                    )
                }
                return null
            }
        },
        {
            title: 'ユーザー',
            key: 'user',
            render: (_, record) => (
                <Space size={12}>
                    <div style={{ position: 'relative' }}>
                        <Avatar
                            src={record.avatar_url || record.profile_image_url}
                            icon={<UserOutlined />}
                            size={40}
                        />
                        <div style={{
                            position: 'absolute',
                            bottom: 0,
                            right: 0,
                            background: 'white',
                            borderRadius: '50%',
                            width: 12,
                            height: 12,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center'
                        }}>
                            <OnlineStatusBadge isOnline={record.is_online} size={10} />
                        </div>
                    </div>
                    <div>
                        <div style={{
                            fontWeight: 500,
                            fontSize: '14px',
                            color: 'var(--color-text-primary)'
                        }}>
                            {record.display_name || record.username}
                        </div>
                        {record.is_gicho && (
                            <Tag color="gold" style={{ margin: 0, fontSize: '11px' }}>
                                儀長
                            </Tag>
                        )}
                    </div>
                </Space>
            )
        },
        {
            title: '点数',
            key: 'points',
            width: 120,
            align: 'right',
            render: (_, record) => (
                <Space>
                    <TrophyOutlined style={{ color: 'var(--color-primary)' }} />
                    <span style={{
                        fontWeight: 600,
                        fontSize: '16px',
                        color: 'var(--color-primary)'
                    }}>
                        {record.points || 0}
                    </span>
                </Space>
            )
        }
    ]

    return (
        <div style={{ padding: '24px', maxWidth: '1200px', margin: '0 auto' }}>
            <Card
                style={{
                    borderRadius: '12px',
                    boxShadow: '0 2px 8px rgba(0,0,0,0.08)'
                }}
            >
                <div style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    marginBottom: '24px'
                }}>
                    <Title level={3} style={{ margin: 0 }}>
                        <UserOutlined style={{ marginRight: '8px' }} />
                        ユーザー一覧
                    </Title>

                    <Space>
                        <SortAscendingOutlined style={{ color: 'var(--color-text-secondary)' }} />
                        <Select
                            value={sortBy}
                            onChange={setSortBy}
                            style={{ width: 150 }}
                        >
                            <Option value="points">点数順</Option>
                            <Option value="name">名前順</Option>
                        </Select>
                    </Space>
                </div>

                <Table
                    columns={columns}
                    dataSource={sortedUsers}
                    loading={loading}
                    rowKey="id"
                    pagination={{
                        pageSize: 20,
                        showSizeChanger: false,
                        showTotal: (total) => `全 ${total} 名`
                    }}
                />
            </Card>
        </div>
    )
}
