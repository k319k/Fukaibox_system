import { getCurrentUserWithRole } from "@/app/actions/auth";
import { redirect } from "next/navigation";
import { DevStudioClient } from "./dev-studio-client";

export default async function DevStudioPage() {
    const user = await getCurrentUserWithRole();

    // 未ログインまたは儀長以外はアクセス不可
    if (!user || user.role !== "gicho") {
        redirect("/");
    }

    return <DevStudioClient user={user} />;
}
