"use client";

import { Card, CardBody, CardHeader, Button, Chip, Spinner } from "@heroui/react";
import Link from "next/link";
import { getCookingProjects } from "@/app/actions/kitchen";
import { useEffect, useState } from "react";

// Client Component
export default function KitchenPage() {
    // Awaited<ReturnType<typeof getCookingProjects>> works, but for simplicity handling manually is robust
    const [projects, setProjects] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchProjects = async () => {
            try {
                const data = await getCookingProjects();
                setProjects(data);
            } catch (error) {
                console.error("Failed to fetch projects", error);
            } finally {
                setLoading(false);
            }
        };
        fetchProjects();
    }, []);

    if (loading) {
        return (
            <div className="flex justify-center items-center h-64">
                <Spinner size="lg" color="primary" />
            </div>
        );
    }

    return (
        <div className="max-w-7xl mx-auto space-y-6">
            {/* ヘッダー */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold">台所（料理システム）</h1>
                    <p className="text-foreground-muted mt-1">ショート動画制作のワークフロー管理</p>
                </div>
                <Link href="/kitchen/new">
                    <Button color="primary" variant="shadow" size="lg">
                        + 新しい料理を開始
                    </Button>
                </Link>
            </div>

            {/* 料理一覧 */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {projects.length === 0 ? (
                    <Card className="col-span-full card-gradient">
                        <CardBody className="text-center py-12">
                            <p className="text-foreground-muted">
                                まだ料理プロジェクトがありません。<br />
                                「新しい料理を開始」から作成してください。
                            </p>
                        </CardBody>
                    </Card>
                ) : (
                    projects.map((project) => (
                        <Link key={project.id} href={`/kitchen/${project.id}`}>
                            <Card className="card-gradient hover-glow transition-all cursor-pointer">
                                <CardHeader className="pb-2">
                                    <div className="flex items-center justify-between w-full">
                                        <h3 className="font-semibold">{project.title}</h3>
                                        {getStatusChip(project.status)}
                                    </div>
                                </CardHeader>
                                <CardBody className="pt-0">
                                    {project.description && (
                                        <p className="text-sm text-foreground-muted line-clamp-2">
                                            {project.description}
                                        </p>
                                    )}
                                    <p className="text-xs text-foreground-muted mt-2">
                                        作成日: {new Date(project.createdAt).toLocaleDateString("ja-JP")}
                                    </p>
                                </CardBody>
                            </Card>
                        </Link>
                    ))
                )}
            </div>
        </div>
    );
}

function getStatusChip(status: string) {
    switch (status) {
        case "cooking":
            return <Chip size="sm" color="warning" variant="flat">調理中</Chip>;
        case "image_upload":
            return <Chip size="sm" color="primary" variant="flat">画像UP</Chip>;
        case "image_selection":
            return <Chip size="sm" color="secondary" variant="flat">画像採用</Chip>;
        case "download":
            return <Chip size="sm" color="success" variant="flat">ダウンロード</Chip>;
        case "archived":
            return <Chip size="sm" variant="flat">アーカイブ</Chip>;
        default:
            return <Chip size="sm" variant="flat">{status}</Chip>;
    }
}
