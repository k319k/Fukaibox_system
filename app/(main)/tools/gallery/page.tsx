import { getToolsApps } from "@/app/actions/tools-data";
import { AppCard } from "./app-card";
import { Typography, Empty } from "antd";

const { Title } = Typography;

export default async function ToolsGalleryPage() {
    // Ideally we fetch both public and "my" apps
    const apps = await getToolsApps('public');

    return (
        <div className="p-8 max-w-7xl mx-auto">
            <div className="mb-8 border-b border-zinc-200 pb-4">
                <Title level={2} style={{ margin: 0 }}>Tools Gallery</Title>
                <p className="text-zinc-500 mt-2">AIが生み出したアプリケーションの実験場</p>
            </div>

            {apps.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-20 bg-zinc-50 rounded-lg">
                    <Empty description="まだアプリケーションがありません" />
                </div>
            ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                    {apps.map(app => (
                        <AppCard key={app.id} app={app} />
                    ))}
                </div>
            )}
        </div>
    );
}
