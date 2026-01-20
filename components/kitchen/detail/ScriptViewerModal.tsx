"use client";

import {
    Modal,
    ModalContent,
    ModalHeader,
    ModalBody,
    ModalFooter,
    Button,
    Divider
} from "@heroui/react";
import { Icon } from "@iconify/react";
import { Section } from "@/types/kitchen";
import CharacterCountDisplay from "./section/CharacterCountDisplay";

interface ScriptViewerModalProps {
    isOpen: boolean;
    onClose: () => void;
    sections: Section[];
    projectTitle: string;
}

/**
 * 本文のみ（画像指示なし）の原稿を表示するモーダル
 */
export default function ScriptViewerModal({
    isOpen,
    onClose,
    sections,
    projectTitle
}: ScriptViewerModalProps) {
    // 全セクションの本文を結合
    const fullScript = sections
        .map((s) => s.content || "")
        .filter((c) => c.trim())
        .join("\n\n");

    const handleCopy = async () => {
        try {
            await navigator.clipboard.writeText(fullScript);
            alert("クリップボードにコピーしました");
        } catch (error) {
            console.error("Copy failed:", error);
            alert("コピーに失敗しました");
        }
    };

    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            size="3xl"
            scrollBehavior="inside"
            classNames={{
                base: "rounded-[28px]",
                header: "border-b border-[var(--md-sys-color-outline-variant)]/30",
                footer: "border-t border-[var(--md-sys-color-outline-variant)]/30"
            }}
        >
            <ModalContent>
                <ModalHeader className="flex flex-col gap-1">
                    <div className="flex items-center gap-2">
                        <Icon icon="mdi:script-text-outline" className="text-xl text-primary" />
                        <span>{projectTitle} - 原稿</span>
                    </div>
                    <p className="text-xs text-foreground-muted font-normal">
                        本文のみ（画像指示・セクション分けなし）
                    </p>
                </ModalHeader>
                <ModalBody className="py-6">
                    <CharacterCountDisplay text={fullScript} />
                    <Divider className="my-4" />
                    <div
                        className="whitespace-pre-wrap text-foreground leading-relaxed bg-default-50 p-4 rounded-lg"
                        style={{ fontSize: "14px" }}
                    >
                        {fullScript || "原稿がありません"}
                    </div>
                </ModalBody>
                <ModalFooter>
                    <Button
                        color="default"
                        variant="flat"
                        onPress={handleCopy}
                        startContent={<Icon icon="mdi:content-copy" />}
                    >
                        コピー
                    </Button>
                    <Button color="primary" onPress={onClose}>
                        閉じる
                    </Button>
                </ModalFooter>
            </ModalContent>
        </Modal>
    );
}
