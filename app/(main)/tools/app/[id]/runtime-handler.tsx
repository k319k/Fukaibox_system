"use client";

import { useToolsMessageHandler } from "@/components/tools/runtime/use-tools-message-handler";

export function ToolsRuntimeHandler({ appId }: { appId: string }) {
    useToolsMessageHandler(appId);
    return null;
}
