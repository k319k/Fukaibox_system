import { Button, Space, Popconfirm } from 'antd'
import { DeleteOutlined, UpOutlined, DownOutlined, ScissorOutlined } from '@ant-design/icons'

/**
 * Section Header Component
 * Displays section title and action buttons
 * 
 * @param {Object} props
 * @param {number} props.order - Section order number (0-indexed)
 * @param {boolean} props.isSaving - Whether section is currently saving
 * @param {boolean} props.isFirst - Whether this is the first section
 * @param {boolean} props.isLast - Whether this is the last section
 * @param {boolean} props.isGicho - Whether current user is Gicho
 * @param {Function} props.onMove - Callback when move button is clicked (direction: 'up' | 'down')
 * @param {Function} props.onDelete - Callback when delete button is clicked
 */
export default function SectionHeader({
    order,
    isSaving,
    isFirst,
    isLast,
    isGicho,
    onMove,
    onDelete
}) {
    return (
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <span>セクション {order + 1}</span>
                {isSaving && (
                    <span style={{ fontSize: 12, color: '#8B6F5C' }}>保存中...</span>
                )}
                <span style={{ fontSize: 12, color: '#666', fontWeight: 'normal' }}>
                    <ScissorOutlined /> Ctrl+Enter で分割
                </span>
            </div>
            {isGicho && (
                <Space>
                    <Button
                        size="small"
                        icon={<UpOutlined />}
                        onClick={() => onMove('up')}
                        disabled={isFirst}
                    >
                        上へ
                    </Button>
                    <Button
                        size="small"
                        icon={<DownOutlined />}
                        onClick={() => onMove('down')}
                        disabled={isLast}
                    >
                        下へ
                    </Button>
                    <Popconfirm
                        title="このセクションを削除しますか？"
                        onConfirm={onDelete}
                        okText="削除"
                        cancelText="キャンセル"
                    >
                        <Button size="small" danger icon={<DeleteOutlined />}>
                            削除
                        </Button>
                    </Popconfirm>
                </Space>
            )}
        </div>
    )
}
