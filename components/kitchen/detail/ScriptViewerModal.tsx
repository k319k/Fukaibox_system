"use client";

import { Modal, Button, Divider } from "antd";
import { CopyOutlined } from "@ant-design/icons";
import { Icon } from "@iconify/react";
import { Section } from "@/types/kitchen";
import CharacterCountDisplay from "./section/CharacterCountDisplay";

interface ScriptViewerModalProps {
    isOpen: boolean;
    onClose: () => void;
    sections: Section[];
    projectTitle: string;
}

export default function ScriptViewerModal({
    isOpen, onClose, sections, projectTitle
}: ScriptViewerModalProps) {
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
            open={isOpen}
            onCancel={onClose}
            title={
                <div className="flex flex-col gap-1">
                    <div className="flex items-center gap-2">
                        <Icon icon="mdi:script-text-outline" className="text-xl text-[#73342b]" />
                        <span>{projectTitle} - 原稿</span>
                    </div>
                    <p className="text-xs text-[var(--md-sys-color-on-surface-variant)] font-normal">
                        本文のみ（画像指示・セクション分けなし）
                    </p>
                </div>
            }
            footer={[
                <Button key="copy" icon={<CopyOutlined />} onClick={handleCopy}>
                    コピー
                </Button>,
                <Button key="close" type="primary" onClick={onClose} className="bg-[#73342b]">
                    閉じる
                </Button>,
            ]}
            width={800}
            className="rounded-[28px]"
        >
            <div className="py-6">
                <CharacterCountDisplay text={fullScript} />
                <Divider className="my-4" />
                <div
                    className="whitespace-pre-wrap text-[var(--md-sys-color-on-surface)] leading-relaxed bg-[var(--md-sys-color-surface-container)] p-4 rounded-lg overflow-y-auto"
                    style={{ fontSize: "14px", maxHeight: "60vh" }}
                >
                    {fullScript || "原稿がありません"}
                </div>
            </div>
        </Modal>
    );
}
