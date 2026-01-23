import { getCurrentUserWithRole } from "@/app/actions/auth";
import { DevStudioClient } from "./dev-studio-client";

export const dynamic = "force-dynamic";

export default async function DevStudioPage() {
    const user = await getCurrentUserWithRole();
    console.log("[DevStudioPage] User:", user ? { id: user.id, name: user.name, role: user.role } : "null");

    // 未ログインまたは儀長以外の場合、デバッグ画面を表示
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
                        <p><strong>Discord ID:</strong> {user?.discordId || "N/A"}</p>
                    </div>
                </div>
                <div className="text-sm text-gray-500">
                    <p>Please take a screenshot of this screen for debugging.</p>
                </div>
            </div>
        );
    }

    return <DevStudioClient user={user} />;
}
