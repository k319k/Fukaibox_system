/**
 * Backup Management Page (Gicho only)
 * Manage PostgreSQL backups and restore operations
 */
import { useState, useEffect, useCallback } from 'react';
import { Card, Button, Typography, Space } from 'antd';
import { PlusOutlined, ReloadOutlined } from '@ant-design/icons';
import axios from 'axios';
import { useAuthStore } from '../store/authStore';
import BackupTable from '../components/backup/BackupTable';
import { useBackupActions } from '../components/backup/useBackupActions';
import { getApiUrl } from '../components/backup/utils';

const { Title } = Typography;

export default function BackupManagement() {
    const { token } = useAuthStore();
    const [backups, setBackups] = useState([]);
    const [tableLoading, setTableLoading] = useState(false);

    const loadBackups = useCallback(async () => {
        setTableLoading(true);
        try {
            const res = await axios.get(`${getApiUrl()}/backup/local/list`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setBackups(res.data);
        } catch (error) {
            console.error('Failed to load backups:', error);
        } finally {
            setTableLoading(false);
        }
    }, [token]);

    useEffect(() => {
        loadBackups();
    }, [loadBackups]);

    const { loading, handleCreateBackup, handleRestore, handleDelete } = useBackupActions(token, loadBackups);

    return (
        <div style={{ padding: '24px', maxWidth: '1200px', margin: '0 auto' }}>
            <Title level={2}>Backup Management</Title>

            <Card
                title="Local Backups"
                extra={
                    <Space>
                        <Button
                            icon={<ReloadOutlined />}
                            onClick={loadBackups}
                            loading={tableLoading}
                        >
                            Refresh
                        </Button>
                        <Button
                            type="primary"
                            icon={<PlusOutlined />}
                            onClick={handleCreateBackup}
                            loading={loading}
                        >
                            Create New Backup
                        </Button>
                    </Space>
                }
            >
                <BackupTable
                    backups={backups}
                    loading={tableLoading}
                    onRestore={handleRestore}
                    onDelete={handleDelete}
                    onRefresh={loadBackups}
                />
            </Card>
        </div>
    );
}
