"use client";

import { Card, Badge } from "antd";
import { PlayCircleOutlined, EyeOutlined } from "@ant-design/icons";
import Link from "next/link";

const { Meta } = Card;

interface AppCardProps {
    app: {
        id: string;
        name: string;
        description: string | null;
        updatedAt: Date;
        viewCount?: number | null;
        createdBy: string;
        isPublic?: boolean | null;
    };
}

export function AppCard({ app }: AppCardProps) {
    return (
        <Link href={`/tools/app/${app.id}`}>
            <Badge.Ribbon text={app.isPublic ? "Public" : "Private"} color={app.isPublic ? "blue" : "purple"}>
                <Card
                    hoverable
                    cover={
                        <div className="h-32 bg-zinc-900 flex items-center justify-center group overflow-hidden relative">
                            {/* Placeholder Cover */}
                            <div className="absolute inset-0 bg-gradient-to-br from-zinc-800 to-zinc-950" />
                            <div className="z-10 text-zinc-500 group-hover:text-blue-400 transition-colors">
                                <PlayCircleOutlined style={{ fontSize: '32px' }} />
                            </div>
                        </div>
                    }
                    className="h-full"
                    actions={[
                        <span key="views" className="text-xs text-zinc-400">
                            <EyeOutlined /> {app.viewCount || 0}
                        </span>,
                        <span key="date" className="text-xs text-zinc-400">
                            {new Intl.DateTimeFormat('ja-JP', { dateStyle: 'medium' }).format(new Date(app.updatedAt))}
                        </span>
                    ]}
                >
                    <Meta
                        title={app.name}
                        description={
                            <div className="h-10 overflow-hidden text-xs text-zinc-500">
                                {app.description || "No description"}
                            </div>
                        }
                    />
                </Card>
            </Badge.Ribbon>
        </Link>
    );
}
