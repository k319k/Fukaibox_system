/**
 * Backup Management Content Component
 * Manage PostgreSQL backups and restore operations for admin panel
 */
import { useState, useEffect, useCallback } from 'react';
import { Card, Button, Space } from 'antd';
import { PlusOutlined, ReloadOutlined } from '@ant-design/icons';
import axios from 'axios';
import { useAuthStore } from '../../store/authStore';
import BackupTable from '../backup/BackupTable';
import { useBackupActions } from '../backup/useBackupActions';
import { getApiUrl } from '../backup/utils';

export default function BackupManagementContent() {
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
    );
}
