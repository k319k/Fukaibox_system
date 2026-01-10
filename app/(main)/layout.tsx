import { Sidebar } from "@/components/layout/sidebar";

export default function MainLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <div className="min-h-screen">
            <Sidebar />
            <main className="ml-64 p-6">
                {children}
            </main>
        </div>
    );
}
