"use client";

import { Modal, Button, Input, Alert } from "antd";
import { PlusOutlined } from "@ant-design/icons";
import { Icon } from "@iconify/react";
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
            open={isOpen}
            onCancel={handleClose}
            title={
                <div className="flex items-center gap-3">
                    <div className="p-2 bg-[var(--color-kitchen-tag-bg)] rounded-lg">
                        <Icon icon="mdi:pot-steam" className="text-2xl text-[var(--color-kitchen-tag-text)]" />
                    </div>
                    <div>
                        <h2 className="text-xl font-bold">新しい料理を作る</h2>
                        <p className="text-sm text-[var(--md-sys-color-on-surface-variant)] font-normal">
                            台本は作成後に調理タブで入力できます
                        </p>
                    </div>
                </div>
            }
            footer={[
                <Button key="cancel" shape="round" onClick={handleClose} disabled={isLoading}>
                    キャンセル
                </Button>,
                <Button
                    key="create"
                    type="primary"
                    shape="round"
                    onClick={handleCreate}
                    loading={isLoading}
                    icon={!isLoading && <PlusOutlined />}
                    className="bg-[var(--color-kitchen-tag-text)]"
                >
                    作成
                </Button>,
            ]}
            className="rounded-[28px]"
            styles={{ mask: { backgroundColor: "rgba(0,0,0,0.6)", backdropFilter: "blur(4px)" } }}
        >
            {error && (
                <Alert
                    message={error}
                    type="error"
                    showIcon
                    className="mb-4"
                />
            )}

            <div className="flex flex-col gap-5">
                <div className="flex flex-col gap-2">
                    <label className="text-sm font-medium text-[var(--md-sys-color-on-surface)]">
                        タイトル <span className="text-red-500">*</span>
                    </label>
                    <Input
                        placeholder="例: 封解公儀の新年挨拶"
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        disabled={isLoading}
                        size="large"
                        className="rounded-xl"
                    />
                </div>
                <div className="flex flex-col gap-2">
                    <label className="text-sm font-medium text-[var(--md-sys-color-on-surface)]">
                        説明（任意）
                    </label>
                    <Input.TextArea
                        placeholder="このプロジェクトの内容や目的"
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        disabled={isLoading}
                        rows={3}
                        className="rounded-xl"
                    />
                </div>
            </div>
        </Modal>
    );
}
