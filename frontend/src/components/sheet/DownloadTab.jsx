import { useState } from 'react'
import { Card, Button, Typography, Alert, Radio, Space } from 'antd'
import { DownloadOutlined, PictureOutlined } from '@ant-design/icons'

const { Title, Text } = Typography

/**
 * ダウンロードタブ
 * 採用画像のZIPダウンロード（リサイズ版/オリジナル版選択可能）
 */
export default function DownloadTab({ sheetId, images, isGicho }) {
    const [downloadSize, setDownloadSize] = useState('resized') // 'resized' or 'original'
    const adoptedImages = images.filter(img => img.status === 'ADOPTED')

    if (!isGicho) {
        return (
            <div style={{ padding: '40px 20px', textAlign: 'center' }}>
                <Alert
                    message="権限がありません"
                    description="ダウンロード機能は儀長のみ利用できます"
                    type="warning"
                    showIcon
                />
            </div>
        )
    }

    if (adoptedImages.length === 0) {
        return (
            <div style={{ padding: '40px 20px', textAlign: 'center' }}>
                <Text type="secondary">採用画像がまだありません</Text>
            </div>
        )
    }

    const getApiUrl = () => {
        return window.location.origin.includes('localhost')
            ? 'http://localhost:8000'
            : 'https://fukaibox.kanjousekai.jp/api'
    }

    const downloadUrl = `${getApiUrl()}/images/${sheetId}/export?size=${downloadSize}`

    return (
        <div style={{ padding: '24px 0' }}>
            <Card className="md-elevation-1">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 24 }}>
                    <div style={{ flex: 1 }}>
                        <Title level={4} style={{ margin: 0, fontSize: '18px' }}>
                            採用画像をエクスポート
                        </Title>
                        <Text type="secondary" style={{ display: 'block', marginTop: 8 }}>
                            {adoptedImages.length}枚の画像をZIPでダウンロード
                        </Text>
                        <Text type="secondary" style={{ fontSize: 12, display: 'block', marginTop: 4 }}>
                            ファイル名には投稿者名が含まれます
                        </Text>

                        {/* Size Selection */}
                        <div style={{ marginTop: 16 }}>
                            <Text strong style={{ display: 'block', marginBottom: 8 }}>
                                <PictureOutlined /> ダウンロードサイズ
                            </Text>
                            <Radio.Group
                                value={downloadSize}
                                onChange={(e) => setDownloadSize(e.target.value)}
                                style={{ width: '100%' }}
                            >
                                <Space direction="vertical" style={{ width: '100%' }}>
                                    <Radio value="resized">
                                        <div>
                                            <Text strong>リサイズ版 (640×480)</Text>
                                            <Text type="secondary" style={{ display: 'block', fontSize: 12, marginLeft: 24 }}>
                                                台本用に最適化されたサイズ。ファイルサイズが小さく推奨。
                                            </Text>
                                        </div>
                                    </Radio>
                                    <Radio value="original">
                                        <div>
                                            <Text strong>オリジナル版</Text>
                                            <Text type="secondary" style={{ display: 'block', fontSize: 12, marginLeft: 24 }}>
                                                投稿された元の画像。高解像度ですがファイルサイズが大きい。
                                            </Text>
                                        </div>
                                    </Radio>
                                </Space>
                            </Radio.Group>
                        </div>
                    </div>

                    <Button
                        type="primary"
                        size="large"
                        icon={<DownloadOutlined />}
                        href={downloadUrl}
                        target="_blank"
                        style={{ minWidth: 160, flexShrink: 0 }}
                    >
                        ZIPダウンロード
                    </Button>
                </div>
            </Card>

            {/* Preview Grid */}
            <div style={{ marginTop: 24 }}>
                <Text type="secondary" style={{ display: 'block', marginBottom: 12 }}>
                    ダウンロードされる画像 ({adoptedImages.length}枚)
                </Text>
                <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fill, minmax(150px, 1fr))',
                    gap: 12,
                }}>
                    {adoptedImages.map((image) => (
                        <div key={image.id} style={{ position: 'relative' }}>
                            <img
                                src={image.file_path}
                                alt={image.original_filename}
                                style={{
                                    width: '100%',
                                    height: 150,
                                    objectFit: 'cover',
                                    borderRadius: 8,
                                }}
                            />
                            <div style={{
                                position: 'absolute',
                                bottom: 0,
                                left: 0,
                                right: 0,
                                background: 'rgba(0, 0, 0, 0.7)',
                                color: 'white',
                                padding: '4px 8px',
                                fontSize: 12,
                                borderBottomLeftRadius: 8,
                                borderBottomRightRadius: 8,
                            }}>
                                {image.uploader?.username || '不明'}
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    )
}
