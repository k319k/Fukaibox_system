import { getPublicApps, getCategories } from "@/app/actions/tools";
import { ToolsGalleryClient } from "./tools-gallery-client";

export default async function ToolsPage() {
    const [apps, categories] = await Promise.all([
        getPublicApps(),
        getCategories(),
    ]);

    return <ToolsGalleryClient apps={apps} categories={categories} />;
}
