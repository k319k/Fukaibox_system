import { useEffect, useState } from 'react'
import { Card, Button, Spin, Typography } from 'antd'
import { PlusOutlined } from '@ant-design/icons'
import { useSheetStore } from '../store/sheetStore'
import { useAuthStore } from '../store/authStore'
import EmptyState from '../components/EmptyState'
import StatsCards from '../components/home/StatsCards'
import CreateSheetModal from '../components/home/CreateSheetModal'
import SheetCard from '../components/home/SheetCard'
import RankingWidget from '../components/RankingWidget'

const { Text } = Typography

/**
 * ホームページ - Material 3 Edition
 */
export default function Home() {
    const { sheets, fetchSheets, createSheet, isLoading } = useSheetStore()
    const { isLoggedIn, isGicho, user } = useAuthStore()
    const [isModalOpen, setIsModalOpen] = useState(false)
    const [newTitle, setNewTitle] = useState('')
    const [isGiinOnly, setIsGiinOnly] = useState(false)

    useEffect(() => {
        fetchSheets()
    }, [fetchSheets])

    const handleCreateSheet = async () => {
        if (!newTitle.trim()) return
        try {
            await createSheet(newTitle, isGiinOnly)
            setNewTitle('')
            setIsGiinOnly(false)
            setIsModalOpen(false)
        } catch (error) {
            console.error('Failed to create sheet:', error)
        }
    }

    const handleModalCancel = () => {
        setIsModalOpen(false)
        setNewTitle('')
        setIsGiinOnly(false)
    }

    const phaseConfig = {
        draft: { label: '下書き', color: 'default' },
        upload: { label: '募集中', color: 'success' },
        select: { label: '選定中', color: 'warning' },
        complete: { label: '完了', color: 'error' },
        archived: { label: 'アーカイブ', color: 'default' },
    }

    return (
        <div className="full-width-content">
            {/* Header Section with Stats */}
            <div style={{ marginBottom: 48 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 32 }}>
                    <div>
                        <Typography.Title level={1} style={{ margin: 0, fontSize: '40px', fontWeight: 700, marginBottom: 8 }}>
                            シート一覧
                        </Typography.Title>
                        {isLoggedIn && (
                            <Text type="secondary" style={{ fontSize: '16px', display: 'block', marginTop: '4px' }}>
                                ようこそ、{user?.displayName || user?.username} さん
                            </Text>
                        )}
                    </div>
                    {isGicho && (
                        <Button
                            type="primary"
                            size="large"
                            icon={<PlusOutlined />}
                            onClick={() => setIsModalOpen(true)}
                            style={{ height: '56px', fontSize: '16px', padding: '0 32px' }}
                        >
                            新規作成
                        </Button>
                    )}
                </div>

                {/* Statistics Cards */}
                <StatsCards sheets={sheets} />
            </div>

            {/* 2-Column Layout: Sheets + Ranking */}
            <div style={{ display: 'grid', gridTemplateColumns: isLoggedIn ? '1fr 350px' : '1fr', gap: 24, alignItems: 'start' }}>
                {/* Left Column: Sheets Grid */}
                <div>
                    {isLoading ? (
                        <div style={{ textAlign: 'center', paddingTop: 80, paddingBottom: 80 }}>
                            <Spin size="large" tip="読み込み中..." />
                        </div>
                    ) : sheets.length === 0 ? (
                        <Card style={{ border: '1px solid var(--color-border)' }}>
                            <EmptyState
                                type="sheets"
                                showAction={isGicho}
                                onAction={() => setIsModalOpen(true)}
                                actionText="最初のシートを作成"
                            />
                        </Card>
                    ) : (
                        <div style={{
                            display: 'grid',
                            gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))',
                            gap: 24
                        }}>
                            {sheets.map((sheet) => (
                                <SheetCard
                                    key={sheet.id}
                                    sheet={sheet}
                                    phaseConfig={phaseConfig}
                                />
                            ))}
                        </div>
                    )}
                </div>

                {/* Right Column: Ranking Widget */}
                {isLoggedIn && (
                    <div style={{ position: 'sticky', top: 24 }}>
                        <RankingWidget limit={10} />
                    </div>
                )}
            </div>

            {/* Create Sheet Modal */}
            <CreateSheetModal
                open={isModalOpen}
                onOk={handleCreateSheet}
                onCancel={handleModalCancel}
                title={newTitle}
                onTitleChange={(e) => setNewTitle(e.target.value)}
                isGiinOnly={isGiinOnly}
                onGiinOnlyChange={setIsGiinOnly}
            />
        </div>
    )
}
