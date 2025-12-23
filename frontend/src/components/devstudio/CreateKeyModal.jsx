/**
 * Create API Key Modal Component
 */
import React from 'react';
import { Modal, Input, Space, Typography } from 'antd';

const { Text } = Typography;

export default function CreateKeyModal({ visible, keyName, onNameChange, onCreate, onCancel }) {
    return (
        <Modal
            title="Create New API Key"
            open={visible}
            onOk={onCreate}
            onCancel={onCancel}
            okText="Create"
        >
            <Space direction="vertical" style={{ width: '100%' }}>
                <Text>Enter a name for your API key:</Text>
                <Input
                    placeholder="e.g., My Discord Bot"
                    value={keyName}
                    onChange={(e) => onNameChange(e.target.value)}
                    onPressEnter={onCreate}
                />
            </Space>
        </Modal>
    );
}
