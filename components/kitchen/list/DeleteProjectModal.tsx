"use client";

import { Modal, Button } from "antd";
import { DeleteOutlined } from "@ant-design/icons";
import { Icon } from "@iconify/react";
import { useState } from "react";
import { deleteCookingProject } from "@/app/actions/kitchen";
import { Project } from "@/types/kitchen";

interface DeleteProjectModalProps {
    isOpen: boolean;
    onClose: () => void;
    project: Project | null;
    onProjectDeleted: (deletedId: string) => void;
}

export default function DeleteProjectModal({ isOpen, onClose, project, onProjectDeleted }: DeleteProjectModalProps) {
    const [isDeleting, setIsDeleting] = useState(false);

    const handleDeleteConfirm = async () => {
        if (!project) return;

        setIsDeleting(true);
        try {
            await deleteCookingProject(project.id);
            onProjectDeleted(project.id);
            onClose();
        } catch (err) {
            console.error("Failed to delete project:", err);
        } finally {
            setIsDeleting(false);
        }
    };

    return (
        <Modal
            open={isOpen}
            onCancel={onClose}
            title={
                <div className="flex items-center gap-3">
                    <div className="p-2 bg-[var(--color-kitchen-error-bg)] rounded-lg">
                        <Icon icon="mdi:delete-alert" className="text-2xl text-[var(--color-kitchen-error-text)]" />
                    </div>
                    <h2 className="text-xl font-bold">削除の確認</h2>
                </div>
            }
            footer={[
                <Button key="cancel" shape="round" onClick={onClose} disabled={isDeleting}>
                    キャンセル
                </Button>,
                <Button
                    key="delete"
                    danger
                    type="primary"
                    shape="round"
                    onClick={handleDeleteConfirm}
                    loading={isDeleting}
                    icon={!isDeleting && <DeleteOutlined />}
                >
                    削除
                </Button>,
            ]}
            styles={{ mask: { backgroundColor: "rgba(0,0,0,0.6)", backdropFilter: "blur(4px)" } }}
        >
            <p className="text-[var(--md-sys-color-on-surface-variant)]">
                「<span className="font-semibold text-[var(--md-sys-color-on-surface)]">{project?.title}</span>」を削除しますか？
            </p>
            <p className="text-sm text-[var(--color-kitchen-error-text)] mt-2">
                この操作は取り消せません。関連するセクション・画像もすべて削除されます。
            </p>
        </Modal>
    );
}
