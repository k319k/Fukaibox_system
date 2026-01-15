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
        <div className="max-w-7xl mx-auto space-y-8">
            {/* ヘッダー - M3 Headline */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="headline-large">台所（料理システム）</h1>
                    <p className="body-medium mt-2">ショート動画制作のワークフロー管理</p>
                </div>
                <Link href="/kitchen/new">
                    <Button color="primary" variant="shadow" size="lg" className="shape-full font-semibold">
                        + 新しい料理を開始
                    </Button>
                </Link>
            </div>

            {/* 料理一覧 - M3 Elevated Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {projects.length === 0 ? (
                    <Card className="col-span-full card-outlined">
                        <CardBody className="text-center py-16">
                            <p className="body-large">
                                まだ料理プロジェクトがありません。<br />
                                「新しい料理を開始」から作成してください。
                            </p>
                        </CardBody>
                    </Card>
                ) : (
                    projects.map((project) => (
                        <Link key={project.id} href={`/kitchen/${project.id}`}>
                            <Card className="card-elevated transition-all cursor-pointer h-full">
                                <CardHeader className="pb-2 px-5 pt-5">
                                    <div className="flex items-center justify-between w-full">
                                        <h3 className="title-large">{project.title}</h3>
                                        {getStatusChip(project.status)}
                                    </div>
                                </CardHeader>
                                <CardBody className="pt-0 px-5 pb-5">
                                    {project.description && (
                                        <p className="body-medium line-clamp-2">
                                            {project.description}
                                        </p>
                                    )}
                                    <p className="label-small mt-3">
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
    const statusConfig: Record<string, { color: "warning" | "primary" | "secondary" | "success" | "default", label: string }> = {
        cooking: { color: "warning", label: "調理中" },
        image_upload: { color: "primary", label: "画像UP" },
        image_selection: { color: "secondary", label: "画像採用" },
        download: { color: "success", label: "ダウンロード" },
        archived: { color: "default", label: "アーカイブ" },
    };

    const config = statusConfig[status] || { color: "default" as const, label: status };

    return (
        <Chip
            size="sm"
            color={config.color}
            variant="flat"
            classNames={{
                base: "shape-sm font-medium",
            }}
        >
            {config.label}
        </Chip>
    );
}

