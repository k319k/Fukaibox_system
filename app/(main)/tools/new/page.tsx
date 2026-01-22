import { getCurrentUserWithRole } from "@/app/actions/auth";
import { redirect } from "next/navigation";
import { ToolsCreateClient } from "./tools-create-client";

export default async function ToolsNewPage() {
    const user = await getCurrentUserWithRole();

    // 未ログインまたはゲスト以下はアクセス不可
    if (!user || user.role === "guest" || user.role === "anonymous") {
        redirect("/login");
    }

    return <ToolsCreateClient user={user} />;
}
