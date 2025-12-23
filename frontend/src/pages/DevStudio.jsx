/**
 * DevStudio Page - API Key Management
 * Allows 儀長 and permitted 儀員 to create and manage API keys.
 */
import React, { useState, useEffect, useCallback } from 'react';
import { Card, Button, Modal, message, Typography } from 'antd';
import { PlusOutlined, KeyOutlined } from '@ant-design/icons';
import axios from 'axios';
import { useAuthStore } from '../store/authStore';
import ApiDocumentation from '../components/ApiDocumentation';
import ApiKeyTable from '../components/devstudio/ApiKeyTable';
import CreateKeyModal from '../components/devstudio/CreateKeyModal';
import ShowNewKeyModal from '../components/devstudio/ShowNewKeyModal';

const { Title, Paragraph } = Typography;

export default function DevStudio() {
    const { token, user, isGicho } = useAuthStore();
    const [apiKeys, setApiKeys] = useState([]);
    const [loading, setLoading] = useState(false);
    const [createModalVisible, setCreateModalVisible] = useState(false);
    const [newKeyName, setNewKeyName] = useState('');
    const [newKeyData, setNewKeyData] = useState(null);

    // Check access permission
    useEffect(() => {
        if (!isGicho && !user?.can_manage_api_keys) {
            message.error('You do not have permission to access DevStudio');
            window.location.href = '/';
        }
    }, [user, isGicho]);

    // Load API keys
    const loadApiKeys = useCallback(async () => {
        setLoading(true);
        try {
            const res = await axios.get(`${import.meta.env.VITE_API_URL}/api/dev-studio/keys`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setApiKeys(res.data);
        } catch (error) {
            message.error('Failed to load API keys');
            console.error(error);
        } finally {
            setLoading(false);
        }
    }, [token]);

    useEffect(() => {
        loadApiKeys();
    }, [loadApiKeys]);

    // Create API key
    const handleCreateKey = async () => {
        if (!newKeyName.trim()) {
            message.error('Please enter a key name');
            return;
        }

        try {
            const res = await axios.post(
                `${import.meta.env.VITE_API_URL}/api/dev-studio/keys`,
                {
                    name: newKeyName,
                    permissions: { read_points: true, write_points: false }
                },
                { headers: { Authorization: `Bearer ${token}` } }
            );

            setNewKeyData(res.data);
            setNewKeyName('');
            setCreateModalVisible(false);
            loadApiKeys();
            message.success('API key created successfully!');
        } catch (error) {
            message.error('Failed to create API key');
            console.error(error);
        }
    };

    // Delete API key
    const handleDeleteKey = (keyId, keyName) => {
        Modal.confirm({
            title: 'Delete API Key',
            content: `Are you sure you want to delete "${keyName}"? This action cannot be undone.`,
            okText: 'Delete',
            okType: 'danger',
            onOk: async () => {
                try {
                    await axios.delete(`${import.meta.env.VITE_API_URL}/api/dev-studio/keys/${keyId}`, {
                        headers: { Authorization: `Bearer ${token}` }
                    });
                    message.success('API key deleted');
                    loadApiKeys();
                } catch (error) {
                    message.error('Failed to delete API key');
                    console.error(error);
                }
            }
        });
    };

    // Copy to clipboard
    const copyToClipboard = (text) => {
        navigator.clipboard.writeText(text);
        message.success('Copied to clipboard!');
    };

    return (
        <div style={{ padding: '24px', maxWidth: '1200px', margin: '0 auto' }}>
            <Title level={2}>
                <KeyOutlined /> DevStudio - API Key Management
            </Title>
            <Paragraph>
                Create and manage API keys to access FukaiBox public APIs from external tools.
            </Paragraph>

            <Card
                title="Your API Keys"
                extra={
                    <Button
                        type="primary"
                        icon={<PlusOutlined />}
                        onClick={() => setCreateModalVisible(true)}
                    >
                        Create New Key
                    </Button>
                }
                style={{ marginBottom: 24 }}
            >
                <ApiKeyTable
                    apiKeys={apiKeys}
                    loading={loading}
                    onDelete={handleDeleteKey}
                />
            </Card>

            <ApiDocumentation />

            <CreateKeyModal
                visible={createModalVisible}
                keyName={newKeyName}
                onNameChange={setNewKeyName}
                onCreate={handleCreateKey}
                onCancel={() => {
                    setCreateModalVisible(false);
                    setNewKeyName('');
                }}
            />

            <ShowNewKeyModal
                keyData={newKeyData}
                onClose={() => setNewKeyData(null)}
                onCopy={copyToClipboard}
            />
        </div>
    );
}
