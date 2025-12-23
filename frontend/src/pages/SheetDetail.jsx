import { useEffect, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { Tabs, Tag, Button, Typography } from 'antd'
import { useSheetStore } from '../store/sheetStore'
import { useSectionStore } from '../store/sectionStore'
import { useAuthStore } from '../store/authStore'
import ScriptTab from '../components/sheet/ScriptTab'
import UploadTab from '../components/sheet/UploadTab'
import SelectionTab from '../components/sheet/SelectionTab'
import DownloadTab from '../components/sheet/DownloadTab'

const { Title, Text } = Typography

/**
 * シート詳細ページ - 4タブ構成
 * 推敲 / 画像アップロード / 画像採用 / ダウンロード
 */
export default function SheetDetail() {
    const { id } = useParams()
    const { currentSheet, images, fetchSheet, changePhase, isLoading } = useSheetStore()
    const { sections, fetchSections } = useSectionStore()
    const { isGicho } = useAuthStore()
    const [activeTab, setActiveTab] = useState('script')

    useEffect(() => {
        if (id) {
            fetchSheet(id)
            fetchSections(id)
        }
    }, [id, fetchSheet, fetchSections])

    const phaseLabels = {
        draft: { label: '下書き', color: 'default', next: 'upload' },
        upload: { label: '募集中', color: 'success', next: 'select' },
        select: { label: '選定中', color: 'warning', next: 'complete' },
        complete: { label: '完了', color: 'error', next: 'archived' },
        archived: { label: 'アーカイブ', color: 'default', next: null },
    }

    if (isLoading) {
        return <div style={{ textAlign: 'center', paddingTop: 80 }}><Text type="secondary">読み込み中...</Text></div>
    }

    if (!currentSheet) {
        return (
            <div style={{ textAlign: 'center', paddingTop: 80 }}>
                <Text type="secondary" style={{ fontSize: '16px' }}>シートが見つかりません</Text>
                <br />
                <Link to="/" style={{ color: '#B3424A', marginTop: 16, display: 'inline-block' }}>
                    ホームに戻る
                </Link>
            </div>
        )
    }

    const currentPhase = phaseLabels[currentSheet.phase] || phaseLabels.draft

    const tabItems = [
        {
            key: 'script',
            label: '推敲',
            children: <ScriptTab sheetId={id} sections={sections} isGicho={isGicho} />,
        },
        {
            key: 'upload',
            label: '画像アップロード',
            children: <UploadTab sheetId={id} sections={sections} phase={currentSheet.phase} />,
        },
        {
            key: 'selection',
            label: '画像採用',
            children: <SelectionTab sheetId={id} images={images} isGicho={isGicho} phase={currentSheet.phase} />,
        },
        {
            key: 'download',
            label: 'ダウンロード',
            children: <DownloadTab sheetId={id} images={images} isGicho={isGicho} />,
        },
    ]

    return (
        <div className="full-width-content">
            {/* Header */}
            <div style={{ marginBottom: 32 }}>
                <Link to="/" style={{ color: '#B3424A', fontSize: '14px', marginBottom: 8, display: 'inline-block' }}>
                    ← ホームに戻る
                </Link>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start' }}>
                    <div>
                        <Title level={1} style={{ margin: 0, fontSize: '32px' }}>{currentSheet.title}</Title>
                        <div style={{ display: 'flex', gap: 8, marginTop: 12 }}>
                            <Tag color={currentPhase.color}>{currentPhase.label}</Tag>
                            {currentSheet.is_giin_only && <Tag>儀員限定</Tag>}
                        </div>
                    </div>
                    {isGicho && currentPhase.next && (
                        <Button
                            type="primary"
                            size="large"
                            onClick={() => changePhase(id, currentPhase.next)}
                        >
                            次のフェーズへ
                        </Button>
                    )}
                </div>
            </div>

            {/* Tabs */}
            <Tabs
                activeKey={activeTab}
                onChange={setActiveTab}
                items={tabItems}
                size="large"
                style={{
                    background: 'white',
                    borderRadius: 12,
                    padding: '0 24px',
                }}
            />
        </div>
    )
}
