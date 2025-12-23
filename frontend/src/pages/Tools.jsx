/**
 * Tools Page - Gallery + Dashboard
 * プロジェクト一覧、ソート機能、サーバーステータス表示
 * Target: <200 lines
 */
import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Card, Button, Typography, Select, Spin, Empty, Row, Col, Space, Badge } from 'antd'
import { PlusOutlined, AppstoreOutlined, FolderOutlined, CodeOutlined } from '@ant-design/icons'
import { useAuthStore } from '../store/authStore'
import { useToolsStore } from '../store/toolsStore'
import ProjectCreateModal from '../components/tools/ProjectCreateModal'
import ProjectCard from '../components/tools/ProjectCard'

const { Title, Text } = Typography

export default function Tools() {
    const navigate = useNavigate()
    const { token, isLoggedIn } = useAuthStore()
    const {
        gallery, projects, sortBy, loading, sandboxHealth,
        fetchGallery, fetchMyProjects, setSortBy, checkSandboxHealth
    } = useToolsStore()

    const [activeTab, setActiveTab] = useState('gallery')  // gallery, my
    const [createModalOpen, setCreateModalOpen] = useState(false)

    // Initial data fetch
    useEffect(() => {
        fetchGallery(token)
        checkSandboxHealth()
        if (isLoggedIn && token) {
            fetchMyProjects(token)
        }
    }, [token, isLoggedIn])

    // Refetch when sort changes
    useEffect(() => {
        fetchGallery(token)
    }, [sortBy])

    const displayedProjects = activeTab === 'gallery' ? (gallery || []) : (projects || [])

    return (
        <div className="full-width-content" style={{ padding: '0 24px 24px', maxWidth: 1400, margin: '0 auto' }}>
            {/* Header */}
            <div style={{ marginBottom: 24, display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 16 }}>
                <div>
                    <Title level={2} style={{ margin: 0 }}>
                        <CodeOutlined style={{ marginRight: 8 }} />
                        Tools Gallery
                    </Title>
                    <Text type="secondary">みんなのツールを見つけよう</Text>
                </div>

                <Space>
                    {/* Sandbox Status */}
                    <Badge
                        status={sandboxHealth?.sandbox_status === 'ok' ? 'success' : 'warning'}
                        text={sandboxHealth?.sandbox_status === 'ok' ? 'Sandbox Online' : 'Sandbox Offline'}
                    />

                    {isLoggedIn && (
                        <Button
                            type="primary"
                            icon={<PlusOutlined />}
                            onClick={() => setCreateModalOpen(true)}
                        >
                            新規作成
                        </Button>
                    )}
                </Space>
            </div>

            {/* Tabs & Filters */}
            <Card size="small" style={{ marginBottom: 24 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 16 }}>
                    <Space>
                        <Button
                            type={activeTab === 'gallery' ? 'primary' : 'default'}
                            icon={<AppstoreOutlined />}
                            onClick={() => setActiveTab('gallery')}
                        >
                            Gallery
                        </Button>
                        {isLoggedIn && (
                            <Button
                                type={activeTab === 'my' ? 'primary' : 'default'}
                                icon={<FolderOutlined />}
                                onClick={() => setActiveTab('my')}
                            >
                                マイプロジェクト ({projects.length})
                            </Button>
                        )}
                    </Space>

                    {activeTab === 'gallery' && (
                        <Space>
                            <Text type="secondary">並び替え:</Text>
                            <Select
                                value={sortBy}
                                onChange={setSortBy}
                                style={{ width: 120 }}
                                options={[
                                    { value: 'popular', label: '人気順' },
                                    { value: 'newest', label: '新しい順' },
                                    { value: 'oldest', label: '古い順' },
                                ]}
                            />
                        </Space>
                    )}
                </div>
            </Card>

            {/* Project Grid */}
            {loading ? (
                <div style={{ textAlign: 'center', padding: 80 }}>
                    <Spin size="large" />
                </div>
            ) : displayedProjects.length === 0 ? (
                <Empty
                    description={
                        activeTab === 'gallery'
                            ? "まだプロジェクトがありません"
                            : "プロジェクトがありません"
                    }
                >
                    {isLoggedIn && activeTab === 'my' && (
                        <Button type="primary" onClick={() => setCreateModalOpen(true)}>
                            最初のプロジェクトを作成
                        </Button>
                    )}
                </Empty>
            ) : (
                <Row gutter={[16, 16]}>
                    {displayedProjects.map(project => (
                        <Col xs={24} sm={12} lg={8} xl={6} key={project.id}>
                            <ProjectCard
                                project={project}
                                onClick={() => navigate(`/tools/${project.id}`)}
                                showOwner={activeTab === 'gallery'}
                            />
                        </Col>
                    ))}
                </Row>
            )}

            {/* Create Modal */}
            <ProjectCreateModal
                open={createModalOpen}
                onClose={() => setCreateModalOpen(false)}
            />
        </div>
    )
}
