"use client";

import { Card, Button, Input, Select, Switch, Alert } from "antd";
import { Icon } from "@iconify/react";
import { motion } from "framer-motion";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { saveToolsApp } from "@/app/actions/tools-core";

const { TextArea } = Input;

interface UserData {
    id: string;
    name: string;
    role: string;
}

interface ToolsCreateClientProps {
    user: UserData;
}

const appTypes = [
    { key: "embed", label: "埋め込み", description: "外部サイトをiframeで埋め込み", icon: "material-symbols:open-in-new" },
    { key: "link", label: "リンク", description: "外部サイトへのリンク", icon: "material-symbols:link" },
    { key: "react", label: "React", description: "Reactコンポーネント", icon: "material-symbols:code" },
    { key: "html", label: "HTML", description: "HTMLファイル", icon: "material-symbols:html" },
];

export function ToolsCreateClient({ user }: ToolsCreateClientProps) {
    const router = useRouter();
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const [name, setName] = useState("");
    const [description, setDescription] = useState("");
    const [category, setCategory] = useState("");
    const [type, setType] = useState<"embed" | "link" | "react" | "html">("embed");
    const [embedUrl, setEmbedUrl] = useState("");
    const [isPublic, setIsPublic] = useState(false);

    const handleSubmit = async () => {
        if (!name.trim()) {
            setError("ツール名を入力してください");
            return;
        }

        if ((type === "embed" || type === "link") && !embedUrl.trim()) {
            setError("URLを入力してください");
            return;
        }

        setIsSubmitting(true);
        setError(null);

        const result = await saveToolsApp(null, {
            title: name.trim(),
            description: description.trim() || undefined,
            // category: category.trim() || undefined,
            files: {},
            type,
        });

        if (result.success && result.appId) {
            router.push(`/tools/${result.appId}`);
        } else {
            setError(result.error || "作成に失敗しました");
            setIsSubmitting(false);
        }
    };

    return (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }} className="max-w-2xl mx-auto flex flex-col gap-8 w-full">
            {/* Header */}
            <div className="flex items-center gap-4">
                <Link href="/tools">
                    <Button type="text" shape="circle" icon={<Icon icon="material-symbols:arrow-back" className="w-5 h-5" />} />
                </Link>
                <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-[#ffdad5] rounded-[16px] flex items-center justify-center">
                        <Icon icon="material-symbols:build-outline" className="w-6 h-6 text-[#73342b]" />
                    </div>
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight text-[var(--md-sys-color-on-surface)]">新規ツール作成</h1>
                        <p className="text-[var(--md-sys-color-on-surface-variant)]">ツールを登録してみんなと共有しよう</p>
                    </div>
                </div>
            </div>

            {/* Form */}
            <Card className="bg-[var(--md-sys-color-surface-container-lowest)] rounded-[28px] shadow-none border-none w-full">
                <div className="p-8 flex flex-col gap-6 w-full">
                    {error && <Alert message={error} type="error" showIcon className="rounded-[16px]" />}

                    <div>
                        <label className="text-sm font-medium text-[var(--md-sys-color-on-surface)] mb-2 block">ツール名 <span className="text-red-500">*</span></label>
                        <Input
                            placeholder="例: カウンター"
                            size="large"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            className="rounded-[16px]"
                        />
                    </div>

                    <div>
                        <label className="text-sm font-medium text-[var(--md-sys-color-on-surface)] mb-2 block">説明</label>
                        <TextArea
                            placeholder="ツールの説明を入力..."
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            rows={4}
                            className="rounded-[16px]"
                        />
                    </div>

                    <div>
                        <label className="text-sm font-medium text-[var(--md-sys-color-on-surface)] mb-2 block">カテゴリ</label>
                        <Input
                            placeholder="例: ユーティリティ"
                            size="large"
                            value={category}
                            onChange={(e) => setCategory(e.target.value)}
                            className="rounded-[16px]"
                        />
                    </div>

                    <div>
                        <label className="text-sm font-medium text-[var(--md-sys-color-on-surface)] mb-2 block">ツールタイプ</label>
                        <Select
                            value={type}
                            onChange={(value) => setType(value)}
                            size="large"
                            className="w-full"
                            options={appTypes.map((t) => ({
                                value: t.key,
                                label: (
                                    <div className="flex items-center gap-3">
                                        <Icon icon={t.icon} className="w-4 h-4" />
                                        <div>
                                            <p className="font-medium">{t.label}</p>
                                            <p className="text-xs text-[var(--md-sys-color-on-surface-variant)]">{t.description}</p>
                                        </div>
                                    </div>
                                ),
                            }))}
                        />
                    </div>

                    {(type === "embed" || type === "link") && (
                        <div>
                            <label className="text-sm font-medium text-[var(--md-sys-color-on-surface)] mb-2 block">URL <span className="text-red-500">*</span></label>
                            <Input
                                placeholder="https://example.com"
                                size="large"
                                value={embedUrl}
                                onChange={(e) => setEmbedUrl(e.target.value)}
                                className="rounded-[16px]"
                            />
                        </div>
                    )}

                    {(type === "react" || type === "html") && (
                        <Alert
                            message="React/HTMLファイルのアップロード機能は今後実装予定です。現在は埋め込みまたはリンクタイプをご利用ください。"
                            type="warning"
                            showIcon
                            className="rounded-[16px]"
                        />
                    )}

                    <div className="flex items-center justify-between p-4 rounded-[20px] bg-[var(--md-sys-color-surface-container-high)]/50">
                        <div>
                            <p className="font-medium text-[var(--md-sys-color-on-surface)]">公開する</p>
                            <p className="text-sm text-[var(--md-sys-color-on-surface-variant)]">他のユーザーがGalleryで閲覧できます</p>
                        </div>
                        <Switch checked={isPublic} onChange={setIsPublic} />
                    </div>

                    <Button
                        type="primary"
                        shape="round"
                        size="large"
                        block
                        className="h-14 font-bold bg-[#ffdad5] text-[#73342b] border-none"
                        icon={<Icon icon="material-symbols:save-outline" className="w-5 h-5" />}
                        loading={isSubmitting}
                        onClick={handleSubmit}
                    >
                        作成する
                    </Button>
                </div>
            </Card>
        </motion.div>
    );
}
