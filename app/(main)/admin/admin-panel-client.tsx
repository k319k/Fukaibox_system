"use client";

import { Card, CardBody, CardHeader, Button, Chip, Avatar, Input, Divider, Modal, ModalContent, ModalHeader, ModalBody, ModalFooter, useDisclosure, Table, TableHeader, TableColumn, TableBody, TableRow, TableCell } from "@heroui/react";
import { Shield, History, Users, Plus, Minus, Search } from "lucide-react";
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

const roleBadgeClasses: Record<string, string> = {
    gicho: "bg-[#ffdad5] text-[#73342b]",
    giin: "bg-[#d7f0cb] text-[#10200a]",
    meiyo_giin: "bg-[#fbe7a6] text-[#564419]",
    guest: "bg-[var(--md-sys-color-surface-container-high)] text-[var(--md-sys-color-on-surface-variant)]",
};

export function AdminPanelClient({
    user,
    initialPointHistory,
    initialUsersWithPoints,
}: AdminPanelClientProps) {
    const { isOpen, onOpen, onClose } = useDisclosure();
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
            onClose();
            setPointAmount("");
            setReason("");
            setSelectedUser(null);
            // ページをリロードしてデータを更新
            window.location.reload();
        } else {
            alert(result.error);
        }
        setIsSubmitting(false);
    };

    const openModifyModal = (usr: UserWithPoints) => {
        setSelectedUser(usr);
        onOpen();
    };

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className="max-w-6xl mx-auto space-y-8"
        >
            {/* Header */}
            <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-[#ffdad5] rounded-[16px] flex items-center justify-center">
                    <Shield className="w-6 h-6 text-[#73342b]" />
                </div>
                <div>
                    <h1 className="text-3xl font-bold tracking-tight text-[var(--md-sys-color-on-surface)]">
                        AdminPanel
                    </h1>
                    <p className="text-[var(--md-sys-color-on-surface-variant)]">
                        儀員管理と点数管理
                    </p>
                </div>
                <Chip
                    size="sm"
                    variant="flat"
                    className="ml-auto rounded-full px-3 bg-[#ffdad5] text-[#73342b]"
                >
                    儀長専用
                </Chip>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Users List */}
                <Card className="bg-[var(--md-sys-color-surface-container-lowest)] rounded-[28px] border-none shadow-none">
                    <CardHeader className="p-8 pb-4 flex-col items-start gap-4">
                        <div className="flex items-center gap-4 w-full">
                            <Users className="w-5 h-5 text-[#73342b]" />
                            <h2 className="text-xl font-bold tracking-tight text-[var(--md-sys-color-on-surface)]">
                                儀員一覧
                            </h2>
                        </div>
                        <Input
                            placeholder="ユーザーを検索..."
                            variant="flat"
                            radius="lg"
                            startContent={<Search className="w-4 h-4 text-[var(--md-sys-color-on-surface-variant)]" />}
                            value={searchQuery}
                            onValueChange={setSearchQuery}
                            classNames={{
                                inputWrapper: "bg-[var(--md-sys-color-surface-container-high)]",
                            }}
                        />
                    </CardHeader>
                    <CardBody className="px-8 pb-8 max-h-[500px] overflow-y-auto">
                        <div className="space-y-2">
                            {filteredUsers.map((usr) => {
                                const displayName = usr.discordUsername || usr.name;
                                const roleLabel = roleLabels[usr.role] || "ゲスト";
                                const roleBadgeClass = roleBadgeClasses[usr.role] || roleBadgeClasses.guest;
                                return (
                                    <motion.div
                                        key={usr.id}
                                        whileHover={{ x: 4, transition: { duration: 0.2 } }}
                                        whileTap={{ scale: 0.98 }}
                                        className="flex items-center gap-4 p-4 rounded-[20px] hover:bg-[var(--md-sys-color-surface-container-high)] transition-all cursor-pointer"
                                        onClick={() => openModifyModal(usr)}
                                    >
                                        <Avatar
                                            size="sm"
                                            name={displayName[0]}
                                            src={usr.image || undefined}
                                            classNames={{
                                                base: "shrink-0 rounded-[12px]",
                                            }}
                                        />
                                        <div className="flex-1">
                                            <p className="font-medium text-[var(--md-sys-color-on-surface)]">
                                                {displayName}
                                            </p>
                                            <Chip
                                                size="sm"
                                                variant="flat"
                                                className={`rounded-full px-2 text-xs ${roleBadgeClass}`}
                                            >
                                                {roleLabel}
                                            </Chip>
                                        </div>
                                        <span className="font-mono text-sm text-[var(--md-sys-color-on-surface-variant)]">
                                            {usr.points.toFixed(1)}pt
                                        </span>
                                    </motion.div>
                                );
                            })}
                        </div>
                    </CardBody>
                </Card>

                {/* Point History */}
                <Card className="bg-[var(--md-sys-color-surface-container-lowest)] rounded-[28px] border-none shadow-none">
                    <CardHeader className="p-8 pb-4 flex-row items-center gap-4">
                        <History className="w-5 h-5 text-[#73342b]" />
                        <h2 className="text-xl font-bold tracking-tight text-[var(--md-sys-color-on-surface)]">
                            点数履歴
                        </h2>
                    </CardHeader>
                    <CardBody className="px-8 pb-8 max-h-[500px] overflow-y-auto">
                        {initialPointHistory.length > 0 ? (
                            <div className="space-y-3">
                                {initialPointHistory.map((entry) => (
                                    <div
                                        key={entry.id}
                                        className="flex items-center gap-4 p-4 rounded-[20px] bg-[var(--md-sys-color-surface-container-high)]"
                                    >
                                        <Chip
                                            size="sm"
                                            variant="flat"
                                            className={`rounded-full px-3 font-mono ${entry.amount >= 0
                                                    ? "bg-[#d7f0cb] text-[#10200a]"
                                                    : "bg-[#ffdad6] text-[#93000a]"
                                                }`}
                                        >
                                            {entry.amount >= 0 ? "+" : ""}{entry.amount.toFixed(1)}
                                        </Chip>
                                        <div className="flex-1">
                                            <p className="font-medium text-[var(--md-sys-color-on-surface)]">
                                                {entry.userName}
                                            </p>
                                            <p className="text-sm text-[var(--md-sys-color-on-surface-variant)]">
                                                {entry.reason}
                                            </p>
                                        </div>
                                        <span className="text-xs text-[var(--md-sys-color-on-surface-variant)]">
                                            {new Date(entry.createdAt).toLocaleDateString("ja-JP")}
                                        </span>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="text-center py-12 text-[var(--md-sys-color-on-surface-variant)]">
                                <p>履歴がありません</p>
                            </div>
                        )}
                    </CardBody>
                </Card>
            </div>

            {/* Modify Points Modal */}
            <Modal
                isOpen={isOpen}
                onClose={onClose}
                radius="lg"
                classNames={{
                    base: "bg-[var(--md-sys-color-surface-container-lowest)] rounded-[28px]",
                }}
            >
                <ModalContent>
                    <ModalHeader className="flex flex-col gap-1">
                        点数を変更
                        {selectedUser && (
                            <span className="text-sm font-normal text-[var(--md-sys-color-on-surface-variant)]">
                                {selectedUser.discordUsername || selectedUser.name}
                                （現在: {selectedUser.points.toFixed(1)}pt）
                            </span>
                        )}
                    </ModalHeader>
                    <ModalBody>
                        <Input
                            type="number"
                            label="変更する点数"
                            placeholder="例: 10"
                            variant="flat"
                            radius="lg"
                            value={pointAmount}
                            onValueChange={setPointAmount}
                            classNames={{
                                inputWrapper: "bg-[var(--md-sys-color-surface-container-high)]",
                            }}
                        />
                        <Input
                            label="理由"
                            placeholder="例: 画像アップロード報酬"
                            variant="flat"
                            radius="lg"
                            value={reason}
                            onValueChange={setReason}
                            classNames={{
                                inputWrapper: "bg-[var(--md-sys-color-surface-container-high)]",
                            }}
                        />
                    </ModalBody>
                    <ModalFooter>
                        <div className="flex gap-3 w-full">
                            <motion.div whileTap={{ scale: 0.95 }} className="flex-1">
                                <Button
                                    color="danger"
                                    variant="flat"
                                    radius="full"
                                    className="w-full h-12 font-bold flex items-center justify-center gap-2"
                                    startContent={<Minus className="w-4 h-4" />}
                                    isLoading={isSubmitting}
                                    isDisabled={!pointAmount || !reason}
                                    onPress={() => handleModifyPoints(false)}
                                >
                                    減らす
                                </Button>
                            </motion.div>
                            <motion.div whileTap={{ scale: 0.95 }} className="flex-1">
                                <Button
                                    color="success"
                                    variant="flat"
                                    radius="full"
                                    className="w-full h-12 font-bold flex items-center justify-center gap-2"
                                    startContent={<Plus className="w-4 h-4" />}
                                    isLoading={isSubmitting}
                                    isDisabled={!pointAmount || !reason}
                                    onPress={() => handleModifyPoints(true)}
                                >
                                    増やす
                                </Button>
                            </motion.div>
                        </div>
                    </ModalFooter>
                </ModalContent>
            </Modal>
        </motion.div>
    );
}
