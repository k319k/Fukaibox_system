"use client";

import { Card, Button, Tag, Avatar, Input, Modal } from "antd";
import { Icon } from "@iconify/react";
import { motion } from "framer-motion";
import { useState } from "react";
import { modifyUserPoints, type PointHistoryEntry, type UserWithPoints } from "@/app/actions/admin";

interface UserData {
    id: string;
    name: string;
    role: string;
}

interface AdminPanelClientProps {
    user: UserData;
    initialPointHistory: PointHistoryEntry[];
    initialUsersWithPoints: UserWithPoints[];
}

const roleLabels: Record<string, string> = {
    gicho: "儀長",
    giin: "儀員",
    meiyo_giin: "名誉儀員",
    guest: "ゲスト",
};

const roleBadgeClasses: Record<string, { bg: string; text: string }> = {
    gicho: { bg: "#ffdad5", text: "#73342b" },
    giin: { bg: "#d7f0cb", text: "#10200a" },
    meiyo_giin: { bg: "#fbe7a6", text: "#564419" },
    guest: { bg: "var(--md-sys-color-surface-container-high)", text: "var(--md-sys-color-on-surface-variant)" },
};

export function AdminPanelClient({ user, initialPointHistory, initialUsersWithPoints }: AdminPanelClientProps) {
    const [isOpen, setIsOpen] = useState(false);
    const [selectedUser, setSelectedUser] = useState<UserWithPoints | null>(null);
    const [pointAmount, setPointAmount] = useState("");
    const [reason, setReason] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [searchQuery, setSearchQuery] = useState("");

    const filteredUsers = initialUsersWithPoints.filter(u =>
        u.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (u.discordUsername?.toLowerCase().includes(searchQuery.toLowerCase()) ?? false)
    );

    const handleModifyPoints = async (isAdd: boolean) => {
        if (!selectedUser || !pointAmount || !reason) return;

        setIsSubmitting(true);
        const amount = isAdd ? parseFloat(pointAmount) : -parseFloat(pointAmount);
        const result = await modifyUserPoints(selectedUser.id, amount, reason);

        if (result.success) {
            setIsOpen(false);
            setPointAmount("");
            setReason("");
            setSelectedUser(null);
            window.location.reload();
        } else {
            alert(result.error);
        }
        setIsSubmitting(false);
    };

    const openModifyModal = (usr: UserWithPoints) => {
        setSelectedUser(usr);
        setIsOpen(true);
    };

    return (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }} className="max-w-6xl mx-auto space-y-8">
            {/* Header */}
            <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-[#ffdad5] rounded-[16px] flex items-center justify-center">
                    <Icon icon="material-symbols:shield-outline" className="w-6 h-6 text-[#73342b]" />
                </div>
                <div>
                    <h1 className="text-3xl font-bold tracking-tight text-[var(--md-sys-color-on-surface)]">AdminPanel</h1>
                    <p className="text-[var(--md-sys-color-on-surface-variant)]">儀員管理と点数管理</p>
                </div>
                <Tag className="ml-auto rounded-full px-3 bg-[#ffdad5] text-[#73342b] border-none">儀長専用</Tag>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Users List */}
                <Card className="bg-[var(--md-sys-color-surface-container-lowest)] rounded-[28px] border-none shadow-none">
                    <div className="p-8 pb-4 flex flex-col gap-4">
                        <div className="flex items-center gap-4 w-full">
                            <Icon icon="material-symbols:group-outline" className="w-6 h-6 text-[#73342b]" />
                            <h2 className="text-xl font-bold tracking-tight text-[var(--md-sys-color-on-surface)]">儀員一覧</h2>
                        </div>
                        <Input
                            placeholder="ユーザーを検索..."
                            prefix={<Icon icon="material-symbols:search" className="w-5 h-5 text-[var(--md-sys-color-on-surface-variant)]" />}
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            size="large"
                            className="rounded-[16px]"
                        />
                    </div>
                    <div className="px-8 pb-8 max-h-[500px] overflow-y-auto">
                        <div className="space-y-2">
                            {filteredUsers.map((usr) => {
                                const displayName = usr.discordUsername || usr.name;
                                const roleLabel = roleLabels[usr.role] || "ゲスト";
                                const roleBadge = roleBadgeClasses[usr.role] || roleBadgeClasses.guest;
                                return (
                                    <motion.div
                                        key={usr.id}
                                        whileHover={{ x: 4 }}
                                        whileTap={{ scale: 0.98 }}
                                        className="flex items-center gap-4 p-4 rounded-[20px] hover:bg-[var(--md-sys-color-surface-container-high)] transition-all cursor-pointer"
                                        onClick={() => openModifyModal(usr)}
                                    >
                                        <Avatar size="small" src={usr.image || undefined} className="rounded-[12px]">{displayName[0]}</Avatar>
                                        <div className="flex-1">
                                            <p className="font-medium text-[var(--md-sys-color-on-surface)]">{displayName}</p>
                                            <Tag className="rounded-full px-2 text-xs border-none" style={{ backgroundColor: roleBadge.bg, color: roleBadge.text }}>{roleLabel}</Tag>
                                        </div>
                                        <span className="font-mono text-sm text-[var(--md-sys-color-on-surface-variant)]">{usr.points.toFixed(1)}pt</span>
                                    </motion.div>
                                );
                            })}
                        </div>
                    </div>
                </Card>

                {/* Point History */}
                <Card className="bg-[var(--md-sys-color-surface-container-lowest)] rounded-[28px] border-none shadow-none">
                    <div className="p-8 pb-4 flex items-center gap-4">
                        <Icon icon="material-symbols:history" className="w-6 h-6 text-[#73342b]" />
                        <h2 className="text-xl font-bold tracking-tight text-[var(--md-sys-color-on-surface)]">点数履歴</h2>
                    </div>
                    <div className="px-8 pb-8 max-h-[500px] overflow-y-auto">
                        {initialPointHistory.length > 0 ? (
                            <div className="space-y-3">
                                {initialPointHistory.map((entry) => (
                                    <div key={entry.id} className="flex items-center gap-4 p-4 rounded-[20px] bg-[var(--md-sys-color-surface-container-high)]">
                                        <Tag className={`rounded-full px-3 font-mono border-none ${entry.amount >= 0 ? "bg-[#d7f0cb] text-[#10200a]" : "bg-[#ffdad6] text-[#93000a]"}`}>
                                            {entry.amount >= 0 ? "+" : ""}{entry.amount.toFixed(1)}
                                        </Tag>
                                        <div className="flex-1">
                                            <p className="font-medium text-[var(--md-sys-color-on-surface)]">{entry.userName}</p>
                                            <p className="text-sm text-[var(--md-sys-color-on-surface-variant)]">{entry.reason}</p>
                                        </div>
                                        <span className="text-xs text-[var(--md-sys-color-on-surface-variant)]">{new Date(entry.createdAt).toLocaleDateString("ja-JP")}</span>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="text-center py-12 text-[var(--md-sys-color-on-surface-variant)]">
                                <p>履歴がありません</p>
                            </div>
                        )}
                    </div>
                </Card>
            </div>

            {/* Modify Points Modal */}
            <Modal
                open={isOpen}
                onCancel={() => setIsOpen(false)}
                title={
                    <div className="flex flex-col gap-1">
                        <span>点数を変更</span>
                        {selectedUser && (
                            <span className="text-sm font-normal text-[var(--md-sys-color-on-surface-variant)]">
                                {selectedUser.discordUsername || selectedUser.name}（現在: {selectedUser.points.toFixed(1)}pt）
                            </span>
                        )}
                    </div>
                }
                footer={
                    <div className="flex gap-3 w-full">
                        <motion.div whileTap={{ scale: 0.95 }} className="flex-1">
                            <Button
                                danger
                                block
                                size="large"
                                shape="round"
                                className="h-12 font-bold"
                                icon={<Icon icon="material-symbols:remove" className="w-5 h-5" />}
                                loading={isSubmitting}
                                disabled={!pointAmount || !reason}
                                onClick={() => handleModifyPoints(false)}
                            >
                                減らす
                            </Button>
                        </motion.div>
                        <motion.div whileTap={{ scale: 0.95 }} className="flex-1">
                            <Button
                                block
                                size="large"
                                shape="round"
                                className="h-12 font-bold bg-[#d7f0cb] text-[#10200a] border-none"
                                icon={<Icon icon="material-symbols:add" className="w-5 h-5" />}
                                loading={isSubmitting}
                                disabled={!pointAmount || !reason}
                                onClick={() => handleModifyPoints(true)}
                            >
                                増やす
                            </Button>
                        </motion.div>
                    </div>
                }
                className="rounded-[28px]"
            >
                <div className="space-y-4">
                    <div>
                        <label className="text-sm font-medium text-[var(--md-sys-color-on-surface)] mb-2 block">変更する点数</label>
                        <Input
                            type="number"
                            placeholder="例: 10"
                            size="large"
                            value={pointAmount}
                            onChange={(e) => setPointAmount(e.target.value)}
                            className="rounded-[16px]"
                        />
                    </div>
                    <div>
                        <label className="text-sm font-medium text-[var(--md-sys-color-on-surface)] mb-2 block">理由</label>
                        <Input
                            placeholder="例: 画像アップロード報酬"
                            size="large"
                            value={reason}
                            onChange={(e) => setReason(e.target.value)}
                            className="rounded-[16px]"
                        />
                    </div>
                </div>
            </Modal>
        </motion.div>
    );
}
