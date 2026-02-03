import { getCookingProjects } from "@/app/actions/kitchen";
import { getCurrentUserWithRole } from "@/app/actions/auth";
import KitchenListClient from "@/components/kitchen/kitchen-list-client";

export const dynamic = 'force-dynamic';

export default async function KitchenPage() {
    const [projects, user] = await Promise.all([
        getCookingProjects(),
        getCurrentUserWithRole()
    ]);

    const userRole = user?.role || "anonymous";

    return (
        <div className="max-w-7xl mx-auto p-6">
            <KitchenListClient projects={projects} userRole={userRole} />
        </div>
    );
}
