import { getCurrentUserWithRole } from "@/app/actions/auth";
import { redirect } from "next/navigation";
import { AdminPanelClient } from "./admin-panel-client";
import { getPointHistory, getAllUsersWithPoints } from "@/app/actions/admin";

export const dynamic = "force-dynamic";

export default async function AdminPage() {
    const user = await getCurrentUserWithRole();
    console.log("[AdminPage] User:", user ? { id: user.id, name: user.name, role: user.role } : "null");

    // 未ログインまたは儀長以外はアクセス不可
    if (!user || user.role !== "gicho") {
        console.log("[AdminPage] Access denied. Redirecting to /");
        redirect("/");
    }

    // データを取得
    const [pointHistory, usersWithPoints] = await Promise.all([
        getPointHistory(20),
        getAllUsersWithPoints(),
    ]);

    return (
        <AdminPanelClient
            user={user}
            initialPointHistory={pointHistory}
            initialUsersWithPoints={usersWithPoints}
        />
    );
}
