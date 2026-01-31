import { getPublicApps, getMyApps } from "@/app/actions/tools-data";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { ToolsGalleryClient } from "./tools-gallery-client";

export const dynamic = "force-dynamic";

export default async function ToolsGalleryPage() {
    const publicApps = await getPublicApps();

    const session = await auth.api.getSession({
        headers: await headers()
    });

    const myApps = session?.user?.id ? await getMyApps() : [];

    return <ToolsGalleryClient publicApps={publicApps} myApps={myApps} isLoggedIn={!!session?.user} />;
}
