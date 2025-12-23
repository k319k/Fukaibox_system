import { useState } from 'react'
import { Card, Button, Tag, Modal, Image as AntImage, Typography } from 'antd'
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
 * 画像グリッド表示 - Material 3
 */
export default function ImageGrid({ images, sheetId, canAdopt = false, onImageClick }) {
    const [isModalOpen, setIsModalOpen] = useState(false)
    const [selectedImage, setSelectedImage] = useState(null)
    const { fetchSheet } = useSheetStore()

    const handleImageClick = (image, index) => {
        if (onImageClick) {
            onImageClick(index)
        } else {
            setSelectedImage(image)
            setIsModalOpen(true)
        }
    }

    const handleAdopt = async (imageId, adopt) => {
        const apiUrl = getApiUrl()
        const token = useAuthStore.getState().token

        try {
            await fetch(`${apiUrl}/images/${imageId}/adopt`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token || ''}`,
                },
                body: JSON.stringify({ adopt, points_awarded: 20 }),
            })

            await fetchSheet(sheetId)
            setIsModalOpen(false)
        } catch (error) {
            console.error('Failed to adopt image:', error)
        }
    }

    const statusLabels = {
        PENDING: { label: '審査中', color: 'default' },
        ADOPTED: { label: '採用', color: 'success' },
        REJECTED: { label: '不採用', color: 'error' },
    }

    if (images.length === 0) {
        return (
            <div style={{ textAlign: 'center', padding: '40px 0' }}>
                <Text type="secondary">まだ画像がありません</Text>
            </div>
        )
    }

    return (
        <>
            <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))',
                gap: 16,
                width: '100%'
            }}>
                {images.map((image, index) => {
                    const status = statusLabels[image.status] || statusLabels.PENDING
                    const apiUrl = getApiUrl()
                    return (
                        <Card
                            key={image.id}
                            hoverable
                            className="md-elevation-1"
                            onClick={() => handleImageClick(image, index)}
                            cover={
                                <div style={{ aspectRatio: '4/3', overflow: 'hidden' }}>
                                    <img
                                        src={`${apiUrl}/uploads/${image.file_path}`}
                                        alt={image.original_filename}
                                        style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                                        loading="lazy"
                                    />
                                </div>
                            }
                        >
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <Text ellipsis style={{ maxWidth: '60%', fontSize: '12px', color: '#79747E' }}>
                                    {image.uploader_name || '匿名'}
                                </Text>
                                <Tag color={status.color}>{status.label}</Tag>
                            </div>
                        </Card>
                    )
                })}
            </div>

            {/* Image Detail Modal */}
            <Modal
                open={isModalOpen}
                onCancel={() => setIsModalOpen(false)}
                footer={null}
                width={800}
            >
                {selectedImage && (
                    <div style={{ paddingTop: 24 }}>
                        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 24 }}>
                            <AntImage
                                src={`${getApiUrl()}/uploads/${selectedImage.file_path}`}
                                alt={selectedImage.original_filename}
                                style={{ maxHeight: '60vh', objectFit: 'contain' }}
                            />
                        </div>

                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <div>
                                <Text strong style={{ display: 'block', marginBottom: 4 }}>
                                    {selectedImage.uploader_name || '匿名'}
                                </Text>
                                <Text type="secondary" style={{ fontSize: '12px' }}>
                                    {selectedImage.original_filename}
                                </Text>
                            </div>

                            {canAdopt && (
                                <div style={{ display: 'flex', gap: 8 }}>
                                    {selectedImage.status !== 'ADOPTED' && (
                                        <Button
                                            type="primary"
                                            onClick={() => handleAdopt(selectedImage.id, true)}
                                        >
                                            採用
                                        </Button>
                                    )}
                                    {selectedImage.status !== 'REJECTED' && (
                                        <Button
                                            danger
                                            onClick={() => handleAdopt(selectedImage.id, false)}
                                        >
                                            不採用
                                        </Button>
                                    )}
                                </div>
                            )}
                        </div>
                    </div>
                )}
            </Modal>
        </>
    )
}
