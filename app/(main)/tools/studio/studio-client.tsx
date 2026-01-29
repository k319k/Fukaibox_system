"use client";

import { ChatPanel } from "@/components/tools/studio/chat-panel";
import { MonacoEditorClient } from "@/components/tools/studio/monaco-client";
import { Panel, Group as PanelGroup, Separator as PanelResizeHandle } from "react-resizable-panels";
import { useState, useEffect } from "react";
import { useToolsMessageHandler } from "@/components/tools/runtime/use-tools-message-handler";
import { Button, Modal, Input, message, Tabs, Select, theme } from "antd";
import { SaveOutlined, CodeOutlined, EyeOutlined } from "@ant-design/icons";
import { saveToolsApp } from "@/app/actions/tools-data";
import { SandpackProvider, SandpackPreview, useSandpack } from "@codesandbox/sandpack-react";
import { FUKAI_SDK_SOURCE } from "@/lib/tools/sdk-source";

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
    setLanguage
}: {
    savedAppId: string | null,
    draftId: string,
    appTitle: string,
    setAppTitle: (v: string) => void,
    appDesc: string,
    setAppDesc: (v: string) => void,
    setSavedAppId: (id: string) => void,
    language: string,
    setLanguage: (l: string) => void
}) {
    const { sandpack } = useSandpack();
    const [isSaveModalOpen, setIsSaveModalOpen] = useState(false);
    const [saving, setSaving] = useState(false);
    const { token } = theme.useToken();

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
                files: sandpack.files, // Get current files from Sandpack
                type: language === "python" ? "python" : "react-ts" // Simple mapping for now
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
        <div className="h-14 border-b flex items-center px-4 justify-between"
            style={{
                borderColor: token.colorBorder,
                backgroundColor: token.colorBgContainer
            }}>
            <div className="flex items-center gap-4">
                <Select
                    value={language}
                    onChange={setLanguage}
                    options={[
                        { value: 'react-ts', label: 'React TS' },
                        { value: 'react', label: 'React JS' },
                        { value: 'vanilla-ts', label: 'Vanilla TS' },
                        { value: 'vanilla', label: 'Vanilla JS' },
                        { value: 'python', label: 'Python (Pyodide)' },
                    ]}
                    style={{ width: 150 }}
                />
                <span className="text-xs font-mono" style={{ color: token.colorTextTertiary }}>
                    {savedAppId ? `App ID: ${savedAppId.slice(0, 8)}...` : `Draft ID: ${draftId.slice(0, 8)}...`}
                </span>
            </div>
            <div className="flex gap-2">
                <Button
                    type="primary"
                    icon={<SaveOutlined />}
                    onClick={() => setIsSaveModalOpen(true)}
                    loading={saving}
                >
                    保存
                </Button>
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
                        <label className="block text-sm font-medium mb-1" style={{ color: token.colorText }}>タイトル</label>
                        <Input
                            value={appTitle}
                            onChange={e => setAppTitle(e.target.value)}
                            placeholder="例: すごいToDoアプリ"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium mb-1" style={{ color: token.colorText }}>説明</label>
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

export function ToolsStudioClient() {
    // Initial State
    const [files, setFiles] = useState<Record<string, string>>({});
    const [draftId, setDraftId] = useState("");
    const [language, setLanguage] = useState("react-ts");

    // Metadata State
    const [appTitle, setAppTitle] = useState("");
    const [appDesc, setAppDesc] = useState("");
    const [savedAppId, setSavedAppId] = useState<string | null>(null);

    const { token } = theme.useToken();

    useEffect(() => {
        setDraftId(`draft-${crypto.randomUUID()}`);
    }, []);

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

    // Sandpack Template Mapping
    // Note: Python is not natively supported by Sandpack's standard templates in the same way.
    // We strictly map to valid Sandpack templates or fallback to vanilla for unknown.
    const getSandpackTemplate = (lang: string) => {
        if (lang === 'python') return 'vanilla'; // Placeholder for Python
        return lang as any;
    };

    return (
        <div className="h-[calc(100vh-64px)] w-full overflow-hidden" style={{ backgroundColor: token.colorBgLayout }}>
            <SandpackProvider
                template={getSandpackTemplate(language)}
                files={finalFiles}
                options={{
                    externalResources: ["https://cdn.tailwindcss.com"],
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
                    <Panel defaultSize={30} minSize={20} className="flex flex-col border-r" style={{ borderColor: token.colorBorder }}>
                        <ChatPanel onCodeGenerated={handleCodeGenerated} />
                    </Panel>

                    <PanelResizeHandle className="w-1 transition-colors hover:bg-primary" style={{ backgroundColor: token.colorBorder }} />

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
                                setSavedAppId={setSavedAppId}
                                language={language}
                                setLanguage={setLanguage}
                            />

                            <div className="flex-1 overflow-hidden p-4">
                                <Tabs
                                    defaultActiveKey="preview"
                                    items={[
                                        {
                                            key: 'preview',
                                            label: <span><EyeOutlined /> プレビュー</span>,
                                            children: (
                                                <div className="h-full w-full rounded-2xl overflow-hidden shadow-sm" style={{ height: 'calc(100vh - 180px)' }}>
                                                    <SandpackPreview
                                                        showNavigator={true}
                                                        showRefreshButton={true}
                                                        showOpenInCodeSandbox={false}
                                                        style={{ height: '100%' }}
                                                    />
                                                </div>
                                            )
                                        },
                                        {
                                            key: 'code',
                                            label: <span><CodeOutlined /> コード</span>,
                                            children: (
                                                <div className="h-full w-full" style={{ height: 'calc(100vh - 180px)' }}>
                                                    <MonacoEditorClient />
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
