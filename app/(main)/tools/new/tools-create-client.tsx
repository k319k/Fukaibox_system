"use client";

import { Card, CardBody, CardHeader, Button, Input, Textarea, Select, SelectItem, Switch } from "@heroui/react";
import { Wrench, ArrowLeft, Save, Link2, Code, FileCode, ExternalLink } from "lucide-react";
import { motion } from "framer-motion";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { createApp } from "@/app/actions/tools";

interface UserData {
    id: string;
    name: string;
    role: string;
}

interface ToolsCreateClientProps {
    user: UserData;
}

const appTypes = [
    { key: "embed", label: "埋め込み", description: "外部サイトをiframeで埋め込み", icon: ExternalLink },
    { key: "link", label: "リンク", description: "外部サイトへのリンク", icon: Link2 },
    { key: "react", label: "React", description: "Reactコンポーネント", icon: Code },
    { key: "html", label: "HTML", description: "HTMLファイル", icon: FileCode },
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

        const result = await createApp({
            name: name.trim(),
            description: description.trim() || undefined,
            category: category.trim() || undefined,
            type,
            embedUrl: embedUrl.trim() || null,
            isPublic,
        });

        if (result.success && result.appId) {
            router.push(`/tools/${result.appId}`);
        } else {
            setError(result.error || "作成に失敗しました");
            setIsSubmitting(false);
        }
    };

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className="max-w-2xl mx-auto space-y-8"
        >
            {/* Header */}
            <div className="flex items-center gap-4">
                <Link href="/tools">
                    <motion.div whileTap={{ scale: 0.95 }}>
                        <Button
                            isIconOnly
                            variant="light"
                            radius="full"
                            className="flex items-center justify-center"
                        >
                            <ArrowLeft className="w-5 h-5" />
                        </Button>
                    </motion.div>
                </Link>
                <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-[#ffdad5] rounded-[16px] flex items-center justify-center">
                        <Wrench className="w-6 h-6 text-[#73342b]" />
                    </div>
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight text-[var(--md-sys-color-on-surface)]">
                            新規ツール作成
                        </h1>
                        <p className="text-[var(--md-sys-color-on-surface-variant)]">
                            ツールを登録してみんなと共有しよう
                        </p>
                    </div>
                </div>
            </div>

            {/* Form */}
            <Card className="bg-[var(--md-sys-color-surface-container-lowest)] rounded-[28px] border-none shadow-none">
                <CardBody className="p-8 space-y-6">
                    {error && (
                        <div className="p-4 rounded-[16px] bg-[#ffdad6] text-[#93000a]">
                            {error}
                        </div>
                    )}

                    <Input
                        label="ツール名"
                        placeholder="例: カウンター"
                        variant="flat"
                        radius="lg"
                        value={name}
                        onValueChange={setName}
                        isRequired
                        classNames={{
                            inputWrapper: "bg-[var(--md-sys-color-surface-container-high)] h-14",
                        }}
                    />

                    <Textarea
                        label="説明"
                        placeholder="ツールの説明を入力..."
                        variant="flat"
                        radius="lg"
                        value={description}
                        onValueChange={setDescription}
                        classNames={{
                            inputWrapper: "bg-[var(--md-sys-color-surface-container-high)]",
                        }}
                        minRows={3}
                    />

                    <Input
                        label="カテゴリ"
                        placeholder="例: ユーティリティ"
                        variant="flat"
                        radius="lg"
                        value={category}
                        onValueChange={setCategory}
                        classNames={{
                            inputWrapper: "bg-[var(--md-sys-color-surface-container-high)] h-14",
                        }}
                    />

                    <Select
                        label="ツールタイプ"
                        placeholder="タイプを選択"
                        variant="flat"
                        radius="lg"
                        selectedKeys={[type]}
                        onSelectionChange={(keys) => {
                            const selected = Array.from(keys)[0] as "embed" | "link" | "react" | "html";
                            if (selected) setType(selected);
                        }}
                        classNames={{
                            trigger: "bg-[var(--md-sys-color-surface-container-high)] h-14",
                        }}
                    >
                        {appTypes.map((t) => (
                            <SelectItem key={t.key} textValue={t.label}>
                                <div className="flex items-center gap-3">
                                    <t.icon className="w-4 h-4" />
                                    <div>
                                        <p className="font-medium">{t.label}</p>
                                        <p className="text-xs text-[var(--md-sys-color-on-surface-variant)]">
                                            {t.description}
                                        </p>
                                    </div>
                                </div>
                            </SelectItem>
                        ))}
                    </Select>

                    {(type === "embed" || type === "link") && (
                        <Input
                            label="URL"
                            placeholder="https://example.com"
                            variant="flat"
                            radius="lg"
                            value={embedUrl}
                            onValueChange={setEmbedUrl}
                            isRequired
                            classNames={{
                                inputWrapper: "bg-[var(--md-sys-color-surface-container-high)] h-14",
                            }}
                        />
                    )}

                    {(type === "react" || type === "html") && (
                        <div className="p-4 rounded-[16px] bg-[#fbe7a6] text-[#564419]">
                            React/HTMLファイルのアップロード機能は今後実装予定です。
                            現在は埋め込みまたはリンクタイプをご利用ください。
                        </div>
                    )}

                    <div className="flex items-center justify-between p-4 rounded-[20px] bg-[var(--md-sys-color-surface-container-high)]">
                        <div>
                            <p className="font-medium text-[var(--md-sys-color-on-surface)]">
                                公開する
                            </p>
                            <p className="text-sm text-[var(--md-sys-color-on-surface-variant)]">
                                他のユーザーがGalleryで閲覧できます
                            </p>
                        </div>
                        <Switch
                            isSelected={isPublic}
                            onValueChange={setIsPublic}
                            color="primary"
                            classNames={{
                                wrapper: "group-data-[selected=true]:bg-[#73342b]",
                            }}
                        />
                    </div>

                    <motion.div whileTap={{ scale: 0.95 }}>
                        <Button
                            color="primary"
                            variant="flat"
                            radius="full"
                            className="w-full h-14 font-bold bg-[#ffdad5] text-[#73342b] flex items-center justify-center gap-2"
                            startContent={<Save className="w-5 h-5" />}
                            isLoading={isSubmitting}
                            onPress={handleSubmit}
                        >
                            作成する
                        </Button>
                    </motion.div>
                </CardBody>
            </Card>
        </motion.div>
    );
}
