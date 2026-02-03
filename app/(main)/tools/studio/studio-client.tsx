"use client";

import { ChatPanel } from "@/components/tools/studio/chat-panel";
import { MonacoEditorClient } from "@/components/tools/studio/monaco-client";
import { Panel, Group as PanelGroup, Separator as PanelResizeHandle } from "react-resizable-panels";
import { useState } from "react";
import { useToolsMessageHandler } from "@/components/tools/runtime/use-tools-message-handler";
import { Button, Modal, Input, message, Tabs, Select, Tag, Switch, Slider } from "antd";
import { SaveOutlined, CodeOutlined, EyeOutlined, ZoomInOutlined, ZoomOutOutlined } from "@ant-design/icons";
import { saveToolsApp } from "@/app/actions/tools-data";
import { SandpackProvider, SandpackPreview, useSandpack } from "@codesandbox/sandpack-react";
import { FUKAI_SDK_SOURCE } from "@/lib/tools/sdk-source";
import { CustomFileExplorer } from "@/components/tools/studio/file-explorer";
import { M3Button } from "@/components/ui/m3-button";

// --- SDK Injection Logic ---
const SDK_INJECTION_SCRIPT = `
<script>
  window.FUKAI_SDK_Config = {
    // Optional config
  };
  ${FUKAI_SDK_SOURCE}
</script>
`;

const DEFAULT_INDEX_HTML = `<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Fukai App</title>
    <style>
      * { margin: 0; padding: 0; box-sizing: border-box; }
      body { font-family: system-ui, -apple-system, sans-serif; }
    </style>
  </head>
  <body>
    <div id="root"></div>
    ${SDK_INJECTION_SCRIPT}
  </body>
</html>`;

// --- Components ---

function StudioToolbar({
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
}: {
    savedAppId: string | null,
    draftId: string,
    appTitle: string,
    setAppTitle: (v: string) => void,
    appDesc: string,
    setAppDesc: (v: string) => void,
    setSavedAppId: (id: string) => void,
    language: string,
    setLanguage: (l: string) => void,
    zoom: number,
    setZoom: (z: number) => void,
    isPublic: boolean,
    setIsPublic: (v: boolean) => void
}) {
    const { sandpack } = useSandpack();
    const [isSaveModalOpen, setIsSaveModalOpen] = useState(false);
    const [saving, setSaving] = useState(false);

    // Use M3 tokens directly via CSS variables for consistency
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
            // Convert Sandpack files to simple Record<string, string>
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

            {/* Center: Zoom Control (M3) */}
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

export function ToolsStudioClient() {
    // Initial State
    const [files, setFiles] = useState<Record<string, string>>({});
    const [draftId] = useState(() => `draft-${crypto.randomUUID()}`);
    const [language, setLanguage] = useState("react-ts");

    // UI State
    const [zoom, setZoom] = useState(1.0);

    // Metadata State
    const [appTitle, setAppTitle] = useState("");
    const [appDesc, setAppDesc] = useState("");
    const [savedAppId, setSavedAppId] = useState<string | null>(null);
    const [isPublic, setIsPublic] = useState(false);

    useToolsMessageHandler(draftId);

    const handleCodeGenerated = (newFiles: Record<string, string>, description: string) => {
        setFiles(newFiles);
        // Auto-fill title/desc if empty
        if (!appTitle) setAppTitle(description.slice(0, 20) + (description.length > 20 ? "..." : ""));
        if (!appDesc) setAppDesc(description);
    };

    // Prepare files with SDK injection
    const finalFiles = {
        ...files,
        "/public/index.html": {
            code: DEFAULT_INDEX_HTML,
            hidden: true,
        },
    };

    const getSandpackTemplate = (lang: string): "vanilla" | "react" | "react-ts" | "static" => {
        if (lang === 'python') return 'vanilla';
        if (lang === 'html') return 'static';
        return lang as "vanilla" | "react" | "react-ts" | "static";
    };

    return (
        <div className="h-[calc(100vh-64px)] w-full overflow-hidden" style={{ backgroundColor: 'var(--md-sys-color-surface)' }}>
            <SandpackProvider
                template={getSandpackTemplate(language)}
                files={finalFiles}
                options={{
                    classes: {
                        "sp-wrapper": "h-full w-full",
                        "sp-layout": "h-full w-full",
                        "sp-tab-button": "ant-tabs-tab",
                    }
                }}
                customSetup={{
                    dependencies: {
                        "lucide-react": "^0.263.1",
                        "clsx": "^2.0.0",
                        "tailwind-merge": "^1.14.0"
                    }
                }}
                theme="dark"
            >
                <PanelGroup direction="horizontal">
                    {/* Left Panel: Chat */}
                    <Panel defaultSize={30} minSize={20} className="flex flex-col border-r" style={{ borderColor: 'var(--md-sys-color-outline-variant)' }}>
                        <ChatPanel onCodeGenerated={handleCodeGenerated} />
                    </Panel>

                    <PanelResizeHandle className="w-1 transition-colors hover:bg-[var(--md-sys-color-primary)]" style={{ backgroundColor: 'var(--md-sys-color-outline-variant)' }} />

                    {/* Right Panel: Studio (Toolbar + Content) */}
                    <Panel defaultSize={70} minSize={30}>
                        <div className="h-full w-full flex flex-col">
                            <StudioToolbar
                                savedAppId={savedAppId}
                                draftId={draftId}
                                appTitle={appTitle}
                                setAppTitle={setAppTitle}
                                appDesc={appDesc}
                                setAppDesc={setAppDesc}
                                isPublic={isPublic}
                                setIsPublic={setIsPublic}
                                setSavedAppId={setSavedAppId}
                                language={language}
                                setLanguage={setLanguage}
                                zoom={zoom}
                                setZoom={setZoom}
                            />

                            <div className="flex-1 overflow-hidden p-4 bg-[var(--md-sys-color-surface-container-low)]">
                                <Tabs
                                    defaultActiveKey="preview"
                                    items={[
                                        {
                                            key: 'preview',
                                            label: <span><EyeOutlined /> プレビュー</span>,
                                            children: (
                                                <div
                                                    className="h-full w-full rounded-[var(--radius-lg)] overflow-hidden shadow-sm border border-[var(--md-sys-color-outline-variant)] bg-white relative"
                                                    style={{ height: 'calc(100vh - 180px)' }}
                                                >
                                                    <div
                                                        style={{
                                                            width: `${100 / zoom}%`,
                                                            height: `${100 / zoom}%`,
                                                            transform: `scale(${zoom})`,
                                                            transformOrigin: 'top left',
                                                            transition: 'transform 0.2s ease, width 0.2s ease, height 0.2s ease'
                                                        }}
                                                    >
                                                        <SandpackPreview
                                                            showNavigator={true}
                                                            showRefreshButton={true}
                                                            showOpenInCodeSandbox={false}
                                                            style={{ height: '100%' }}
                                                        />
                                                    </div>
                                                </div>
                                            )
                                        },
                                        {
                                            key: 'code',
                                            label: <span><CodeOutlined /> コード</span>,
                                            children: (
                                                <div className="flex h-full w-full rounded-[var(--radius-lg)] overflow-hidden border border-[var(--md-sys-color-outline-variant)]" style={{ height: 'calc(100vh - 180px)' }}>
                                                    <div className="w-[200px] h-full border-r shrink-0 overflow-hidden" style={{ borderColor: 'var(--md-sys-color-outline-variant)' }}>
                                                        <CustomFileExplorer />
                                                    </div>
                                                    <div className="flex-1 h-full min-w-0">
                                                        <MonacoEditorClient />
                                                    </div>
                                                </div>
                                            )
                                        }
                                    ]}
                                    style={{ height: '100%' }}
                                />
                            </div>
                        </div>
                    </Panel>
                </PanelGroup>
            </SandpackProvider>
        </div>
    );
}
