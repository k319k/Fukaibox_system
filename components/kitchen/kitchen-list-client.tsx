"use client";

import { Button, Card, CardBody, CardHeader, Input, Textarea, Modal, ModalContent, ModalHeader, ModalBody, ModalFooter, useDisclosure, Chip, Spinner } from "@heroui/react";
import { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import { Icon } from "@iconify/react";
import { getCookingProjects, createProjectWithScript } from "@/app/actions/kitchen";

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
    const [fullScript, setFullScript] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState("");
    const [step, setStep] = useState<1 | 2>(1);

    const isGicho = userRole === "gicho";

    // セクション数のプレビュー
    const sectionCount = useMemo(() => {
        if (!fullScript.trim()) return 0;
        return fullScript
            .split(/\n\n+|\r\n\r\n+/)
            .map(s => s.trim())
            .filter(s => s.length > 0).length;
    }, [fullScript]);

    const handleCreate = async () => {
        if (step === 1) {
            if (!title.trim()) {
                setError("タイトルを入力してください");
                return;
            }
            setStep(2);
            setError("");
            return;
        }

        // Step 2: 台本入力して作成
        if (!fullScript.trim()) {
            setError("台本を入力してください");
            return;
        }

        setIsLoading(true);
        setError("");

        try {
            const project = await createProjectWithScript(title, description, fullScript);
            if (project) {
                onClose();
                resetForm();
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
        setFullScript("");
        setStep(1);
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

            {/* 新規作成モーダル */}
            <Modal isOpen={isOpen} onClose={handleClose} size="3xl" scrollBehavior="inside">
                <ModalContent>
                    <ModalHeader className="flex flex-col gap-1">
                        <div className="flex items-center gap-2">
                            <Icon icon="mdi:pot-steam" className="text-2xl text-primary" />
                            <span>新しい料理を作る</span>
                            <Chip size="sm" variant="flat">
                                ステップ {step}/2
                            </Chip>
                        </div>
                        <p className="text-sm text-foreground-muted font-normal">
                            {step === 1
                                ? "プロジェクトの基本情報を入力してください"
                                : "台本を入力してください（改行2回でセクション分割）"
                            }
                        </p>
                    </ModalHeader>
                    <ModalBody>
                        {error && (
                            <div className="bg-danger/10 border border-danger/20 rounded-lg p-3 text-danger text-sm mb-4">
                                {error}
                            </div>
                        )}

                        {step === 1 ? (
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
                            </div>
                        ) : (
                            <div className="space-y-4">
                                <div className="bg-default-100 rounded-lg p-4 mb-4">
                                    <div className="flex items-center gap-2 mb-2">
                                        <Icon icon="mdi:information-outline" className="text-primary text-xl" />
                                        <p className="font-semibold text-sm">台本の入力方法</p>
                                    </div>
                                    <p className="text-sm text-foreground-muted">
                                        改行を2回（Enterキーを2回）入れると、その場所でセクションが分割されます。
                                        各セクションには後から画像指示や参考画像を追加できます。
                                    </p>
                                </div>

                                <Textarea
                                    label="台本全体"
                                    placeholder={"セクション1の内容を入力\n\n（↑改行2回でセクション分割↓）\n\nセクション2の内容を入力\n\n（↑改行2回でセクション分割↓）\n\nセクション3の内容を入力"}
                                    variant="bordered"
                                    value={fullScript}
                                    onValueChange={setFullScript}
                                    isDisabled={isLoading}
                                    minRows={12}
                                    classNames={{
                                        input: "font-mono text-sm"
                                    }}
                                />

                                {fullScript.trim() && (
                                    <div className="flex items-center gap-3 p-3 bg-primary/10 rounded-lg">
                                        <Icon icon="mdi:format-list-numbered" className="text-2xl text-primary" />
                                        <div>
                                            <p className="font-semibold text-primary">
                                                {sectionCount} セクション
                                            </p>
                                            <p className="text-xs text-foreground-muted">
                                                に自動分割されます
                                            </p>
                                        </div>
                                    </div>
                                )}
                            </div>
                        )}
                    </ModalBody>
                    <ModalFooter>
                        {step === 2 && (
                            <Button
                                variant="light"
                                onPress={() => setStep(1)}
                                isDisabled={isLoading}
                            >
                                戻る
                            </Button>
                        )}
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
                            startContent={step === 1
                                ? <Icon icon="mdi:arrow-right" />
                                : <Icon icon="mdi:check" />
                            }
                        >
                            {step === 1 ? "次へ" : "作成"}
                        </Button>
                    </ModalFooter>
                </ModalContent>
            </Modal>
        </div>
    );
}
