import { getToolsAppById } from "@/app/actions/tools-data";
import { SandpackClient } from "@/components/tools/studio/sandpack-client";
import { RuntimeHeader } from "./header";
import { notFound } from "next/navigation";
import { ToolsRuntimeHandler } from "./runtime-handler";

interface PageProps {
    params: Promise<{ id: string }>;
}

export default async function ToolsAppRuntimePage({ params }: PageProps) {
    const { id } = await params;
    const app = await getToolsAppById(id);

    if (!app) {
        notFound();
    }

    // Convert files for Sandpack
    // DB returns Record<string, string>, Sandpack expects same or SandpackFile which is compatible
    const sandpackFiles = app.files;

    return (
        <div className="h-screen w-full flex flex-col bg-zinc-950 overflow-hidden">
            {/* Header */}
            <RuntimeHeader
                title={app.name}
                author={app.createdBy}
                appId={app.id}
                isPublic={app.isPublic ?? false}
            />

            {/* Client Component to handle messages */}
            <ToolsRuntimeHandler appId={app.id} />

            {/* Main Area: Preview Only (Pseudo-ReadOnly) */}
            {/* We want to show the preview prominent, maybe editor minimal or hidden? */}
            {/* For now, just readOnly editor so users can see code but not edit */}
            <div className="flex-1 overflow-hidden">
                <SandpackClient
                    files={sandpackFiles}
                    template={app.type as any || "react-ts"}
                    readOnly={true}
                />
            </div>
        </div>
    );
}
