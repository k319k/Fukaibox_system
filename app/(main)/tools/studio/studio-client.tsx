"use client";

import { ChatPanel } from "@/components/tools/studio/chat-panel";
import { MonacoEditorClient } from "@/components/tools/studio/monaco-client";
import { Panel, Group as PanelGroup, Separator as PanelResizeHandle } from "react-resizable-panels";
import { useState } from "react";
import { useToolsMessageHandler } from "@/components/tools/runtime/use-tools-message-handler";
import { Tabs } from "antd";
import { CodeOutlined, EyeOutlined } from "@ant-design/icons";
import { SandpackProvider, SandpackPreview } from "@codesandbox/sandpack-react";
import { FUKAI_SDK_SOURCE } from "@/lib/tools/sdk-source";
import { CustomFileExplorer } from "@/components/tools/studio/file-explorer";
import { StudioToolbar } from "./StudioToolbar";

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

export function ToolsStudioClient() {
    const [files, setFiles] = useState<Record<string, string>>({});
    const [draftId] = useState(() => `draft-${crypto.randomUUID()}`);
    const [language, setLanguage] = useState("react-ts");

    const [zoom, setZoom] = useState(1.0);

    const [appTitle, setAppTitle] = useState("");
    const [appDesc, setAppDesc] = useState("");
    const [savedAppId, setSavedAppId] = useState<string | null>(null);
    const [isPublic, setIsPublic] = useState(false);

    useToolsMessageHandler(draftId);

    const handleCodeGenerated = (newFiles: Record<string, string>, description: string) => {
        setFiles(newFiles);
        if (!appTitle) setAppTitle(description.slice(0, 20) + (description.length > 20 ? "..." : ""));
        if (!appDesc) setAppDesc(description);
    };

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
                    <Panel defaultSize={30} minSize={20} className="flex flex-col border-r" style={{ borderColor: 'var(--md-sys-color-outline-variant)' }}>
                        <ChatPanel onCodeGenerated={handleCodeGenerated} />
                    </Panel>

                    <PanelResizeHandle className="w-1 transition-colors hover:bg-[var(--md-sys-color-primary)]" style={{ backgroundColor: 'var(--md-sys-color-outline-variant)' }} />

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
