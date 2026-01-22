import { getCurrentUserWithRole } from "@/app/actions/auth";
import { redirect } from "next/navigation";
import { DevStudioClient } from "./dev-studio-client";

export const dynamic = "force-dynamic";

export default async function DevStudioPage() {
    const user = await getCurrentUserWithRole();
    console.log("[DevStudioPage] User:", user ? { id: user.id, name: user.name, role: user.role } : "null");

    // 未ログインまたは儀長以外はアクセス不可
    if (!user || user.role !== "gicho") {
        console.log("[DevStudioPage] Access denied. Redirecting to /");
        redirect("/");
    }

    return <DevStudioClient user={user} />;
}
