import { getToolsApps } from "@/app/actions/tools-data";
import { ToolsGalleryClient } from "./tools-gallery-client";

export const dynamic = "force-dynamic";

export default async function ToolsGalleryPage() {
    // Ideally we fetch both public and "my" apps
    const apps = await getToolsApps('public');

    return <ToolsGalleryClient apps={apps} />;
}
