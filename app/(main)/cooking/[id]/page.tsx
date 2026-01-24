import KitchenDetailClient from "@/components/kitchen/kitchen-detail-client";
import { getCookingProject, getCookingSections } from "@/app/actions/kitchen";
import { getCurrentUserWithRole } from "@/app/actions/auth";
import { notFound } from "next/navigation";
import type { RoleType } from "@/lib/db/schema";

export const dynamic = 'force-dynamic';

// Server Component
interface PageProps {
    params: Promise<{ id: string }>;
}

export default async function KitchenDetailPage({ params }: PageProps) {
    const { id } = await params;

    // DBからデータ取得
    const [project, sections, user] = await Promise.all([
        getCookingProject(id),
        getCookingSections(id),
        getCurrentUserWithRole()
    ]);

    if (!project) {
        return notFound();
    }

    const userRole = (user?.role || "anonymous") as RoleType;

    // アクセス制御: 画像UP段階(image_collection等)に進むまでは、儀長以外アクセス不可
    // statusが "cooking" または "draft" の場合
    const restrictedStatuses = ["cooking", "draft"];
    if (restrictedStatuses.includes(project.status) && userRole !== "gicho") {
        return (
            <div className="flex flex-col items-center justify-center min-h-[60vh] text-center space-y-4">
                <div className="text-6xl">🔒</div>
                <h1 className="text-2xl font-bold text-[var(--md-sys-color-on-surface)]">
                    準備中
                </h1>
                <p className="text-[var(--md-sys-color-on-surface-variant)]">
                    このプロジェクトは現在、儀長による調理（執筆）中です。<br />
                    画像募集が開始されるまでお待ちください。
                </p>
            </div>
        );
    }

    return (
        <KitchenDetailClient
            project={project}
            initialSections={sections}
            userRole={userRole}
            currentUser={user ? {
                id: user.id,
                name: user.name,
                image: user.image
            } : null}
        />
    );
}
