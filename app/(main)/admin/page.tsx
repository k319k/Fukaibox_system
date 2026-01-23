import { getCurrentUserWithRole } from "@/app/actions/auth";
import { AdminPanelClient } from "./admin-panel-client";
import { getPointHistory, getAllUsersWithPoints } from "@/app/actions/admin";

export const dynamic = "force-dynamic";

export default async function AdminPage() {
    const user = await getCurrentUserWithRole();
    console.log("[AdminPage] User:", user ? { id: user.id, name: user.name, role: user.role } : "null");

    // 未ログインまたは儀長以外はアクセス不可
    if (!user || user.role !== "gicho") {
        return (
            <div className="flex flex-col items-center justify-center min-h-screen p-8 space-y-6">
                <div className="p-6 bg-red-50 border border-red-200 rounded-xl max-w-lg w-full">
                    <h1 className="text-2xl font-bold text-red-700 mb-4">Access Denied (Debug Mode)</h1>
                    <p className="text-red-900 mb-4">
                        You do not have permission to view this page.
                    </p>
                    <div className="space-y-2 font-mono text-sm bg-white p-4 rounded border border-red-100">
                        <p><strong>Status:</strong> {user ? "Logged In" : "Not Logged In"}</p>
                        <p><strong>User ID:</strong> {user?.id || "N/A"}</p>
                        <p><strong>Name:</strong> {user?.name || "N/A"}</p>
                        <p><strong>Current Role:</strong> {user?.role || "N/A"}</p>
                        <p><strong>Expected Role:</strong> gicho</p>
                    </div>
                </div>
            </div>
        );
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
