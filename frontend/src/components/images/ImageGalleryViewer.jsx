import { useState, useEffect } from 'react'
import { Modal } from 'antd'
import { LeftOutlined, RightOutlined, CloseOutlined } from '@ant-design/icons'

// Helper function to get API URL
const getApiUrl = () => {
    return window.location.origin.includes('localhost')
        ? 'http://localhost:8000'
        : 'https://fukaibox.kanjousekai.jp/api'
}

/**
 * 画像ギャラリービューアー
 * フルスクリーンで画像を表示し、矢印キーで前後移動可能
 */
export default function ImageGalleryViewer({ images, initialIndex = 0, onClose }) {
    const [currentIndex, setCurrentIndex] = useState(initialIndex)

    useEffect(() => {
        const handleKeyDown = (e) => {
            if (e.key === 'Escape') {
                onClose()
            } else if (e.key === 'ArrowLeft') {
                setCurrentIndex((i) => Math.max(0, i - 1))
            } else if (e.key === 'ArrowRight') {
                setCurrentIndex((i) => Math.min(images.length - 1, i + 1))
            }
        }

        window.addEventListener('keydown', handleKeyDown)
        return () => window.removeEventListener('keydown', handleKeyDown)
    }, [images.length, onClose])

    if (!images || images.length === 0) return null

    const currentImage = images[currentIndex]
    const imageUrl = currentImage.file_path?.startsWith('http')
        ? currentImage.file_path
        : `${getApiUrl()}/uploads/${currentImage.file_path}`

    return (
        <Modal
            open={true}
            onCancel={onClose}
            footer={null}
            width="100vw"
            style={{
                top: 0,
                maxWidth: '100vw',
                padding: 0,
            }}
            bodyStyle={{
                height: '100vh',
                padding: 0,
                background: 'rgba(0, 0, 0, 0.95)',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
            }}
            closeIcon={
                <CloseOutlined style={{ color: 'white', fontSize: 24 }} />
            }
        >
            {/* Image Display */}
            <div style={{
                flex: 1,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                width: '100%',
                position: 'relative',
            }}>
                <img
                    src={imageUrl}
                    alt={currentImage.original_filename || `Image ${currentIndex + 1}`}
                    style={{
                        maxWidth: '90%',
                        maxHeight: '85vh',
                        objectFit: 'contain',
                    }}
                />

                {/* Navigation Buttons */}
                <button
                    onClick={() => setCurrentIndex((i) => i - 1)}
                    disabled={currentIndex === 0}
                    style={{
                        position: 'absolute',
                        left: 20,
                        top: '50%',
                        transform: 'translateY(-50%)',
                        width: 56,
                        height: 56,
                        borderRadius: '50%',
                        background: 'rgba(255, 255, 255, 0.2)',
                        border: '2px solid rgba(255, 255, 255, 0.4)',
                        color: 'white',
                        fontSize: 24,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        cursor: currentIndex === 0 ? 'not-allowed' : 'pointer',
                        opacity: currentIndex === 0 ? 0.3 : 1,
                        transition: 'all 0.2s',
                    }}
                    onMouseEnter={(e) => {
                        if (currentIndex > 0) {
                            e.target.style.background = 'rgba(255, 255, 255, 0.3)'
                        }
                    }}
                    onMouseLeave={(e) => {
                        e.target.style.background = 'rgba(255, 255, 255, 0.2)'
                    }}
                >
                    <LeftOutlined />
                </button>

                <button
                    onClick={() => setCurrentIndex((i) => i + 1)}
                    disabled={currentIndex === images.length - 1}
                    style={{
                        position: 'absolute',
                        right: 20,
                        top: '50%',
                        transform: 'translateY(-50%)',
                        width: 56,
                        height: 56,
                        borderRadius: '50%',
                        background: 'rgba(255, 255, 255, 0.2)',
                        border: '2px solid rgba(255, 255, 255, 0.4)',
                        color: 'white',
                        fontSize: 24,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        cursor: currentIndex === images.length - 1 ? 'not-allowed' : 'pointer',
                        opacity: currentIndex === images.length - 1 ? 0.3 : 1,
                        transition: 'all 0.2s',
                    }}
                    onMouseEnter={(e) => {
                        if (currentIndex < images.length - 1) {
                            e.target.style.background = 'rgba(255, 255, 255, 0.3)'
                        }
                    }}
                    onMouseLeave={(e) => {
                        e.target.style.background = 'rgba(255, 255, 255, 0.2)'
                    }}
                >
                    <RightOutlined />
                </button>
            </div>

            {/* Image Info */}
            <div style={{
                padding: '20px',
                color: 'white',
                textAlign: 'center',
                background: 'rgba(0, 0, 0, 0.5)',
                width: '100%',
            }}>
                <div style={{ fontSize: 18, marginBottom: 8 }}>
                    {currentIndex + 1} / {images.length}
                </div>
                {currentImage.uploader && (
                    <div style={{ fontSize: 14, opacity: 0.8 }}>
                        投稿者: {currentImage.uploader.username || currentImage.uploader.display_name}
                    </div>
                )}
                {currentImage.comment && (
                    <div style={{ fontSize: 14, opacity: 0.8, marginTop: 4 }}>
                        {currentImage.comment}
                    </div>
                )}
            </div>

            {/* Keyboard Hints */}
            <div style={{
                position: 'absolute',
                bottom: 80,
                left: '50%',
                transform: 'translateX(-50%)',
                color: 'rgba(255, 255, 255, 0.6)',
                fontSize: 12,
                display: 'flex',
                gap: 16,
            }}>
                <span>← 前へ</span>
                <span>→ 次へ</span>
                <span>ESC 閉じる</span>
            </div>
        </Modal>
    )
}
