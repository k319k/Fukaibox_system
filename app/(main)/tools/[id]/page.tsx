import { getAppById } from "@/app/actions/tools";
import { getAppRatings } from "@/app/actions/tools-ratings";
import { getCurrentUserWithRole } from "@/app/actions/auth";
import { notFound } from "next/navigation";
import { ToolDetailClient } from "./tool-detail-client";

interface ToolDetailPageProps {
    params: Promise<{ id: string }>;
}

export default async function ToolDetailPage({ params }: ToolDetailPageProps) {
    const { id } = await params;
    const [app, user, ratings] = await Promise.all([
        getAppById(id),
        getCurrentUserWithRole(),
        getAppRatings(id),
    ]);

    if (!app) {
        notFound();
    }

    // 非公開の場合は作成者のみ閲覧可能
    if (!app.isPublic && app.createdBy !== user?.id) {
        notFound();
    }

    return (
        <ToolDetailClient
            app={app}
            ratings={ratings}
            currentUserId={user?.id}
            currentUserRole={user?.role}
        />
    );
}
