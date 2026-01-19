"use client";

import { Icon } from "@iconify/react";
import { Button, Modal, ModalContent, ModalHeader, ModalBody, ModalFooter } from "@heroui/react";
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
            // エラー表示は親コンポーネントで行うほうが良いかもしれませんが、
            // ここではシンプルにコンソール出力のみとしています
        } finally {
            setIsDeleting(false);
        }
    };

    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            size="sm"
            placement="center"
            backdrop="opaque"
            radius="lg"
            classNames={{
                backdrop: "bg-black/60 backdrop-blur-sm",
                base: "bg-background",
            }}
        >
            <ModalContent>
                <ModalHeader className="flex flex-col gap-1">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-danger/10 rounded-lg">
                            <Icon icon="mdi:delete-alert" className="text-2xl text-danger" />
                        </div>
                        <h2 className="text-xl font-bold">削除の確認</h2>
                    </div>
                </ModalHeader>
                <ModalBody>
                    <p className="text-foreground-muted">
                        「<span className="font-semibold text-foreground">{project?.title}</span>」を削除しますか？
                    </p>
                    <p className="text-sm text-danger mt-2">
                        この操作は取り消せません。関連するセクション・画像もすべて削除されます。
                    </p>
                </ModalBody>
                <ModalFooter>
                    <Button
                        variant="light"
                        radius="full"
                        onPress={onClose}
                        isDisabled={isDeleting}
                    >
                        キャンセル
                    </Button>
                    <Button
                        color="danger"
                        radius="full"
                        onPress={handleDeleteConfirm}
                        isLoading={isDeleting}
                        startContent={!isDeleting && <Icon icon="mdi:delete" />}
                    >
                        削除
                    </Button>
                </ModalFooter>
            </ModalContent>
        </Modal>
    );
}
