"use client";

import { Card, Avatar, Button, Divider, Tag, Switch } from "antd";
import { Icon } from "@iconify/react";
import { motion } from "framer-motion";
import { signOut } from "@/lib/auth-client";
import Link from "next/link";

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

const roleBadgeClasses: Record<string, { bg: string; text: string }> = {
    gicho: { bg: "var(--color-kitchen-tag-bg)", text: "var(--color-kitchen-tag-text)" },
    giin: { bg: "var(--color-kitchen-success-bg)", text: "var(--color-kitchen-success-text)" },
    meiyo_giin: { bg: "var(--color-kitchen-gold-bg)", text: "var(--color-kitchen-gold-text)" },
    guest: { bg: "var(--md-sys-color-surface-container-high)", text: "var(--md-sys-color-on-surface-variant)" },
};

export function SettingsClient({ user }: SettingsClientProps) {
    const roleLabel = roleLabels[user.role] || "ゲスト";
    const roleBadge = roleBadgeClasses[user.role] || roleBadgeClasses.guest;
    const displayName = user.discordUsername || user.name;

    return (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }} className="max-w-3xl mx-auto space-y-8">
            {/* Header */}
            <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-[var(--color-kitchen-tag-bg)] rounded-[16px] flex items-center justify-center">
                    <Icon icon="material-symbols:settings-outline" className="w-6 h-6 text-[var(--color-kitchen-tag-text)]" />
                </div>
                <div>
                    <h1 className="text-3xl font-bold tracking-tight text-[var(--md-sys-color-on-surface)]">設定</h1>
                    <p className="text-[var(--md-sys-color-on-surface-variant)]">アカウントと環境設定</p>
                </div>
            </div>

            {/* Profile Section */}
            <Card className="bg-[var(--md-sys-color-surface-container-lowest)] rounded-[28px] border-none shadow-none">
                <div className="p-8 pb-4 flex items-center gap-4">
                    <Icon icon="material-symbols:person-outline" className="w-5 h-5 text-[var(--md-sys-color-primary)]" />
                    <h2 className="text-xl font-bold tracking-tight text-[var(--md-sys-color-on-surface)]">プロフィール</h2>
                </div>
                <div className="px-8 pb-8 space-y-6">
                    <div className="flex items-center gap-6">
                        <Avatar size={80} src={user.image || undefined} className="ring-4 ring-[var(--md-sys-color-outline-variant)]/30 rounded-[20px]">{displayName[0]}</Avatar>
                        <div className="flex-1 space-y-2">
                            <p className="text-2xl font-bold text-[var(--md-sys-color-on-surface)]">{displayName}</p>
                            <div className="flex items-center gap-3">
                                <Tag className="rounded-full px-3 font-medium border-none" style={{ backgroundColor: roleBadge.bg, color: roleBadge.text }}>{roleLabel}</Tag>
                                {user.discordUsername && (<span className="text-sm text-[var(--md-sys-color-on-surface-variant)]">@{user.discordUsername}</span>)}
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
                </div>
            </Card>

            {/* Discord Connection */}
            <Card className="bg-[var(--md-sys-color-surface-container-lowest)] rounded-[28px] border-none shadow-none">
                <div className="p-8 pb-4 flex items-center gap-4">
                    <Icon icon="material-symbols:link" className="w-5 h-5 text-[var(--md-sys-color-primary)]" />
                    <h2 className="text-xl font-bold tracking-tight text-[var(--md-sys-color-on-surface)]">連携サービス</h2>
                </div>
                <div className="px-8 pb-8">
                    <div className="flex items-center justify-between p-4 rounded-[20px] bg-[var(--md-sys-color-surface-container-high)]">
                        <div className="flex items-center gap-4">
                            <div className="w-10 h-10 bg-[#5865F2] rounded-full flex items-center justify-center">
                                <Icon icon="mdi:discord" className="w-5 h-5 text-white" />
                            </div>
                            <div>
                                <p className="font-medium text-[var(--md-sys-color-on-surface)]">Discord</p>
                                <p className="text-sm text-[var(--md-sys-color-on-surface-variant)]">{user.discordId ? "連携済み" : "未連携"}</p>
                            </div>
                        </div>
                        <Tag className={`rounded-full px-3 border-none ${user.discordId ? "bg-[var(--color-kitchen-success-bg)] text-[var(--color-kitchen-success-text)]" : ""}`}>{user.discordId ? "接続済み" : "未接続"}</Tag>
                    </div>
                </div>
            </Card>

            {/* Notification Settings */}
            <Card className="bg-[var(--md-sys-color-surface-container-lowest)] rounded-[28px] border-none shadow-none">
                <div className="p-8 pb-4 flex items-center gap-4">
                    <Icon icon="material-symbols:notifications-outline" className="w-5 h-5 text-[var(--md-sys-color-primary)]" />
                    <h2 className="text-xl font-bold tracking-tight text-[var(--md-sys-color-on-surface)]">通知設定</h2>
                </div>
                <div className="px-8 pb-8 space-y-4">
                    <div className="flex items-center justify-between p-4 rounded-[20px] hover:bg-[var(--md-sys-color-surface-container-high)] transition-colors">
                        <div>
                            <p className="font-medium text-[var(--md-sys-color-on-surface)]">配信通知</p>
                            <p className="text-sm text-[var(--md-sys-color-on-surface-variant)]">ライブ配信が開始されたときに通知</p>
                        </div>
                        <Switch defaultChecked disabled />
                    </div>
                    <div className="flex items-center justify-between p-4 rounded-[20px] hover:bg-[var(--md-sys-color-surface-container-high)] transition-colors">
                        <div>
                            <p className="font-medium text-[var(--md-sys-color-on-surface)]">料理進捗通知</p>
                            <p className="text-sm text-[var(--md-sys-color-on-surface-variant)]">料理プロジェクトの状態が変わったときに通知</p>
                        </div>
                        <Switch defaultChecked disabled />
                    </div>
                    <p className="text-xs text-[var(--md-sys-color-on-surface-variant)] text-center pt-2">通知機能は現在開発中です</p>
                </div>
            </Card>

            {/* Account Actions */}
            <Card className="bg-[var(--md-sys-color-surface-container-lowest)] rounded-[28px] border-none shadow-none">
                <div className="p-8 pb-4 flex items-center gap-4">
                    <Icon icon="material-symbols:shield-outline" className="w-5 h-5 text-[var(--md-sys-color-primary)]" />
                    <h2 className="text-xl font-bold tracking-tight text-[var(--md-sys-color-on-surface)]">アカウント</h2>
                </div>
                <div className="px-8 pb-8">
                    <motion.div whileTap={{ scale: 0.95 }}>
                        <Button
                            danger
                            size="large"
                            shape="round"
                            block
                            className="h-14 font-bold"
                            icon={<Icon icon="material-symbols:logout" className="w-5 h-5" />}
                            onClick={() => signOut()}
                        >
                            ログアウト
                        </Button>
                    </motion.div>
                </div>
            </Card>
        </motion.div>
    );
}
