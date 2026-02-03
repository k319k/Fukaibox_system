"use client";

import { useState } from "react";
import { Button, Modal, Input, message, Select, Tag, Switch, Slider } from "antd";
import { SaveOutlined, ZoomInOutlined, ZoomOutOutlined } from "@ant-design/icons";
import { useSandpack } from "@codesandbox/sandpack-react";
import { saveToolsApp } from "@/app/actions/tools-core";
import { M3Button } from "@/components/ui/m3-button";

interface StudioToolbarProps {
    savedAppId: string | null;
    draftId: string;
    appTitle: string;
    setAppTitle: (v: string) => void;
    appDesc: string;
    setAppDesc: (v: string) => void;
    setSavedAppId: (id: string) => void;
    language: string;
    setLanguage: (l: string) => void;
    zoom: number;
    setZoom: (z: number) => void;
    isPublic: boolean;
    setIsPublic: (v: boolean) => void;
}

export function StudioToolbar({
    savedAppId,
    draftId,
    appTitle,
    setAppTitle,
    appDesc,
    setAppDesc,
    setSavedAppId,
    language,
    setLanguage,
    zoom,
    setZoom,
    isPublic,
    setIsPublic
}: StudioToolbarProps) {
    const { sandpack } = useSandpack();
    const [isSaveModalOpen, setIsSaveModalOpen] = useState(false);
    const [saving, setSaving] = useState(false);

    const containerStyle = {
        borderColor: 'var(--md-sys-color-outline-variant)',
        backgroundColor: 'var(--md-sys-color-surface-container)'
    };

    const handleSave = async () => {
        if (!appTitle.trim()) {
            message.error("タイトルを入力してください");
            return;
        }

        setSaving(true);
        try {
            const simpleFiles: Record<string, string> = {};
            Object.entries(sandpack.files).forEach(([path, file]) => {
                simpleFiles[path] = typeof file === 'string' ? file : file.code;
            });

            const result = await saveToolsApp(savedAppId, {
                title: appTitle,
                description: appDesc,
                files: simpleFiles,
                type: language === "python" ? "python" : (language.includes("html") ? "html" : "react-ts"),
                isPublic: isPublic
            });

            if (result.success && result.appId) {
                setSavedAppId(result.appId);
                message.success(isPublic ? "公開しました！" : "保存しました！");
                setIsSaveModalOpen(false);
            } else {
                message.error(result.error || "保存に失敗しました");
            }
        } catch (e: any) {
            message.error("保存エラー: " + e.message);
        } finally {
            setSaving(false);
        }
    };

    return (
        <div className="h-16 border-b flex items-center px-4 justify-between" style={containerStyle}>
            {/* Left: Branding & Language */}
            <div className="flex items-center gap-4">
                <div className="flex flex-col">
                    <span className="font-bold text-lg leading-none" style={{ color: 'var(--md-sys-color-on-surface)' }}>Tools工房</span>
                    <span className="text-[10px] font-mono opacity-60" style={{ color: 'var(--md-sys-color-on-surface-variant)' }}>
                        {savedAppId ? `App ID: ${savedAppId.slice(0, 8)}...` : `Draft ID: ${draftId.slice(0, 8)}...`}
                    </span>
                </div>

                <div className="h-8 w-px bg-[var(--md-sys-color-outline-variant)] mx-2" />

                <Select
                    value={language}
                    onChange={setLanguage}
                    options={[
                        { value: 'react-ts', label: 'React TS' },
                        { value: 'react', label: 'React JS' },
                        { value: 'html', label: 'HTML/CSS/JS' },
                        { value: 'python', label: 'Python (Pyodide)' },
                    ]}
                    style={{ width: 140 }}
                    variant="borderless"
                    className="bg-[var(--md-sys-color-surface-container-high)] rounded-full"
                />
                {isPublic && (
                    <Tag color="success" style={{ margin: 0 }}>公開中</Tag>
                )}
            </div>

            {/* Center: Zoom Control */}
            <div className="hidden md:flex items-center gap-2 bg-[var(--md-sys-color-surface-container-high)] px-4 py-1 rounded-full">
                <ZoomOutOutlined
                    className="text-[var(--md-sys-color-on-surface-variant)] cursor-pointer hover:text-[var(--md-sys-color-primary)]"
                    onClick={() => setZoom(Math.max(0.5, zoom - 0.1))}
                />
                <Slider
                    min={0.5}
                    max={1.5}
                    step={0.1}
                    value={zoom}
                    onChange={setZoom}
                    style={{ width: 100, margin: '0 8px' }}
                    tooltip={{ formatter: (v?: number) => `${Math.round((v || 1) * 100)}%` }}
                />
                <ZoomInOutlined
                    className="text-[var(--md-sys-color-on-surface-variant)] cursor-pointer hover:text-[var(--md-sys-color-primary)]"
                    onClick={() => setZoom(Math.min(1.5, zoom + 0.1))}
                />
            </div>

            {/* Right: Actions */}
            <div className="flex gap-2">
                <M3Button
                    variant="filled"
                    icon={<SaveOutlined />}
                    onClick={() => setIsSaveModalOpen(true)}
                    disabled={saving}
                >
                    保存
                </M3Button>
            </div>

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
                        <label className="block text-sm font-medium mb-1">タイトル</label>
                        <Input
                            value={appTitle}
                            onChange={e => setAppTitle(e.target.value)}
                            placeholder="例: すごいToDoアプリ"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium mb-1">説明</label>
                        <Input.TextArea
                            value={appDesc}
                            onChange={e => setAppDesc(e.target.value)}
                            placeholder="このアプリの説明..."
                            rows={3}
                        />
                    </div>
                    <div className="flex items-center justify-between pt-2 border-t border-[var(--md-sys-color-outline-variant)]">
                        <div>
                            <label className="block text-sm font-medium mb-1">公開設定</label>
                            <p className="text-xs text-[var(--md-sys-color-on-surface-variant)]">
                                公開するとギャラリーに表示されます
                            </p>
                        </div>
                        <Switch
                            checked={isPublic}
                            onChange={setIsPublic}
                            checkedChildren="公開"
                            unCheckedChildren="非公開"
                        />
                    </div>
                </div>
            </Modal>
        </div>
    );
}
