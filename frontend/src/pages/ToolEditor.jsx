/**
 * ToolEditor - プロジェクト詳細・編集ページ
 * Sandbox: コード編集・実行 / Embed: iframe表示
 * Target: <200 lines
 */
import { useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { Card, Button, Typography, Space, Spin, message, Tabs, Tag, Popconfirm, Divider, Breadcrumb } from 'antd'
import { ArrowLeftOutlined, PlayCircleOutlined, StopOutlined, DeleteOutlined, HomeOutlined } from '@ant-design/icons'
import { Eye, Code, MessageSquare, ExternalLink } from 'lucide-react'
import { useAuthStore } from '../store/authStore'
import { useToolsStore } from '../store/toolsStore'
import VotingButton from '../components/tools/VotingButton'
import CommentSection from '../components/tools/CommentSection'

const { Title, Text, Paragraph } = Typography

export default function ToolEditor() {
    const { id } = useParams()
    const navigate = useNavigate()
    const { token, user } = useAuthStore()
    const {
        activeProject, loading,
        fetchProject, deleteProject, runProject, stopProject, clearActiveProject
    } = useToolsStore()

    useEffect(() => {
        fetchProject(id, token)
        return () => clearActiveProject()
    }, [id, token])

    const handleDelete = async () => {
        try {
            await deleteProject(token, id)
            message.success('プロジェクトを削除しました')
            navigate('/tools')
        } catch {
            message.error('削除に失敗しました')
        }
    }

    const handleRun = async () => {
        try {
            await runProject(token, id)
            message.success('プロジェクトを開始しました')
        } catch (error) {
            message.error(error.response?.data?.detail || '開始に失敗しました')
        }
    }

    const handleStop = async () => {
        try {
            await stopProject(token, id)
            message.success('プロジェクトを停止しました')
        } catch {
            message.error('停止に失敗しました')
        }
    }

    if (loading || !activeProject) {
        return (
            <div style={{ textAlign: 'center', padding: 120 }}>
                <Spin size="large" />
            </div>
        )
    }

    const isOwner = user?.id === activeProject.owner_id
    const isSandbox = activeProject.project_type === 'sandbox'
    const isRunning = activeProject.status === 'running'

    const embedSourceLabels = {
        gemini_canvas: 'Gemini Canvas',
        gpt_canvas: 'GPT Canvas',
        claude_artifacts: 'Claude Artifacts'
    }

    return (
        <div style={{ padding: '0 24px 24px', maxWidth: 1200, margin: '0 auto' }}>
            {/* Breadcrumb */}
            <Breadcrumb style={{ marginBottom: 16 }}>
                <Breadcrumb.Item href="#" onClick={() => navigate('/')}>
                    <HomeOutlined />
                </Breadcrumb.Item>
                <Breadcrumb.Item href="#" onClick={() => navigate('/tools')}>
                    Tools
                </Breadcrumb.Item>
                <Breadcrumb.Item>{activeProject.name}</Breadcrumb.Item>
            </Breadcrumb>

            {/* Header */}
            <Card style={{ marginBottom: 24 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 16 }}>
                    <div style={{ flex: 1, minWidth: 300 }}>
                        <Space align="center" style={{ marginBottom: 8 }}>
                            <Title level={3} style={{ margin: 0 }}>{activeProject.name}</Title>
                            {isSandbox ? (
                                <Tag color={isRunning ? 'green' : 'default'}>
                                    {isRunning ? '実行中' : 'Sandbox'}
                                </Tag>
                            ) : (
                                <Tag color="purple">
                                    {embedSourceLabels[activeProject.embed_source] || 'Embed'}
                                </Tag>
                            )}
                        </Space>
                        <Paragraph type="secondary" style={{ marginBottom: 8 }}>
                            {activeProject.description || '説明なし'}
                        </Paragraph>
                        <Space split={<Divider type="vertical" />}>
                            <Text type="secondary">
                                <Eye size={14} style={{ marginRight: 4, verticalAlign: 'middle' }} />
                                {activeProject.view_count} views
                            </Text>
                            <Text type="secondary">by {activeProject.owner_name}</Text>
                        </Space>
                    </div>

                    <Space direction="vertical" align="end">
                        <VotingButton
                            projectId={activeProject.id}
                            upvotes={activeProject.upvotes}
                            downvotes={activeProject.downvotes}
                            userVote={activeProject.user_vote}
                        />

                        {isOwner && (
                            <Space>
                                {isSandbox && (
                                    isRunning ? (
                                        <Button icon={<StopOutlined />} onClick={handleStop}>停止</Button>
                                    ) : (
                                        <Button type="primary" icon={<PlayCircleOutlined />} onClick={handleRun}>実行</Button>
                                    )
                                )}
                                <Popconfirm title="削除しますか？" onConfirm={handleDelete}>
                                    <Button danger icon={<DeleteOutlined />}>削除</Button>
                                </Popconfirm>
                            </Space>
                        )}
                    </Space>
                </div>
            </Card>

            {/* Content */}
            <Card>
                <Tabs
                    items={[
                        {
                            key: 'preview',
                            label: <><Eye size={14} style={{ marginRight: 4 }} />プレビュー</>,
                            children: (
                                <div style={{ minHeight: 400 }}>
                                    {isSandbox ? (
                                        activeProject.html_content ? (
                                            <iframe
                                                srcDoc={activeProject.html_content}
                                                style={{ width: '100%', height: 500, border: '1px solid #d9d9d9', borderRadius: 8 }}
                                                sandbox="allow-scripts allow-forms"
                                                title="Preview"
                                            />
                                        ) : (
                                            <div style={{ textAlign: 'center', padding: 80, color: '#999' }}>
                                                HTMLコンテンツがありません
                                            </div>
                                        )
                                    ) : (
                                        activeProject.embed_url ? (
                                            <div>
                                                <Button
                                                    type="link"
                                                    icon={<ExternalLink size={14} />}
                                                    href={activeProject.embed_url}
                                                    target="_blank"
                                                    style={{ marginBottom: 16 }}
                                                >
                                                    新しいタブで開く
                                                </Button>
                                                <iframe
                                                    src={activeProject.embed_url}
                                                    style={{ width: '100%', height: 600, border: '1px solid #d9d9d9', borderRadius: 8 }}
                                                    sandbox="allow-scripts allow-same-origin allow-forms"
                                                    title="Embed Preview"
                                                />
                                            </div>
                                        ) : (
                                            <div style={{ textAlign: 'center', padding: 80, color: '#999' }}>
                                                埋め込みURLが設定されていません
                                            </div>
                                        )
                                    )}
                                </div>
                            )
                        },
                        {
                            key: 'comments',
                            label: <><MessageSquare size={14} style={{ marginRight: 4 }} />コメント ({activeProject.comment_count})</>,
                            children: <CommentSection projectId={id} />
                        }
                    ]}
                />
            </Card>
        </div>
    )
}
