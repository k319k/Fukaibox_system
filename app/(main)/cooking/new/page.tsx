"use client";

import { Button, Card, CardBody, CardHeader, Input, Textarea } from "@heroui/react";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { createCookingProject } from "@/app/actions/kitchen";

export default function NewKitchenPage() {
    const router = useRouter();
    const [title, setTitle] = useState("");
    const [description, setDescription] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState("");

    const handleCreate = async () => {
        if (!title.trim()) {
            setError("タイトルを入力してください");
            return;
        }

        setIsLoading(true);
        setError("");

        try {
            // Server Actionを使用してプロジェクトを作成
            const project = await createCookingProject(title, description);

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
        <div className="max-w-3xl mx-auto space-y-6">
            <div>
                <h1 className="text-3xl font-bold text-foreground">新しい料理を開始</h1>
                <p className="text-foreground-muted mt-1">ショート動画の制作プロジェクトを作成します</p>
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
                        minRows={3}
                    />

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
                            作成
                        </Button>
                    </div>
                </CardBody>
            </Card>
        </div>
    );
}
