/**
 * ProjectCard - プロジェクトカード表示
 * 閲覧数・評価・コメント数を表示
 */
import { Card, Tag, Space, Typography, Avatar } from 'antd'
import { ThumbsUp, ThumbsDown, Eye, MessageSquare, Code, Link } from 'lucide-react'

const { Text, Paragraph } = Typography

/**
 * @param {Object} props
 * @param {Object} props.project - プロジェクトデータ
 * @param {Function} props.onClick - クリックハンドラ
 * @param {boolean} props.showOwner - オーナー名表示
 */
export default function ProjectCard({ project, onClick, showOwner = true }) {
    const isSandbox = project.project_type === 'sandbox'
    const isRunning = project.status === 'running'

    const embedSourceLabels = {
        gemini_canvas: 'Gemini Canvas',
        gpt_canvas: 'GPT Canvas',
        claude_artifacts: 'Claude Artifacts'
    }

    return (
        <Card
            hoverable
            onClick={onClick}
            style={{ height: '100%' }}
            cover={
                project.thumbnail_url ? (
                    <div style={{
                        height: 140,
                        background: `url(${project.thumbnail_url}) center/cover`,
                        borderRadius: '8px 8px 0 0'
                    }} />
                ) : (
                    <div style={{
                        height: 140,
                        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        borderRadius: '8px 8px 0 0'
                    }}>
                        {isSandbox ? (
                            <Code size={48} color="white" />
                        ) : (
                            <Link size={48} color="white" />
                        )}
                    </div>
                )
            }
        >
            {/* Type Tag */}
            <div style={{ position: 'absolute', top: 12, right: 12 }}>
                {isSandbox ? (
                    <Tag color={isRunning ? 'green' : 'default'}>
                        {isRunning ? '実行中' : 'Sandbox'}
                    </Tag>
                ) : (
                    <Tag color="purple">
                        {embedSourceLabels[project.embed_source] || 'Embed'}
                    </Tag>
                )}
            </div>

            {/* Title & Description */}
            <Text strong ellipsis style={{ fontSize: 16, display: 'block', marginBottom: 4 }}>
                {project.name}
            </Text>
            <Paragraph
                type="secondary"
                ellipsis={{ rows: 2 }}
                style={{ marginBottom: 12, minHeight: 44 }}
            >
                {project.description || '説明なし'}
            </Paragraph>

            {/* Owner */}
            {showOwner && project.owner_name && (
                <div style={{ marginBottom: 12 }}>
                    <Space size={4}>
                        <Avatar size={20} src={project.owner_avatar}>
                            {project.owner_name?.[0]}
                        </Avatar>
                        <Text type="secondary" style={{ fontSize: 12 }}>
                            {project.owner_name}
                        </Text>
                    </Space>
                </div>
            )}

            {/* Stats */}
            <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                borderTop: '1px solid #f0f0f0',
                paddingTop: 12,
                marginTop: 'auto'
            }}>
                <Space size={12}>
                    <Space size={4}>
                        <Eye size={14} color="#999" />
                        <Text type="secondary" style={{ fontSize: 12 }}>
                            {project.view_count}
                        </Text>
                    </Space>
                    <Space size={4}>
                        <ThumbsUp size={14} color="#52c41a" />
                        <Text style={{ fontSize: 12, color: '#52c41a' }}>
                            {project.upvotes}
                        </Text>
                    </Space>
                    <Space size={4}>
                        <ThumbsDown size={14} color="#ff4d4f" />
                        <Text style={{ fontSize: 12, color: '#ff4d4f' }}>
                            {project.downvotes}
                        </Text>
                    </Space>
                </Space>
                <Space size={4}>
                    <MessageSquare size={14} color="#999" />
                    <Text type="secondary" style={{ fontSize: 12 }}>
                        {project.comment_count}
                    </Text>
                </Space>
            </div>
        </Card>
    )
}
