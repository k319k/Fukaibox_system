"use client";

import { Button, Card, CardBody, CardHeader, Input, Textarea, Chip } from "@heroui/react";
import { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import { createProjectWithScript } from "@/app/actions/kitchen";

export default function NewKitchenPage() {
    const router = useRouter();
    const [title, setTitle] = useState("");
    const [description, setDescription] = useState("");
    const [fullScript, setFullScript] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState("");

    // セクション数のプレビュー
    const sectionCount = useMemo(() => {
        if (!fullScript.trim()) return 0;
        return fullScript
            .split(/\n\n+|\r\n\r\n+/)
            .map(s => s.trim())
            .filter(s => s.length > 0).length;
    }, [fullScript]);

    const handleCreate = async () => {
        if (!title.trim()) {
            setError("タイトルを入力してください");
            return;
        }

        if (!fullScript.trim()) {
            setError("台本全体を入力してください");
            return;
        }

        if (sectionCount === 0) {
            setError("台本が空です。内容を入力してください");
            return;
        }

        setIsLoading(true);
        setError("");

        try {
            const project = await createProjectWithScript(title, description, fullScript);

            if (project) {
                router.push(`/cooking/${project.id}`);
            } else {
                setError("プロジェクトの作成に失敗しました");
            }
        } catch (err) {
            console.error("Failed to create project:", err);
            setError("プロジェクトの作成に失敗しました");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="max-w-4xl mx-auto space-y-6">
            <div>
                <h1 className="text-3xl font-bold text-foreground">新しい料理を開始</h1>
                <p className="text-foreground-muted mt-1">ショート動画の台本を入力してプロジェクトを作成します</p>
            </div>

            <Card className="card-gradient">
                <CardHeader>
                    <h2 className="text-xl font-semibold">プロジェクト情報</h2>
                </CardHeader>
                <CardBody className="space-y-4">
                    {error && (
                        <div className="bg-danger/10 border border-danger/20 rounded-lg p-3 text-danger text-sm">
                            {error}
                        </div>
                    )}

                    <Input
                        label="タイトル"
                        placeholder="例: 封解公儀の新年挨拶"
                        variant="bordered"
                        value={title}
                        onValueChange={setTitle}
                        isDisabled={isLoading}
                        isRequired
                    />

                    <Textarea
                        label="説明（任意）"
                        placeholder="このプロジェクトの内容や目的を記載"
                        variant="bordered"
                        value={description}
                        onValueChange={setDescription}
                        isDisabled={isLoading}
                        minRows={2}
                    />

                    <div className="space-y-2">
                        <Textarea
                            label="台本全体"
                            placeholder={"セクション1の内容\n\nセクション2の内容\n\nセクション3の内容\n\n改行を2回入れるとセクション分けされます"}
                            variant="bordered"
                            value={fullScript}
                            onValueChange={setFullScript}
                            isDisabled={isLoading}
                            minRows={15}
                            description="改行を2回（Enterキーを2回）入れると、そこでセクションが分かれます"
                        />

                        {fullScript.trim() && (
                            <div className="flex items-center gap-2">
                                <Chip color="primary" variant="flat">
                                    プレビュー: {sectionCount} セクション
                                </Chip>
                                <p className="text-sm text-foreground-muted">
                                    自動的に {sectionCount} 個のセクションに分割されます
                                </p>
                            </div>
                        )}
                    </div>

                    <div className="flex gap-3 justify-end">
                        <Button
                            variant="light"
                            onPress={() => router.back()}
                            isDisabled={isLoading}
                        >
                            キャンセル
                        </Button>
                        <Button
                            color="primary"
                            variant="shadow"
                            onPress={handleCreate}
                            isLoading={isLoading}
                        >
                            保存してセクション分割
                        </Button>
                    </div>
                </CardBody>
            </Card>
        </div>
    );
}
