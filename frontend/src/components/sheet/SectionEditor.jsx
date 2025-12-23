import { useState, useRef, useCallback } from 'react'
import { Card, Input, Collapse, message } from 'antd'
import { PictureOutlined } from '@ant-design/icons'
import { useSectionStore } from '../../store/sectionStore'
import SectionHeader from './SectionHeader'
import ReferenceImagesPanel from './ReferenceImagesPanel'

const { TextArea } = Input
const { Panel } = Collapse

/**
 * セクションエディター
 * 個別セクションの編集、画像指示、参考画像管理
 */
export default function SectionEditor({ section, sheetId, isFirst, isLast, isGicho }) {
    const { updateSection, deleteSection, moveSection, uploadReferenceImage, deleteReferenceImage } = useSectionStore()
    const [isSaving, setIsSaving] = useState(false)
    const contentRef = useRef(null)

    // Auto-save on content change
    const handleContentChange = useCallback(async (value) => {
        setIsSaving(true)
        try {
            await updateSection(section.id, { content: value })
        } catch (err) {
            message.error('保存に失敗しました')
            console.error(err)
        } finally {
            setTimeout(() => setIsSaving(false), 500)
        }
    }, [section.id, updateSection])

    // Auto-save on image instructions change
    const handleImageInstructionsChange = useCallback(async (value) => {
        setIsSaving(true)
        try {
            await updateSection(section.id, { image_instructions: value })
        } catch (err) {
            message.error('保存に失敗しました')
            console.error(err)
        } finally {
            setTimeout(() => setIsSaving(false), 500)
        }
    }, [section.id, updateSection])

    // Split section at cursor position (Ctrl+Enter)
    const handleKeyDown = async (e) => {
        if (!isGicho) return

        if (e.ctrlKey && e.key === 'Enter') {
            e.preventDefault()

            const textarea = contentRef.current?.resizableTextArea?.textArea
            if (!textarea) {
                message.error('テキストエリアが見つかりません')
                return
            }

            const cursorPosition = textarea.selectionStart
            const content = section.content || ''

            if (cursorPosition === 0 || cursorPosition === content.length) {
                message.warning('カーソルをテキストの途中に配置してください')
                return
            }

            const beforeCursor = content.substring(0, cursorPosition)
            const afterCursor = content.substring(cursorPosition)

            try {
                await updateSection(section.id, { content: beforeCursor })
                await useSectionStore.getState().createSection(sheetId, {
                    content: afterCursor,
                    order: section.order + 1
                })
                message.success('セクションを分割しました')
            } catch (err) {
                message.error('分割に失敗しました')
                console.error(err)
            }
        }
    }

    // Move section up/down
    const handleMove = async (direction) => {
        try {
            await moveSection(sheetId, section.id, direction)
            message.success(`セクションを${direction === 'up' ? '上' : '下'}に移動しました`)
        } catch (err) {
            message.error('移動に失敗しました')
            console.error(err)
        }
    }

    // Delete section
    const handleDelete = async () => {
        try {
            await deleteSection(section.id)
            message.success('セクションを削除しました')
        } catch (err) {
            message.error('削除に失敗しました')
            console.error(err)
        }
    }

    // Upload reference image
    const handleReferenceUpload = async ({ file }) => {
        try {
            await uploadReferenceImage(section.id, file)
            message.success('参考画像をアップロードしました')
        } catch (err) {
            message.error('アップロードに失敗しました')
            console.error(err)
        }
    }

    // Delete reference image
    const handleReferenceDelete = async (index) => {
        try {
            await deleteReferenceImage(section.id, index)
            message.success('参考画像を削除しました')
        } catch (err) {
            message.error('削除に失敗しました')
            console.error(err)
        }
    }

    return (
        <Card
            style={{ marginBottom: 16 }}
            className="md-elevation-1"
            title={
                <SectionHeader
                    order={section.order}
                    isSaving={isSaving}
                    isFirst={isFirst}
                    isLast={isLast}
                    isGicho={isGicho}
                    onMove={handleMove}
                    onDelete={handleDelete}
                />
            }
        >
            {/* Section Content */}
            <TextArea
                ref={contentRef}
                value={section.content || ''}
                onChange={(e) => handleContentChange(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="セクション内容を入力..."
                autoSize={{ minRows: 3, maxRows: 20 }}
                style={{ marginBottom: 16 }}
                disabled={!isGicho}
            />

            {/* Image Instructions & Reference Images */}
            <Collapse
                ghost
                items={[
                    {
                        key: '1',
                        label: (
                            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                                <PictureOutlined />
                                <span>画像指示・参考画像</span>
                            </div>
                        ),
                        children: (
                            <div>
                                <div style={{ marginBottom: 16 }}>
                                    <div style={{ fontWeight: 500, marginBottom: 8 }}>画像指示</div>
                                    <TextArea
                                        value={section.image_instructions || ''}
                                        onChange={(e) => handleImageInstructionsChange(e.target.value)}
                                        placeholder="このセクションに必要な画像の指示を入力..."
                                        autoSize={{ minRows: 2, maxRows: 10 }}
                                        disabled={!isGicho}
                                    />
                                </div>

                                <ReferenceImagesPanel
                                    section={section}
                                    onUpload={handleReferenceUpload}
                                    onDelete={handleReferenceDelete}
                                    isGicho={isGicho}
                                />
                            </div>
                        )
                    }
                ]}
            />
        </Card>
    )
}
