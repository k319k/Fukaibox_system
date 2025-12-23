/**
 * CommentSection - コメント一覧・投稿
 */
import { useState, useEffect, useCallback } from 'react'
import { List, Avatar, Input, Button, message, Empty, Spin, Popconfirm, Typography, Space } from 'antd'
import { SendOutlined, DeleteOutlined } from '@ant-design/icons'
import axios from 'axios'
import { useAuthStore } from '../../store/authStore'

const { TextArea } = Input
const { Text } = Typography
const API_URL = import.meta.env.VITE_API_URL || ''

/**
 * @param {Object} props
 * @param {string} props.projectId - プロジェクトID
 */
export default function CommentSection({ projectId }) {
    const { token, user, isLoggedIn } = useAuthStore()
    const [comments, setComments] = useState([])
    const [loading, setLoading] = useState(false)
    const [submitting, setSubmitting] = useState(false)
    const [newComment, setNewComment] = useState('')

    // Fetch comments
    const fetchComments = useCallback(async () => {
        setLoading(true)
        try {
            const res = await axios.get(`${API_URL}/tools/projects/${projectId}/comments`)
            setComments(res.data)
        } catch (error) {
            console.error('Failed to fetch comments:', error)
        } finally {
            setLoading(false)
        }
    }, [projectId])

    useEffect(() => {
        fetchComments()
    }, [fetchComments])

    // Submit comment
    const handleSubmit = async () => {
        if (!newComment.trim()) return

        setSubmitting(true)
        try {
            const res = await axios.post(
                `${API_URL}/tools/projects/${projectId}/comments`,
                { content: newComment },
                { headers: { Authorization: `Bearer ${token}` } }
            )
            setComments([res.data, ...comments])
            setNewComment('')
            message.success('コメントを投稿しました')
        } catch {
            message.error('コメントの投稿に失敗しました')
        } finally {
            setSubmitting(false)
        }
    }

    // Delete comment
    const handleDelete = async (commentId) => {
        try {
            await axios.delete(
                `${API_URL}/tools/projects/${projectId}/comments/${commentId}`,
                { headers: { Authorization: `Bearer ${token}` } }
            )
            setComments(comments.filter(c => c.id !== commentId))
            message.success('コメントを削除しました')
        } catch {
            message.error('削除に失敗しました')
        }
    }

    return (
        <div>
            {/* Comment Input */}
            {isLoggedIn ? (
                <div style={{ marginBottom: 24 }}>
                    <TextArea
                        value={newComment}
                        onChange={e => setNewComment(e.target.value)}
                        placeholder="コメントを入力..."
                        rows={3}
                        maxLength={1000}
                        showCount
                    />
                    <Button
                        type="primary"
                        icon={<SendOutlined />}
                        onClick={handleSubmit}
                        loading={submitting}
                        disabled={!newComment.trim()}
                        style={{ marginTop: 8 }}
                    >
                        投稿
                    </Button>
                </div>
            ) : (
                <div style={{ marginBottom: 24, padding: 16, background: '#fafafa', borderRadius: 8, textAlign: 'center' }}>
                    <Text type="secondary">コメントするにはログインが必要です</Text>
                </div>
            )}

            {/* Comments List */}
            {loading ? (
                <div style={{ textAlign: 'center', padding: 40 }}>
                    <Spin />
                </div>
            ) : comments.length === 0 ? (
                <Empty description="コメントはまだありません" />
            ) : (
                <List
                    itemLayout="horizontal"
                    dataSource={comments}
                    renderItem={comment => (
                        <List.Item
                            actions={
                                user?.id === comment.user_id ? [
                                    <Popconfirm
                                        key="delete"
                                        title="このコメントを削除しますか？"
                                        onConfirm={() => handleDelete(comment.id)}
                                    >
                                        <Button type="text" size="small" danger icon={<DeleteOutlined />} />
                                    </Popconfirm>
                                ] : []
                            }
                        >
                            <List.Item.Meta
                                avatar={<Avatar src={comment.user_avatar}>{comment.user_name?.[0]}</Avatar>}
                                title={
                                    <Space>
                                        <Text strong>{comment.user_name}</Text>
                                        <Text type="secondary" style={{ fontSize: 12 }}>
                                            {new Date(comment.created_at).toLocaleString()}
                                        </Text>
                                    </Space>
                                }
                                description={<div style={{ whiteSpace: 'pre-wrap' }}>{comment.content}</div>}
                            />
                        </List.Item>
                    )}
                />
            )}
        </div>
    )
}
