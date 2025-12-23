import { Link } from 'react-router-dom'
import { Card, Tag, Space, Typography } from 'antd'
import { FileImageOutlined, LockOutlined, CalendarOutlined } from '@ant-design/icons'

const { Text } = Typography

/**
 * Sheet Card Component
 * Displays a single sheet card with metadata
 * 
 * @param {Object} props
 * @param {Object} props.sheet - Sheet object
 * @param {Object} props.phaseConfig - Phase configuration object
 */
export default function SheetCard({ sheet, phaseConfig }) {
    const phase = phaseConfig[sheet.phase] || phaseConfig.draft

    return (
        <Link to={`/sheets/${sheet.id}`}>
            <Card
                hoverable
                className="md-elevation-1"
                style={{ height: '100%', display: 'flex', flexDirection: 'column' }}
            >
                <div style={{ marginBottom: 16 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: 12 }}>
                        <Typography.Title level={4} style={{
                            margin: 0,
                            fontSize: '18px',
                            fontWeight: 600,
                            flex: 1,
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            whiteSpace: 'nowrap'
                        }}>
                            {sheet.title}
                        </Typography.Title>
                        <Tag color={phase.color} style={{ marginLeft: 8, flexShrink: 0 }}>
                            {phase.label}
                        </Tag>
                    </div>

                    {sheet.description && (
                        <Text type="secondary" style={{
                            fontSize: '14px',
                            display: '-webkit-box',
                            WebkitLineClamp: 3,
                            WebkitBoxOrient: 'vertical',
                            overflow: 'hidden'
                        }}>
                            {sheet.description}
                        </Text>
                    )}
                </div>

                {sheet.is_giin_only && (
                    <div style={{ marginBottom: 12 }}>
                        <Tag icon={<LockOutlined />} style={{ background: '#FFEEF0', color: '#B3424A', border: '1px solid #B3424A' }}>
                            儀員限定
                        </Tag>
                    </div>
                )}

                <div style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    paddingTop: 12,
                    borderTop: '1px solid #E7E0EC',
                    marginTop: 'auto'
                }}>
                    <Space size={6}>
                        <FileImageOutlined style={{ color: '#B3424A', fontSize: '16px' }} />
                        <Text style={{ fontSize: '14px', fontWeight: 500, color: '#B3424A' }}>
                            {sheet.image_count || 0} 枚
                        </Text>
                    </Space>
                    <Space size={4}>
                        <CalendarOutlined style={{ color: '#79747E', fontSize: '14px' }} />
                        <Text type="secondary" style={{ fontSize: '12px' }}>
                            {new Date(sheet.created_at).toLocaleDateString('ja-JP')}
                        </Text>
                    </Space>
                </div>
            </Card>
        </Link>
    )
}
