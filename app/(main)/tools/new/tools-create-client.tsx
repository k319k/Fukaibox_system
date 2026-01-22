"use client";

import { Card, CardBody, Button, Input, Textarea, Select, SelectItem, Switch } from "@heroui/react";
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
            className="max-w-2xl mx-auto flex flex-col gap-8 w-full"
        >
            {/* Header */}
            <div className="flex items-center gap-4">
                <Link href="/tools">
                    <Button
                        isIconOnly
                        variant="light"
                        radius="full"
                        className="flex items-center justify-center active:scale-95 transition-all"
                    >
                        <ArrowLeft className="w-5 h-5" />
                    </Button>
                </Link>
                <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-primary rounded-[16px] flex items-center justify-center">
                        <Wrench className="w-6 h-6 text-[#73342b]" />
                    </div>
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight text-foreground">
                            新規ツール作成
                        </h1>
                        <p className="text-foreground/70">
                            ツールを登録してみんなと共有しよう
                        </p>
                    </div>
                </div>
            </div>

            {/* Form */}
            <Card className="bg-content1 rounded-[28px] shadow-none border-none w-full">
                <CardBody className="p-8 flex flex-col gap-8 w-full">
                    {error && (
                        <div className="p-4 rounded-[16px] bg-danger text-[#93000a] shadow-sm border-none">
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
                            inputWrapper: "bg-content2/50 px-4 h-14 focus-within:bg-background border-b-2 border-transparent focus-within:border-primary shadow-inner !opacity-100 rounded-[16px]",
                        }}
                    />

                    <Textarea
                        label="説明"
                        placeholder="ツールの説明を入力..."
                        variant="flat"
                        radius="lg"
                        value={description}
                        onValueChange={setDescription}
                        minRows={4}
                        classNames={{
                            inputWrapper: "bg-content2/50 rounded-[16px] border-1 border-divider/30 focus-within:border-primary shadow-inner !opacity-100 min-h-[140px]",
                            input: "placeholder:text-default-400 py-2 leading-relaxed",
                        }}
                    />

                    <Input
                        label="カテゴリ"
                        placeholder="例: ユーティリティ"
                        variant="flat"
                        radius="lg"
                        value={category}
                        onValueChange={setCategory}
                        classNames={{
                            inputWrapper: "bg-content2/50 px-4 h-14 focus-within:bg-background border-b-2 border-transparent focus-within:border-primary shadow-inner !opacity-100 rounded-[16px]",
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
                            trigger: "bg-content2/50 h-14 rounded-[16px]",
                        }}
                        popoverProps={{ className: "rounded-[20px] shadow-2xl bg-background border-none p-2" }}
                    >
                        {appTypes.map((t) => (
                            <SelectItem key={t.key} textValue={t.label}>
                                <div className="flex items-center gap-3">
                                    <t.icon className="w-4 h-4" />
                                    <div>
                                        <p className="font-medium">{t.label}</p>
                                        <p className="text-xs text-foreground/60">
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
                                inputWrapper: "bg-content2/50 px-4 h-14 focus-within:bg-background border-b-2 border-transparent focus-within:border-primary shadow-inner !opacity-100 rounded-[16px]",
                            }}
                        />
                    )}

                    {(type === "react" || type === "html") && (
                        <div className="p-4 rounded-[16px] bg-warning text-[#564419] shadow-sm border-none">
                            React/HTMLファイルのアップロード機能は今後実装予定です。
                            現在は埋め込みまたはリンクタイプをご利用ください。
                        </div>
                    )}

                    <div className="flex items-center justify-between p-4 rounded-[20px] bg-content2/50">
                        <div>
                            <p className="font-medium text-foreground">
                                公開する
                            </p>
                            <p className="text-sm text-foreground/70">
                                他のユーザーがGalleryで閲覧できます
                            </p>
                        </div>
                        <Switch
                            isSelected={isPublic}
                            onValueChange={setIsPublic}
                            color="primary"
                            classNames={{
                                wrapper: "group-data-[selected=true]:bg-primary shadow-none",
                            }}
                        />
                    </div>

                    <Button
                        color="primary"
                        variant="flat"
                        radius="full"
                        className="w-full h-14 font-bold bg-primary text-[#73342b] flex items-center justify-center gap-2 active:scale-95 transition-all"
                        startContent={<Save className="w-5 h-5" />}
                        isLoading={isSubmitting}
                        onPress={handleSubmit}
                    >
                        作成する
                    </Button>
                </CardBody>
            </Card>
        </motion.div>
    );
}
