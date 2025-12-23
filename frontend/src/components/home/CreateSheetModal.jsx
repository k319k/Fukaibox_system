import { Modal, Input, Switch, Typography } from 'antd'
import { LockOutlined } from '@ant-design/icons'

const { Text } = Typography

/**
 * Create Sheet Modal Component
 * Modal for creating a new sheet with title and giin-only mode
 * 
 * @param {Object} props
 * @param {boolean} props.open - Modal visibility
 * @param {Function} props.onOk - Callback when OK button is clicked
 * @param {Function} props.onCancel - Callback when Cancel button is clicked
 * @param {string} props.title - Sheet title value
 * @param {Function} props.onTitleChange - Callback when title changes
 * @param {boolean} props.isGiinOnly - Giin-only mode value
 * @param {Function} props.onGiinOnlyChange - Callback when giin-only mode changes
 */
export default function CreateSheetModal({
    open,
    onOk,
    onCancel,
    title,
    onTitleChange,
    isGiinOnly,
    onGiinOnlyChange
}) {
    return (
        <Modal
            title={<span style={{ fontSize: '20px', fontWeight: 600 }}>新規シート作成</span>}
            open={open}
            onOk={onOk}
            onCancel={onCancel}
            okText="作成"
            cancelText="キャンセル"
            okButtonProps={{ size: 'large' }}
            cancelButtonProps={{ size: 'large' }}
        >
            <div style={{ paddingTop: 16, paddingBottom: 16 }}>
                <div style={{ marginBottom: 16 }}>
                    <label style={{ display: 'block', marginBottom: 8, fontWeight: 500 }}>タイトル</label>
                    <Input
                        size="large"
                        placeholder="例: 第10回封解式"
                        value={title}
                        onChange={onTitleChange}
                        onPressEnter={onOk}
                    />
                </div>
                <div style={{ marginTop: 24 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <div>
                            <div style={{ fontWeight: 500, marginBottom: 4 }}>儀員限定モード</div>
                            <Text type="secondary" style={{ fontSize: '12px' }}>
                                ONにすると儀員のみアクセス可能になります
                            </Text>
                        </div>
                        <Switch
                            checked={isGiinOnly}
                            onChange={onGiinOnlyChange}
                            checkedChildren={<LockOutlined />}
                            unCheckedChildren="OFF"
                        />
                    </div>
                </div>
            </div>
        </Modal>
    )
}
