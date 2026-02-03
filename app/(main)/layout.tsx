import { MainLayoutClient } from "@/components/layout/main-layout";
import { getCurrentUserWithRole } from "@/app/actions/auth";

export default async function MainLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const user = await getCurrentUserWithRole();

    return (
        <MainLayoutClient
            userRole={user?.role}
            userName={user?.name}
            userImage={user?.image}
        >
            {children}
        </MainLayoutClient>
    );
}
