import { getCurrentUserWithRole } from "@/app/actions/auth";
import { SettingsClient } from "@/components/settings/settings-client";
import { redirect } from "next/navigation";

export default async function SettingsPage() {
    const user = await getCurrentUserWithRole();

    // 未ログインユーザーはログインページへ
    if (!user) {
        redirect("/login");
    }

    return <SettingsClient user={user} />;
}
