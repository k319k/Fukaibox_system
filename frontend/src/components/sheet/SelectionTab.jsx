import { useState } from 'react'
import { Alert, Typography } from 'antd'
import ImageGrid from '../images/ImageGrid'
import ImageGalleryViewer from '../images/ImageGalleryViewer'

const { Text } = Typography

/**
 * 画像採用タブ
 * 画像一覧表示と採用/不採用選択
 */
export default function SelectionTab({ sheetId, images, isGicho, phase }) {
    const [galleryOpen, setGalleryOpen] = useState(false)
    const [galleryIndex, setGalleryIndex] = useState(0)

    const handleImageClick = (index) => {
        setGalleryIndex(index)
        setGalleryOpen(true)
    }

    if (phase !== 'select' && !isGicho) {
        return (
            <div style={{ padding: '40px 20px', textAlign: 'center' }}>
                <Alert
                    message="選定フェーズではありません"
                    description="このシートは現在選定フェーズではありません"
                    type="info"
                    showIcon
                />
            </div>
        )
    }

    return (
        <div style={{ padding: '24px 0' }}>
            <div style={{ marginBottom: 16 }}>
                <Text type="secondary">
                    投稿画像 ({images.length}枚)
                    {isGicho && phase === 'select' && ' - クリックして採用/不採用を選択'}
                </Text>
            </div>

            <ImageGrid
                images={images}
                sheetId={sheetId}
                canAdopt={isGicho && phase === 'select'}
                onImageClick={handleImageClick}
            />

            {images.length === 0 && (
                <div style={{
                    textAlign: 'center',
                    padding: '60px 20px',
                    color: '#999',
                }}>
                    <p>まだ画像が投稿されていません</p>
                </div>
            )}

            {/* Image Gallery Viewer */}
            {galleryOpen && (
                <ImageGalleryViewer
                    images={images}
                    initialIndex={galleryIndex}
                    onClose={() => setGalleryOpen(false)}
                />
            )}
        </div>
    )
}
