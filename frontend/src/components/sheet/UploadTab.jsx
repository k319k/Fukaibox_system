import { useState } from 'react'
import { Select, Card, Typography, Alert } from 'antd'
import ImageUploadZone from '../images/ImageUploadZone'

const { Title, Text } = Typography
const { Option } = Select

/**
 * 画像アップロードタブ
 * セクション選択 + アップロードゾーン
 */
export default function UploadTab({ sheetId, sections, phase }) {
    const [selectedSectionId, setSelectedSectionId] = useState(sections[0]?.id || null)

    const selectedSection = sections.find(s => s.id === selectedSectionId)

    if (phase !== 'upload') {
        return (
            <div style={{ padding: '40px 20px', textAlign: 'center' }}>
                <Alert
                    message="画像募集中ではありません"
                    description="このシートは現在画像募集フェーズではありません"
                    type="info"
                    showIcon
                />
            </div>
        )
    }

    if (sections.length === 0) {
        return (
            <div style={{ padding: '40px 20px', textAlign: 'center' }}>
                <Text type="secondary">セクションがまだ作成されていません</Text>
            </div>
        )
    }

    return (
        <div style={{ padding: '24px 0' }}>
            {/* Section Selector */}
            <Card style={{ marginBottom: 24 }} className="md-elevation-1">
                <Title level={4} style={{ fontSize: '16px', marginBottom: 12 }}>
                    アップロード先セクション
                </Title>
                <Select
                    value={selectedSectionId}
                    onChange={setSelectedSectionId}
                    style={{ width: '100%' }}
                    size="large"
                >
                    {sections.map((section, index) => (
                        <Option key={section.id} value={section.id}>
                            セクション {index + 1}: {section.title || '(タイトルなし)'}
                        </Option>
                    ))}
                </Select>
            </Card>

            {/* Section Instructions */}
            {selectedSection?.image_instructions && (
                <Card
                    title="画像指示"
                    style={{ marginBottom: 24 }}
                    className="md-elevation-1"
                >
                    <Text style={{ whiteSpace: 'pre-wrap' }}>
                        {selectedSection.image_instructions}
                    </Text>
                </Card>
            )}

            {/* Reference Images */}
            {selectedSection?.reference_image_urls && selectedSection.reference_image_urls.length > 0 && (
                <Card
                    title={`参考画像 (${selectedSection.reference_image_urls.length}枚)`}
                    style={{ marginBottom: 24 }}
                    className="md-elevation-1"
                >
                    <div style={{
                        display: 'grid',
                        gridTemplateColumns: 'repeat(auto-fill, minmax(150px, 1fr))',
                        gap: 12,
                    }}>
                        {selectedSection.reference_image_urls.map((url, index) => (
                            <img
                                key={index}
                                src={url}
                                alt={`Reference ${index + 1}`}
                                style={{
                                    width: '100%',
                                    height: 150,
                                    objectFit: 'cover',
                                    borderRadius: 8,
                                }}
                            />
                        ))}
                    </div>
                </Card>
            )}

            {/* Upload Zone */}
            <ImageUploadZone
                sheetId={sheetId}
                sectionId={selectedSectionId}
            />
        </div>
    )
}
