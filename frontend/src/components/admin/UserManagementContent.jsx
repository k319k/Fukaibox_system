import { useState, useEffect, useCallback } from 'react'
import { Card, Table, message } from 'antd'
import { useAuthStore } from '../../store/authStore'
import BlockUserModal from './BlockUserModal'
import { getUserTableColumns, getBlockedUsersTableColumns } from './UserTableColumns'

// Helper function to get API URL
const getApiUrl = () => {
    return window.location.origin.includes('localhost')
        ? 'http://localhost:8000'
        : 'https://fukaibox.kanjousekai.jp/api'
}

/**
 * User Management Content Component
 * Manage users, block/unblock functionality for admin panel
 */
export default function UserManagementContent() {
    const { token } = useAuthStore()
    const [users, setUsers] = useState([])
    const [blockedUsers, setBlockedUsers] = useState([])
    const [loading, setLoading] = useState(true)
    const [blockModalOpen, setBlockModalOpen] = useState(false)
    const [selectedUser, setSelectedUser] = useState(null)
    const [blockReason, setBlockReason] = useState('')

    useEffect(() => {
        fetchUsers()
        fetchBlockedUsers()
    }, [])

    const fetchUsers = useCallback(async () => {
        setLoading(true)
        try {
            const apiUrl = getApiUrl()
            const response = await fetch(`${apiUrl}/users`, {
                headers: { 'Authorization': `Bearer ${token}` }
            })

            if (!response.ok) throw new Error('Failed to fetch users')

            const data = await response.json()
            setUsers(data)
        } catch (error) {
            message.error('ユーザー一覧の取得に失敗しました')
            console.error(error)
        } finally {
            setLoading(false)
        }
    }, [token])

    const fetchBlockedUsers = useCallback(async () => {
        try {
            const apiUrl = getApiUrl()
            const response = await fetch(`${apiUrl}/admin/users/blocked`, {
                headers: { 'Authorization': `Bearer ${token}` }
            })

            if (!response.ok) throw new Error('Failed to fetch blocked users')

            const data = await response.json()
            setBlockedUsers(data)
        } catch (error) {
            console.error('Failed to fetch blocked users:', error)
        }
    }, [token])

    useEffect(() => {
        fetchUsers()
        fetchBlockedUsers()
    }, [fetchUsers, fetchBlockedUsers])

    const handleBlockUser = async () => {
        if (!blockReason.trim()) {
            message.error('ブロック理由を入力してください')
            return
        }

        try {
            const apiUrl = getApiUrl()
            const response = await fetch(`${apiUrl}/admin/users/${selectedUser.id}/block?reason=${encodeURIComponent(blockReason)}`, {
                method: 'POST',
                headers: { 'Authorization': `Bearer ${token}` }
            })

            if (!response.ok) throw new Error('Failed to block user')

            message.success('ユーザーをブロックしました')
            setBlockModalOpen(false)
            setBlockReason('')
            setSelectedUser(null)
            fetchUsers()
            fetchBlockedUsers()
        } catch (error) {
            message.error('ブロックに失敗しました')
            console.error(error)
        }
    }

    const handleUnblockUser = async (userId) => {
        try {
            const apiUrl = getApiUrl()
            const response = await fetch(`${apiUrl}/admin/users/${userId}/unblock`, {
                method: 'POST',
                headers: { 'Authorization': `Bearer ${token}` }
            })

            if (!response.ok) throw new Error('Failed to unblock user')

            message.success('ブロックを解除しました')
            fetchUsers()
            fetchBlockedUsers()
        } catch (error) {
            message.error('解除に失敗しました')
            console.error(error)
        }
    }

    const handleOpenBlockModal = (user) => {
        setSelectedUser(user)
        setBlockModalOpen(true)
    }

    const handleCloseBlockModal = () => {
        setBlockModalOpen(false)
        setBlockReason('')
        setSelectedUser(null)
    }

    const userColumns = getUserTableColumns(handleOpenBlockModal, handleUnblockUser)
    const blockedColumns = getBlockedUsersTableColumns(handleUnblockUser)

    return (
        <>
            {/* All Users Table */}
            <Card title="全ユーザー" style={{ marginBottom: 24 }}>
                <Table
                    dataSource={users}
                    columns={userColumns}
                    rowKey="id"
                    loading={loading}
                    pagination={{ pageSize: 10 }}
                />
            </Card>

            {/* Blocked Users Table */}
            {blockedUsers.length > 0 && (
                <Card title="ブロック済みユーザー">
                    <Table
                        dataSource={blockedUsers}
                        columns={blockedColumns}
                        rowKey="id"
                        pagination={false}
                    />
                </Card>
            )}

            {/* Block User Modal */}
            <BlockUserModal
                open={blockModalOpen}
                user={selectedUser}
                reason={blockReason}
                onReasonChange={(e) => setBlockReason(e.target.value)}
                onOk={handleBlockUser}
                onCancel={handleCloseBlockModal}
            />
        </>
    )
}
