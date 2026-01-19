"use client";

import { Icon } from "@iconify/react";
import { Button, Modal, ModalContent, ModalHeader, ModalBody, ModalFooter } from "@heroui/react";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { createCookingProject } from "@/app/actions/kitchen";

interface CreateProjectModalProps {
    isOpen: boolean;
    onClose: () => void;
}

export default function CreateProjectModal({ isOpen, onClose }: CreateProjectModalProps) {
    const router = useRouter();
    const [title, setTitle] = useState("");
    const [description, setDescription] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState("");

    const resetForm = () => {
        setTitle("");
        setDescription("");
        setError("");
    };

    const handleClose = () => {
        resetForm();
        onClose();
    };

    const handleCreate = async () => {
        if (!title.trim()) {
            setError("タイトルを入力してください");
            return;
        }

        setIsLoading(true);
        setError("");

        try {
            const project = await createCookingProject(title, description);
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

    return (
        <Modal
            isOpen={isOpen}
            onClose={handleClose}
            size="md"
            placement="center"
            backdrop="opaque"
            radius="lg"
            classNames={{
                backdrop: "bg-black/60 backdrop-blur-sm",
                base: "bg-background",
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

                    <div className="flex flex-col gap-5">
                        <div className="flex flex-col gap-2">
                            <label className="text-sm font-medium text-foreground">
                                タイトル <span className="text-danger">*</span>
                            </label>
                            <input
                                type="text"
                                placeholder="例: 封解公儀の新年挨拶"
                                value={title}
                                onChange={(e) => setTitle(e.target.value)}
                                disabled={isLoading}
                                className="w-full px-4 py-3 border-2 border-default-200 rounded-xl bg-background focus:border-primary focus:outline-none transition-colors disabled:opacity-50"
                            />
                        </div>
                        <div className="flex flex-col gap-2">
                            <label className="text-sm font-medium text-foreground">
                                説明（任意）
                            </label>
                            <textarea
                                placeholder="このプロジェクトの内容や目的"
                                value={description}
                                onChange={(e) => setDescription(e.target.value)}
                                disabled={isLoading}
                                rows={3}
                                className="w-full px-4 py-3 border-2 border-default-200 rounded-xl bg-background focus:border-primary focus:outline-none transition-colors resize-none disabled:opacity-50"
                            />
                        </div>
                    </div>
                </ModalBody>
                <ModalFooter className="pt-2">
                    <Button
                        variant="light"
                        radius="full"
                        onPress={handleClose}
                        isDisabled={isLoading}
                    >
                        キャンセル
                    </Button>
                    <Button
                        color="primary"
                        radius="full"
                        onPress={handleCreate}
                        isLoading={isLoading}
                        startContent={!isLoading && <Icon icon="mdi:plus" />}
                    >
                        作成
                    </Button>
                </ModalFooter>
            </ModalContent>
        </Modal>
    );
}
