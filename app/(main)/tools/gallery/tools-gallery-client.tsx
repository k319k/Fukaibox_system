"use client";

import { Drawer } from "antd";
import { ToolApp, getToolsAppById } from "@/app/actions/tools-data";
import { useState, useEffect } from "react";
import { SandpackProvider, SandpackPreview } from "@codesandbox/sandpack-react";
import { FUKAI_SDK_SOURCE } from "@/lib/tools/sdk-source";
import { useToolsMessageHandler } from "@/components/tools/runtime/use-tools-message-handler";
import { GalleryTabs } from "@/components/tools/gallery/gallery-tabs";

const DEFAULT_INDEX_HTML = `<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Fukai App</title>
    <script src="https://cdn.tailwindcss.com"></script>
  </head>
  <body>
    <div id="root"></div>
    <script>
      window.FUKAI_SDK_Config = {};
      ${FUKAI_SDK_SOURCE}
    </script>
  </body>
</html>`;

function AppRunner({ appId }: { appId: string }) {
    const [app, setApp] = useState<ToolApp | null>(null);
    const [loading, setLoading] = useState(false);

    useToolsMessageHandler(appId);

    useEffect(() => {
        if (!appId) return;
        setLoading(true);
        getToolsAppById(appId).then(setApp).finally(() => setLoading(false));
    }, [appId]);

    if (loading || !app) return <div className="h-full flex items-center justify-center">Loading...</div>;

    const finalFiles = app.files ? {
        ...app.files,
        "/public/index.html": {
            code: DEFAULT_INDEX_HTML,
            hidden: true,
        },
    } : {};

    const getTemplate = (t: string) => {
        if (t === 'python') return 'vanilla';
        if (t === 'html') return 'static';
        return 'react-ts';
    };

    return (
        <SandpackProvider
            template={getTemplate(app.type) as any}
            files={finalFiles}
            options={{
                classes: {
                    "sp-wrapper": "h-full w-full",
                    "sp-layout": "h-full w-full",
                }
            }}
            theme="dark"
        >
            <SandpackPreview
                showNavigator={false}
                showRefreshButton={true}
                showOpenInCodeSandbox={false}
                style={{ height: '100%' }}
            />
        </SandpackProvider>
    );
}

interface ToolsGalleryClientProps {
    publicApps: ToolApp[];
    myApps: ToolApp[];
    isLoggedIn: boolean;
}

export function ToolsGalleryClient({ publicApps, myApps, isLoggedIn }: ToolsGalleryClientProps) {
    const [runningAppId, setRunningAppId] = useState<string | null>(null);

    return (
        <div className="min-h-screen bg-[var(--md-sys-color-surface)]">
            <div className="p-8 max-w-7xl mx-auto">
                <GalleryTabs
                    publicApps={publicApps}
                    myApps={myApps}
                    isLoggedIn={isLoggedIn}
                    onRun={setRunningAppId}
                />
            </div>

            <Drawer
                title={null}
                placement="right"
                width={500}
                onClose={() => setRunningAppId(null)}
                open={!!runningAppId}
                styles={{
                    body: { padding: 0, backgroundColor: '#000' },
                    header: { display: 'none' }
                }}
                destroyOnClose
            >
                {runningAppId && <AppRunner appId={runningAppId} />}
            </Drawer>
        </div>
    );
}
