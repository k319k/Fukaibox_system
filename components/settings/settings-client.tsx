"use client";

import { Card, CardBody, CardHeader, Avatar, Button, Divider, Chip, Switch } from "@heroui/react";
import { Settings, User, Link2, Bell, LogOut, Shield } from "lucide-react";
import { motion } from "framer-motion";
import { signOut } from "@/lib/auth-client";

interface UserData {
    id: string;
    name: string;
    email: string;
    image: string | null;
    role: string;
    discordId?: string | null;
    discordUsername?: string | null;
}

interface SettingsClientProps {
    user: UserData;
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

export function SettingsClient({ user }: SettingsClientProps) {
    const roleLabel = roleLabels[user.role] || "ゲスト";
    const roleBadgeClass = roleBadgeClasses[user.role] || roleBadgeClasses.guest;
    const displayName = user.discordUsername || user.name;

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className="max-w-3xl mx-auto space-y-8"
        >
            {/* Header */}
            <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-[#ffdad5] rounded-[16px] flex items-center justify-center">
                    <Settings className="w-6 h-6 text-[#73342b]" />
                </div>
                <div>
                    <h1 className="text-3xl font-bold tracking-tight text-[var(--md-sys-color-on-surface)]">
                        設定
                    </h1>
                    <p className="text-[var(--md-sys-color-on-surface-variant)]">
                        アカウントと環境設定
                    </p>
                </div>
            </div>

            {/* Profile Section */}
            <Card className="bg-[var(--md-sys-color-surface-container-lowest)] rounded-[28px] border-none shadow-none">
                <CardHeader className="p-8 pb-4 flex-row items-center gap-4">
                    <User className="w-5 h-5 text-[#73342b]" />
                    <h2 className="text-xl font-bold tracking-tight text-[var(--md-sys-color-on-surface)]">
                        プロフィール
                    </h2>
                </CardHeader>
                <CardBody className="px-8 pb-8 space-y-6">
                    <div className="flex items-center gap-6">
                        <Avatar
                            size="lg"
                            name={displayName[0]}
                            src={user.image || undefined}
                            classNames={{
                                base: "ring-4 ring-[var(--md-sys-color-outline-variant)]/30 rounded-[20px] w-20 h-20",
                            }}
                        />
                        <div className="flex-1 space-y-2">
                            <p className="text-2xl font-bold text-[var(--md-sys-color-on-surface)]">
                                {displayName}
                            </p>
                            <div className="flex items-center gap-3">
                                <Chip
                                    size="sm"
                                    variant="flat"
                                    className={`rounded-full px-3 font-medium ${roleBadgeClass}`}
                                >
                                    {roleLabel}
                                </Chip>
                                {user.discordUsername && (
                                    <span className="text-sm text-[var(--md-sys-color-on-surface-variant)]">
                                        @{user.discordUsername}
                                    </span>
                                )}
                            </div>
                        </div>
                    </div>
                    <Divider className="bg-[var(--md-sys-color-outline-variant)]/30" />
                    <div className="space-y-4">
                        <div className="flex justify-between items-center">
                            <span className="text-[var(--md-sys-color-on-surface-variant)]">メールアドレス</span>
                            <span className="text-[var(--md-sys-color-on-surface)]">{user.email}</span>
                        </div>
                        <div className="flex justify-between items-center">
                            <span className="text-[var(--md-sys-color-on-surface-variant)]">ユーザーID</span>
                            <span className="text-[var(--md-sys-color-on-surface)] font-mono text-sm">{user.id.slice(0, 8)}...</span>
                        </div>
                    </div>
                </CardBody>
            </Card>

            {/* Discord Connection */}
            <Card className="bg-[var(--md-sys-color-surface-container-lowest)] rounded-[28px] border-none shadow-none">
                <CardHeader className="p-8 pb-4 flex-row items-center gap-4">
                    <Link2 className="w-5 h-5 text-[#73342b]" />
                    <h2 className="text-xl font-bold tracking-tight text-[var(--md-sys-color-on-surface)]">
                        連携サービス
                    </h2>
                </CardHeader>
                <CardBody className="px-8 pb-8">
                    <div className="flex items-center justify-between p-4 rounded-[20px] bg-[var(--md-sys-color-surface-container-high)]">
                        <div className="flex items-center gap-4">
                            <div className="w-10 h-10 bg-[#5865F2] rounded-full flex items-center justify-center">
                                <svg className="w-5 h-5 text-white" viewBox="0 0 24 24" fill="currentColor">
                                    <path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057 19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028 14.09 14.09 0 0 0 1.226-1.994.076.076 0 0 0-.041-.106 13.107 13.107 0 0 1-1.872-.892.077.077 0 0 1-.008-.128 10.2 10.2 0 0 0 .372-.292.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127 12.299 12.299 0 0 1-1.873.892.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.839 19.839 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03z" />
                                </svg>
                            </div>
                            <div>
                                <p className="font-medium text-[var(--md-sys-color-on-surface)]">Discord</p>
                                {user.discordId ? (
                                    <p className="text-sm text-[var(--md-sys-color-on-surface-variant)]">
                                        連携済み
                                    </p>
                                ) : (
                                    <p className="text-sm text-[var(--md-sys-color-on-surface-variant)]">
                                        未連携
                                    </p>
                                )}
                            </div>
                        </div>
                        <Chip
                            size="sm"
                            variant="flat"
                            className={`rounded-full px-3 ${user.discordId ? "bg-[#d7f0cb] text-[#10200a]" : "bg-[var(--md-sys-color-surface-container-highest)] text-[var(--md-sys-color-on-surface-variant)]"}`}
                        >
                            {user.discordId ? "接続済み" : "未接続"}
                        </Chip>
                    </div>
                </CardBody>
            </Card>

            {/* Notification Settings */}
            <Card className="bg-[var(--md-sys-color-surface-container-lowest)] rounded-[28px] border-none shadow-none">
                <CardHeader className="p-8 pb-4 flex-row items-center gap-4">
                    <Bell className="w-5 h-5 text-[#73342b]" />
                    <h2 className="text-xl font-bold tracking-tight text-[var(--md-sys-color-on-surface)]">
                        通知設定
                    </h2>
                </CardHeader>
                <CardBody className="px-8 pb-8 space-y-4">
                    <div className="flex items-center justify-between p-4 rounded-[20px] hover:bg-[var(--md-sys-color-surface-container-high)] transition-colors">
                        <div>
                            <p className="font-medium text-[var(--md-sys-color-on-surface)]">配信通知</p>
                            <p className="text-sm text-[var(--md-sys-color-on-surface-variant)]">ライブ配信が開始されたときに通知</p>
                        </div>
                        <Switch
                            defaultSelected
                            color="primary"
                            classNames={{
                                wrapper: "group-data-[selected=true]:bg-[#73342b]",
                            }}
                            isDisabled
                        />
                    </div>
                    <div className="flex items-center justify-between p-4 rounded-[20px] hover:bg-[var(--md-sys-color-surface-container-high)] transition-colors">
                        <div>
                            <p className="font-medium text-[var(--md-sys-color-on-surface)]">料理進捗通知</p>
                            <p className="text-sm text-[var(--md-sys-color-on-surface-variant)]">料理プロジェクトの状態が変わったときに通知</p>
                        </div>
                        <Switch
                            defaultSelected
                            color="primary"
                            classNames={{
                                wrapper: "group-data-[selected=true]:bg-[#73342b]",
                            }}
                            isDisabled
                        />
                    </div>
                    <p className="text-xs text-[var(--md-sys-color-on-surface-variant)] text-center pt-2">
                        通知機能は現在開発中です
                    </p>
                </CardBody>
            </Card>

            {/* Account Actions */}
            <Card className="bg-[var(--md-sys-color-surface-container-lowest)] rounded-[28px] border-none shadow-none">
                <CardHeader className="p-8 pb-4 flex-row items-center gap-4">
                    <Shield className="w-5 h-5 text-[#73342b]" />
                    <h2 className="text-xl font-bold tracking-tight text-[var(--md-sys-color-on-surface)]">
                        アカウント
                    </h2>
                </CardHeader>
                <CardBody className="px-8 pb-8">
                    <motion.div whileTap={{ scale: 0.95 }}>
                        <Button
                            color="danger"
                            variant="flat"
                            radius="full"
                            className="w-full h-14 font-bold flex items-center justify-center gap-2"
                            startContent={<LogOut className="w-5 h-5" />}
                            onPress={() => signOut()}
                        >
                            ログアウト
                        </Button>
                    </motion.div>
                </CardBody>
            </Card>
        </motion.div>
    );
}
