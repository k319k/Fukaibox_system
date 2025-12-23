import { Card } from 'antd'
import { FileTextOutlined, ClockCircleOutlined, CheckCircleOutlined } from '@ant-design/icons'

/**
 * Statistics Cards Component
 * Displays total, active, and completed sheet counts
 * 
 * @param {Object} props
 * @param {Array} props.sheets - Array of sheet objects
 */
export default function StatsCards({ sheets }) {
    const totalSheets = sheets.length
    const activeSheets = sheets.filter(s => s.phase === 'upload').length
    const completedSheets = sheets.filter(s => s.phase === 'complete' || s.phase === 'archived').length

    const cardStyle = {
        background: '#FFFFFF',
        boxShadow: '0 1px 3px rgba(18, 18, 18, 0.08)',
        borderRadius: '12px'
    }

    const contentStyle = {
        display: 'flex',
        alignItems: 'center',
        gap: '12px',
        padding: '8px 0'
    }

    const numberStyle = {
        fontSize: '28px',
        fontWeight: 700,
        lineHeight: 1
    }

    const labelStyle = {
        fontSize: '13px',
        color: 'rgba(18, 18, 18, 0.6)',
        fontWeight: 500,
        marginTop: '2px'
    }

    return (
        <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))',
            gap: '12px',
            marginBottom: 24,
            maxWidth: '600px'
        }}>
            {/* Total Sheets */}
            <Card style={{
                ...cardStyle,
                borderLeft: '4px solid #B3424A',
                border: '1px solid rgba(179, 66, 74, 0.1)'
            }}>
                <div style={contentStyle}>
                    <FileTextOutlined style={{ fontSize: '24px', color: '#B3424A' }} />
                    <div style={{ flex: 1 }}>
                        <div style={{ ...numberStyle, color: '#B3424A' }}>
                            {totalSheets}
                        </div>
                        <div style={labelStyle}>総シート数</div>
                    </div>
                </div>
            </Card>

            {/* Active Sheets */}
            <Card style={{
                ...cardStyle,
                borderLeft: '4px solid #C97064',
                border: '1px solid rgba(201, 112, 100, 0.1)'
            }}>
                <div style={contentStyle}>
                    <ClockCircleOutlined style={{ fontSize: '24px', color: '#C97064' }} />
                    <div style={{ flex: 1 }}>
                        <div style={{ ...numberStyle, color: '#C97064' }}>
                            {activeSheets}
                        </div>
                        <div style={labelStyle}>募集中</div>
                    </div>
                </div>
            </Card>

            {/* Completed Sheets */}
            <Card style={{
                ...cardStyle,
                borderLeft: '4px solid #8B6F5C',
                border: '1px solid rgba(139, 111, 92, 0.1)'
            }}>
                <div style={contentStyle}>
                    <CheckCircleOutlined style={{ fontSize: '24px', color: '#8B6F5C' }} />
                    <div style={{ flex: 1 }}>
                        <div style={{ ...numberStyle, color: '#8B6F5C' }}>
                            {completedSheets}
                        </div>
                        <div style={labelStyle}>完了済み</div>
                    </div>
                </div>
            </Card>
        </div>
    )
}
