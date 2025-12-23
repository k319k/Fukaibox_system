/**
 * Show New Key Modal Component
 * Displays the newly created API key (shown only once)
 */
import React from 'react';
import { Modal, Input, Button, Space, Typography } from 'antd';
import { CopyOutlined } from '@ant-design/icons';

const { Text } = Typography;

export default function ShowNewKeyModal({ keyData, onClose, onCopy }) {
    return (
        <Modal
            title="API Key Created!"
            open={!!keyData}
            onOk={onClose}
            onCancel={onClose}
            footer={[
                <Button key="done" type="primary" onClick={onClose}>
                    Done
                </Button>
            ]}
        >
            <Space direction="vertical" style={{ width: '100%' }}>
                <Text type="warning" strong>
                    ⚠️ Copy this key now! It won't be shown again.
                </Text>
                <Input.TextArea
                    value={keyData?.key}
                    readOnly
                    autoSize
                    style={{ fontFamily: 'monospace' }}
                />
                <Button
                    icon={<CopyOutlined />}
                    onClick={() => onCopy(keyData?.key)}
                    block
                >
                    Copy to Clipboard
                </Button>
            </Space>
        </Modal>
    );
}
