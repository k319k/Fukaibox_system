import { useState, useRef } from 'react'
import { Card, Button, Progress, Typography } from 'antd'
import { useSheetStore } from '../../store/sheetStore'
import { useAuthStore } from '../../store/authStore'

const { Text } = Typography

// Helper function to get API URL
const getApiUrl = () => {
    return window.location.origin.includes('localhost')
        ? 'http://localhost:8000'
        : 'https://fukaibox.kanjousekai.jp/api'
}

/**
 * 画像アップロードゾーン - Material 3
 */
export default function ImageUploadZone({ sheetId, sectionId }) {
    const [isDragging, setIsDragging] = useState(false)
    const [isUploading, setIsUploading] = useState(false)
    const [progress, setProgress] = useState(0)
    const [error, setError] = useState(null)
    const fileInputRef = useRef(null)
    const { fetchSheet } = useSheetStore()

    const handleDragOver = (e) => {
        e.preventDefault()
        setIsDragging(true)
    }

    const handleDragLeave = () => {
        setIsDragging(false)
    }

    const handleDrop = async (e) => {
        e.preventDefault()
        setIsDragging(false)
        const files = Array.from(e.dataTransfer.files).filter(
            file => file.type.startsWith('image/')
        )
        if (files.length > 0) {
            await uploadFiles(files)
        }
    }

    const handleFileSelect = async (e) => {
        const files = Array.from(e.target.files || [])
        if (files.length > 0) {
            await uploadFiles(files)
        }
    }

    const uploadFiles = async (files) => {
        setIsUploading(true)
        setError(null)
        setProgress(0)

        const apiUrl = getApiUrl()
        const token = useAuthStore.getState().token
        const total = files.length
        let completed = 0

        for (const file of files) {
            try {
                const formData = new FormData()
                formData.append('file', file)
                if (sectionId) {
                    formData.append('section_id', sectionId)
                }

                const response = await fetch(`${apiUrl}/images/${sheetId}/upload`, {
                    method: 'POST',
                    headers: {
                        'Authorization': `Bearer ${token || ''}`,
                    },
                    body: formData,
                })

                if (!response.ok) {
                    throw new Error(`Failed to upload ${file.name}`)
                }

                completed++
                setProgress((completed / total) * 100)
            } catch (err) {
                setError(err.message)
            }
        }

        setIsUploading(false)
        await fetchSheet(sheetId)
    }

    return (
        <Card
            className={isDragging ? 'md-elevation-2' : 'md-elevation-1'}
            style={{
                border: `2px dashed ${isDragging ? '#B3424A' : '#CAC4D0'}`,
                background: isDragging ? '#FFEEF0' : 'transparent',
                cursor: 'pointer',
                transition: 'all 0.2s'
            }}
        >
            <div
                style={{ padding: '40px 20px', textAlign: 'center' }}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                onClick={() => fileInputRef.current?.click()}
            >
                <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    multiple
                    style={{ display: 'none' }}
                    onChange={handleFileSelect}
                />

                {isUploading ? (
                    <div>
                        <div style={{ fontSize: '48px', marginBottom: 16 }}>⏳</div>
                        <Text style={{ display: 'block', marginBottom: 16 }}>アップロード中...</Text>
                        <Progress
                            percent={Math.round(progress)}
                            strokeColor="#B3424A"
                            style={{ maxWidth: 400, margin: '0 auto' }}
                        />
                    </div>
                ) : (
                    <>
                        <div style={{ fontSize: '48px', marginBottom: 16 }}>📸</div>
                        <Text strong style={{ display: 'block', marginBottom: 8 }}>
                            画像をドラッグ&ドロップ
                        </Text>
                        <Text type="secondary" style={{ display: 'block', marginBottom: 16, fontSize: '14px' }}>
                            または クリックしてファイルを選択
                        </Text>
                        <Button type="primary">
                            ファイルを選択
                        </Button>
                    </>
                )}

                {error && (
                    <Text type="danger" style={{ display: 'block', marginTop: 16, fontSize: '14px' }}>
                        {error}
                    </Text>
                )}
            </div>
        </Card>
    )
}
