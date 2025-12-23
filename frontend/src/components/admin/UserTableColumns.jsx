import { Button, Space, Tag } from 'antd'
import { StopOutlined, UnlockOutlined, UserOutlined } from '@ant-design/icons'

/**
 * Get user table columns configuration
 * 
 * @param {Function} onBlock - Callback when block button is clicked
 * @param {Function} onUnblock - Callback when unblock button is clicked
 * @returns {Array} Table columns configuration
 */
export function getUserTableColumns(onBlock, onUnblock) {
    return [
        {
            title: 'ユーザー名',
            dataIndex: 'username',
            key: 'username',
            render: (text, record) => (
                <Space>
                    <UserOutlined />
                    <span>{record.display_name || text}</span>
                </Space>
            )
        },
        {
            title: 'ロール',
            dataIndex: 'role',
            key: 'role',
            render: (role) => (
                <Tag color={role === 'gicho' ? 'gold' : 'blue'}>
                    {role === 'gicho' ? '儀長' : '儀員'}
                </Tag>
            )
        },
        {
            title: '点数',
            dataIndex: 'points',
            key: 'points',
            sorter: (a, b) => a.points - b.points,
            render: (points) => <span style={{ fontWeight: 600 }}>{points} 点</span>
        },
        {
            title: '状態',
            dataIndex: 'is_blocked',
            key: 'is_blocked',
            render: (isBlocked) => (
                isBlocked ? (
                    <Tag color="red">ブロック中</Tag>
                ) : (
                    <Tag color="green">アクティブ</Tag>
                )
            )
        },
        {
            title: '操作',
            key: 'actions',
            render: (_, record) => (
                <Space>
                    {!record.is_blocked && record.role !== 'gicho' && (
                        <Button
                            danger
                            size="small"
                            icon={<StopOutlined />}
                            onClick={() => onBlock(record)}
                        >
                            ブロック
                        </Button>
                    )}
                    {record.is_blocked && (
                        <Button
                            type="primary"
                            size="small"
                            icon={<UnlockOutlined />}
                            onClick={() => onUnblock(record.id)}
                        >
                            解除
                        </Button>
                    )}
                </Space>
            )
        }
    ]
}

/**
 * Get blocked users table columns configuration
 * 
 * @param {Function} onUnblock - Callback when unblock button is clicked
 * @returns {Array} Table columns configuration
 */
export function getBlockedUsersTableColumns(onUnblock) {
    return [
        {
            title: 'ユーザー名',
            dataIndex: 'username',
            key: 'username'
        },
        {
            title: 'ブロック理由',
            dataIndex: 'block_reason',
            key: 'block_reason'
        },
        {
            title: 'ブロック日時',
            dataIndex: 'blocked_at',
            key: 'blocked_at',
            render: (date) => date ? new Date(date).toLocaleString('ja-JP') : '-'
        },
        {
            title: '操作',
            key: 'actions',
            render: (_, record) => (
                <Button
                    type="primary"
                    size="small"
                    icon={<UnlockOutlined />}
                    onClick={() => onUnblock(record.id)}
                >
                    解除
                </Button>
            )
        }
    ]
}
