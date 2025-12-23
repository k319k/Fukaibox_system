import { Button, message } from 'antd'
import { PlusOutlined } from '@ant-design/icons'
import SectionEditor from './SectionEditor'
import { useSectionStore } from '../../store/sectionStore'

/**
 * 推敲タブ
 * セクション管理と台本編集
 */
export default function ScriptTab({ sheetId, sections, isGicho }) {
    const { createSection } = useSectionStore()

    const handleAddSection = async () => {
        try {
            const newOrder = sections.length
            await createSection(sheetId, {
                order: newOrder,
                title: '',
                content: '',
                image_instructions: '',
                reference_image_urls: [],
            })
            message.success('セクションを追加しました')
        } catch (error) {
            message.error('セクションの追加に失敗しました')
        }
    }

    return (
        <div style={{ padding: '24px 0' }}>
            {/* Section List */}
            {sections.map((section, index) => (
                <SectionEditor
                    key={section.id}
                    section={section}
                    sheetId={sheetId}
                    isFirst={index === 0}
                    isLast={index === sections.length - 1}
                    isGicho={isGicho}
                />
            ))}

            {/* Add Section Button */}
            {isGicho && (
                <Button
                    type="dashed"
                    size="large"
                    icon={<PlusOutlined />}
                    onClick={handleAddSection}
                    block
                    style={{ marginTop: 16 }}
                >
                    セクションを追加
                </Button>
            )}

            {/* Empty State */}
            {sections.length === 0 && (
                <div style={{
                    textAlign: 'center',
                    padding: '60px 20px',
                    color: '#999',
                }}>
                    <p>まだセクションがありません</p>
                    {isGicho && <p>「セクションを追加」ボタンから始めましょう</p>}
                </div>
            )}
        </div>
    )
}
