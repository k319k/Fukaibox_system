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

    // Access Control handled in Client Component (View Only for Guests in 'cooking' status)
    // Removed strict server-side lock to allow viewing 'cooking' projects.

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
