import { Modal, Input, Typography } from 'antd'

const { Text } = Typography
const { TextArea } = Input

/**
 * Block User Modal Component
 * Modal for blocking a user with reason input
 * 
 * @param {Object} props
 * @param {boolean} props.open - Modal visibility
 * @param {Object} props.user - User object to block
 * @param {string} props.reason - Block reason value
 * @param {Function} props.onReasonChange - Callback when reason changes
 * @param {Function} props.onOk - Callback when OK button is clicked
 * @param {Function} props.onCancel - Callback when Cancel button is clicked
 */
export default function BlockUserModal({
    open,
    user,
    reason,
    onReasonChange,
    onOk,
    onCancel
}) {
    return (
        <Modal
            title="ユーザーをブロック"
            open={open}
            onOk={onOk}
            onCancel={onCancel}
            okText="ブロック"
            cancelText="キャンセル"
            okButtonProps={{ danger: true }}
        >
            <div style={{ marginBottom: 16 }}>
                <Text strong>ユーザー: </Text>
                <Text>{user?.username}</Text>
            </div>
            <div>
                <Text strong>ブロック理由 *</Text>
                <TextArea
                    value={reason}
                    onChange={onReasonChange}
                    placeholder="ブロックする理由を入力してください"
                    rows={4}
                    style={{ marginTop: 8 }}
                />
            </div>
        </Modal>
    )
}
