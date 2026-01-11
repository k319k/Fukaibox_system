
import KitchenDetailClient from "@/components/kitchen/kitchen-detail-client";
import { getCookingProject, getCookingSections } from "@/app/actions/kitchen";
import { notFound } from "next/navigation";

export const dynamic = 'force-dynamic';

// Server Component
interface PageProps {
    params: Promise<{ id: string }>;
}

export default async function KitchenDetailPage({ params }: PageProps) {
    const { id } = await params;

    // DBからデータ取得
    const project = await getCookingProject(id);
    const sections = await getCookingSections(id);

    if (!project) {
        return notFound();
    }

    return (
        <KitchenDetailClient
            project={project}
            initialSections={sections}
        />
    );
}
