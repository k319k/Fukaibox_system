import { Sidebar } from "@/components/layout/sidebar";
import { Header } from "@/components/layout/header";
import { getCurrentUserWithRole } from "@/app/actions/auth";

export default async function MainLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const user = await getCurrentUserWithRole();

    return (
        <div className="min-h-screen">
            <Sidebar userRole={user?.role} userName={user?.name} userImage={user?.image} />
            <div className="ml-64 flex flex-col min-h-screen">
                <Header user={user} />
                <main className="flex-1 p-6">
                    {children}
                </main>
            </div>
        </div>
    );
}
