/**
 * API Key Table Component
 * Displays and manages API keys
 */
import React from 'react';
import { Table, Button, Tag, Typography, Space, Tooltip } from 'antd';
import { KeyOutlined, DeleteOutlined } from '@ant-design/icons';

const { Text } = Typography;

export default function ApiKeyTable({ apiKeys, loading, onDelete }) {
    const columns = [
        {
            title: 'Name',
            dataIndex: 'name',
            key: 'name',
            render: (text) => <Text strong>{text}</Text>
        },
        {
            title: 'Key Prefix',
            dataIndex: 'key_prefix',
            key: 'key_prefix',
            render: (prefix) => (
                <Tag icon={<KeyOutlined />} color="blue">
                    {prefix}...
                </Tag>
            )
        },
        {
            title: 'Permissions',
            dataIndex: 'permissions',
            key: 'permissions',
            render: (perms) => (
                <Space>
                    {perms.read_points && <Tag color="green">Read</Tag>}
                    {perms.write_points && <Tag color="orange">Write</Tag>}
                </Space>
            )
        },
        {
            title: 'Created',
            dataIndex: 'created_at',
            key: 'created_at',
            render: (date) => new Date(date).toLocaleDateString()
        },
        {
            title: 'Last Used',
            dataIndex: 'last_used_at',
            key: 'last_used_at',
            render: (date) => date ? new Date(date).toLocaleDateString() : 'Never'
        },
        {
            title: 'Actions',
            key: 'actions',
            render: (_, record) => (
                <Tooltip title="Delete">
                    <Button
                        type="text"
                        danger
                        icon={<DeleteOutlined />}
                        onClick={() => onDelete(record.id, record.name)}
                    />
                </Tooltip>
            )
        }
    ];

    return (
        <Table
            columns={columns}
            dataSource={apiKeys}
            rowKey="id"
            loading={loading}
            pagination={false}
        />
    );
}
