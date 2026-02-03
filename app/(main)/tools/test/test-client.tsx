"use client";

import { useToolsMessageHandler } from "@/components/tools/runtime/use-tools-message-handler";
import { FUKAI_SDK_SOURCE } from "@/lib/tools/sdk-source";
import { useState, useRef, useEffect } from "react";
import { useSession } from "@/lib/auth-client";

export function ToolsTestClient() {
    const appId = "test-app-001"; // Dummy App ID
    const iframeRef = useRef<HTMLIFrameElement>(null);
    const [logs, setLogs] = useState<string[]>([]);

    // Initialize Message Handler
    useToolsMessageHandler(appId);

    const { data: session } = useSession();

    useEffect(() => {
        const handleLog = (event: MessageEvent) => {
            if (event.data?.type === 'log') {
                setLogs(prev => [...prev, `[Iframe] ${event.data.message}`]);
            }
        };
        window.addEventListener('message', handleLog);
        return () => window.removeEventListener('message', handleLog);
    }, []);

    const runTest = () => {
        if (!iframeRef.current) return;

        const testScript = `
            <script>
                ${FUKAI_SDK_SOURCE}

                // Helper to log to parent
                function log(msg) {
                    window.parent.postMessage({ type: 'log', message: JSON.stringify(msg) }, '*');
                }

                (async () => {
                    try {
                        log("Starting Test...");
                        
                        // 1. Get User
                        log("Testing getUser()...");
                        const user = await window.fukai.getUser();
                        log("User: " + JSON.stringify(user));

                        // 2. DB Set
                        log("Testing db.set()...");
                        await window.fukai.db.set('test_collection', 'timestamp', Date.now());
                        log("Set complete.");

                        // 3. DB Get
                        log("Testing db.get()...");
                        const val = await window.fukai.db.get('test_collection', 'timestamp');
                        log("Get Value: " + val);

                    } catch (e) {
                         log("Error: " + e.message);
                    }
                })();
            </script>
        `;

        iframeRef.current.srcdoc = `
            <html>
                <body>
                    <h1>Test App</h1>
                    ${testScript}
                </body>
            </html>
        `;
    };

    return (
        <div className="p-8">
            <h1 className="text-2xl font-bold mb-4">Tools SDK Verification</h1>

            <div className="mb-4">
                <p>User Status: {session ? "Logged In" : "Logged Out"}</p>
                <button
                    onClick={runTest}
                    className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
                    disabled={!session}
                >
                    Run Verification Test
                </button>
            </div>

            <div className="grid grid-cols-2 gap-4 h-[500px]">
                <div className="border border-gray-300 p-4">
                    <iframe
                        ref={iframeRef}
                        className="w-full h-full border-none"
                        title="Test Iframe"
                    />
                </div>
                <div className="border border-gray-300 p-4 bg-gray-50 overflow-auto font-mono text-sm">
                    <h3 className="font-bold border-b mb-2">Logs</h3>
                    {logs.map((log, i) => (
                        <div key={i}>{log}</div>
                    ))}
                </div>
            </div>
        </div>
    );
}
