"use client";

import { Button, Card, CardBody, CardHeader, Input, Textarea, Modal, ModalContent, ModalHeader, ModalBody, ModalFooter, useDisclosure, Chip } from "@heroui/react";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Icon } from "@iconify/react";
import { createCookingProject } from "@/app/actions/kitchen";

// 型定義
interface Project {
    id: string;
    title: string;
    description: string | null;
    status: string;
    createdBy: string;
    createdAt: Date;
}

interface KitchenListClientProps {
    projects: Project[];
    userRole: string;
}

export default function KitchenListClient({ projects, userRole }: KitchenListClientProps) {
    const router = useRouter();
    const { isOpen, onOpen, onClose } = useDisclosure();
    const [title, setTitle] = useState("");
    const [description, setDescription] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState("");

    const isGicho = userRole === "gicho";

    const handleCreate = async () => {
        if (!title.trim()) {
            setError("タイトルを入力してください");
            return;
        }

        setIsLoading(true);
        setError("");

        try {
            // タイトルと説明のみでプロジェクト作成
            const project = await createCookingProject(title, description);
            if (project) {
                onClose();
                resetForm();
                // 調理タブに遷移（ここで台本を入力する）
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

    const resetForm = () => {
        setTitle("");
        setDescription("");
        setError("");
    };

    const handleClose = () => {
        resetForm();
        onClose();
    };

    const getStatusLabel = (status: string) => {
        switch (status) {
            case "cooking": return "調理中";
            case "image_upload": return "画像UP中";
            case "image_selection": return "画像採用中";
            case "download": return "完成";
            case "archived": return "アーカイブ";
            default: return status;
        }
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case "cooking": return "warning";
            case "image_upload": return "primary";
            case "image_selection": return "secondary";
            case "download": return "success";
            case "archived": return "default";
            default: return "default";
        }
    };

    return (
        <div className="space-y-6">
            {/* ヘッダー */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold text-foreground">炊事場</h1>
                    <p className="text-foreground-muted mt-1">ショート動画制作プロジェクトを管理します</p>
                </div>
                {isGicho && (
                    <Button
                        color="primary"
                        variant="shadow"
                        startContent={<Icon icon="mdi:plus" className="text-xl" />}
                        onPress={onOpen}
                    >
                        新しい料理を作る
                    </Button>
                )}
            </div>

            {/* プロジェクト一覧 */}
            {projects.length === 0 ? (
                <Card className="card-gradient">
                    <CardBody className="text-center py-12">
                        <Icon icon="mdi:pot-steam-outline" className="text-6xl text-foreground-muted mx-auto mb-4" />
                        <p className="text-foreground-muted">まだプロジェクトがありません</p>
                        {isGicho && (
                            <Button
                                color="primary"
                                className="mt-4"
                                onPress={onOpen}
                            >
                                最初の料理を作る
                            </Button>
                        )}
                    </CardBody>
                </Card>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {projects.map((project) => (
                        <Card
                            key={project.id}
                            isPressable
                            onPress={() => router.push(`/cooking/${project.id}`)}
                            className="card-gradient hover:scale-[1.02] transition-transform"
                        >
                            <CardHeader className="flex justify-between items-start">
                                <div className="flex-1">
                                    <h3 className="text-lg font-semibold">{project.title}</h3>
                                    {project.description && (
                                        <p className="text-sm text-foreground-muted line-clamp-2">
                                            {project.description}
                                        </p>
                                    )}
                                </div>
                                <Chip
                                    size="sm"
                                    color={getStatusColor(project.status) as any}
                                    variant="flat"
                                >
                                    {getStatusLabel(project.status)}
                                </Chip>
                            </CardHeader>
                            <CardBody className="pt-0">
                                <p className="text-xs text-foreground-muted">
                                    作成: {new Date(project.createdAt).toLocaleDateString('ja-JP')}
                                </p>
                            </CardBody>
                        </Card>
                    ))}
                </div>
            )}

            {/* 新規作成モーダル - タイトルと説明のみ */}
            <Modal
                isOpen={isOpen}
                onClose={handleClose}
                size="lg"
                backdrop="blur"
                classNames={{
                    backdrop: "bg-gradient-to-br from-primary/20 via-background/80 to-secondary/20 backdrop-blur-md",
                    base: "border border-default-200 bg-background/95 shadow-2xl",
                }}
            >
                <ModalContent>
                    <ModalHeader className="flex flex-col gap-1 pb-2">
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-primary/10 rounded-lg">
                                <Icon icon="mdi:pot-steam" className="text-2xl text-primary" />
                            </div>
                            <div>
                                <h2 className="text-xl font-bold">新しい料理を作る</h2>
                                <p className="text-sm text-foreground-muted font-normal">
                                    台本は作成後に調理タブで入力できます
                                </p>
                            </div>
                        </div>
                    </ModalHeader>
                    <ModalBody className="py-4">
                        {error && (
                            <div className="bg-danger/10 border border-danger/20 rounded-lg p-3 text-danger text-sm flex items-center gap-2">
                                <Icon icon="mdi:alert-circle" />
                                {error}
                            </div>
                        )}

                        <div className="space-y-4">
                            <Input
                                label="タイトル"
                                placeholder="例: 封解公儀の新年挨拶"
                                variant="bordered"
                                value={title}
                                onValueChange={setTitle}
                                isDisabled={isLoading}
                                isRequired
                                startContent={<Icon icon="mdi:format-title" className="text-foreground-muted" />}
                                classNames={{
                                    inputWrapper: "bg-default-50",
                                }}
                            />
                            <Textarea
                                label="説明（任意）"
                                placeholder="このプロジェクトの内容や目的を記載"
                                variant="bordered"
                                value={description}
                                onValueChange={setDescription}
                                isDisabled={isLoading}
                                minRows={3}
                                classNames={{
                                    inputWrapper: "bg-default-50",
                                }}
                            />
                        </div>

                        <div className="bg-primary/5 border border-primary/10 rounded-lg p-4 mt-4">
                            <div className="flex items-start gap-3">
                                <Icon icon="mdi:information-outline" className="text-primary text-xl mt-0.5" />
                                <div>
                                    <p className="font-semibold text-sm text-primary">次のステップ</p>
                                    <p className="text-sm text-foreground-muted mt-1">
                                        作成後、調理タブで台本全体を入力してください。
                                        改行を2回入れると、自動でセクションに分割されます。
                                    </p>
                                </div>
                            </div>
                        </div>
                    </ModalBody>
                    <ModalFooter className="pt-2">
                        <Button
                            variant="light"
                            onPress={handleClose}
                            isDisabled={isLoading}
                        >
                            キャンセル
                        </Button>
                        <Button
                            color="primary"
                            onPress={handleCreate}
                            isLoading={isLoading}
                            startContent={!isLoading && <Icon icon="mdi:plus" />}
                        >
                            作成
                        </Button>
                    </ModalFooter>
                </ModalContent>
            </Modal>
        </div>
    );
}
