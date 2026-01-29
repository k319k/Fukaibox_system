"use client";

import { ChatPanel } from "@/components/tools/studio/chat-panel";
import { SandpackClient } from "@/components/tools/studio/sandpack-client";
import { Panel, Group as PanelGroup, Separator as PanelResizeHandle } from "react-resizable-panels";
import { useState } from "react";
import { useToolsMessageHandler } from "@/components/tools/runtime/use-tools-message-handler";
import { Button, Modal, Input, message } from "antd";
import { SaveOutlined } from "@ant-design/icons";
import { saveToolsApp } from "@/app/actions/tools-data";

export default function ToolsStudioPage() {
    const [files, setFiles] = useState<Record<string, string>>({});
    const [draftId] = useState(() => `draft-${crypto.randomUUID()}`);

    // Save State
    const [isSaveModalOpen, setIsSaveModalOpen] = useState(false);
    const [saving, setSaving] = useState(false);
    const [appTitle, setAppTitle] = useState("");
    const [appDesc, setAppDesc] = useState("");
    const [savedAppId, setSavedAppId] = useState<string | null>(null);

    useToolsMessageHandler(draftId);

    const handleCodeGenerated = (newFiles: Record<string, string>, description: string) => {
        setFiles(newFiles);
        // Auto-fill title/desc if empty
        if (!appTitle) setAppTitle(description.slice(0, 20) + (description.length > 20 ? "..." : ""));
        if (!appDesc) setAppDesc(description);
    };

    const handleSave = async () => {
        if (!appTitle.trim()) {
            message.error("タイトルを入力してください");
            return;
        }

        setSaving(true);
        try {
            const result = await saveToolsApp(savedAppId, {
                title: appTitle,
                description: appDesc,
                files: files,
                type: "react-ts"
            });

            if (result.success && result.appId) {
                setSavedAppId(result.appId);
                message.success("保存しました！");
                setIsSaveModalOpen(false);
            } else {
                message.error("保存失敗: " + result.error);
            }
        } catch (e) {
            message.error("保存中にエラーが発生しました");
            console.error(e);
        } finally {
            setSaving(false);
        }
    };

    return (
        <div className="h-[calc(100vh-64px)] w-full bg-zinc-950 overflow-hidden text-zinc-100">
            <PanelGroup direction="horizontal">
                <Panel defaultSize={30} minSize={20}>
                    <ChatPanel onCodeGenerated={handleCodeGenerated} />
                </Panel>

                <PanelResizeHandle className="w-1 bg-zinc-800 hover:bg-blue-500 transition-colors" />

                <Panel defaultSize={70} minSize={30}>
                    <div className="h-full w-full flex flex-col">
                        {/* Toolbar */}
                        <div className="h-12 border-b border-zinc-800 bg-zinc-900 flex items-center px-4 justify-between">
                            <div className="flex items-center gap-2">
                                <span className="text-xs text-zinc-500 font-mono">
                                    {savedAppId ? `App ID: ${savedAppId.slice(0, 8)}...` : `Draft ID: ${draftId.slice(0, 8)}...`}
                                </span>
                            </div>
                            <div className="flex gap-2">
                                <Button
                                    type="primary"
                                    icon={<SaveOutlined />}
                                    onClick={() => setIsSaveModalOpen(true)}
                                    disabled={Object.keys(files).length === 0}
                                    size="small"
                                >
                                    保存
                                </Button>
                            </div>
                        </div>

                        {/* Sandpack */}
                        <div className="flex-1 overflow-hidden">
                            <SandpackClient files={files} />
                        </div>
                    </div>
                </Panel>
            </PanelGroup>

            <Modal
                title="アプリを保存"
                open={isSaveModalOpen}
                onOk={handleSave}
                onCancel={() => setIsSaveModalOpen(false)}
                confirmLoading={saving}
                okText="保存"
                cancelText="キャンセル"
            >
                <div className="flex flex-col gap-4 py-4">
                    <div>
                        <label className="block text-sm font-medium mb-1 text-slate-700">タイトル</label>
                        <Input
                            value={appTitle}
                            onChange={e => setAppTitle(e.target.value)}
                            placeholder="例: すごいToDoアプリ"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium mb-1 text-slate-700">説明</label>
                        <Input.TextArea
                            value={appDesc}
                            onChange={e => setAppDesc(e.target.value)}
                            placeholder="このアプリの説明..."
                            rows={3}
                        />
                    </div>
                </div>
            </Modal>
        </div>
    );
}
