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
        <div className="max-w-7xl mx-auto space-y-8 p-8">
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-6 border-b border-[var(--md-sys-color-outline-variant)]">
                <div>
                    <h1 className="headline-large text-[var(--md-sys-color-on-background)]">台所</h1>
                    <p className="body-large text-[var(--md-sys-color-on-surface-variant)] mt-2">
                        進行中の調理プロジェクトを管理します
                    </p>
                </div>
                <Link href="/cooking/new">
                    <Button
                        className="bg-[var(--md-sys-color-primary)] text-[var(--md-sys-color-on-primary)] shadow-md px-6 shape-full font-semibold"
                        startContent={<span className="text-xl">+</span>}
                    >
                        新しい料理を作る
                    </Button>
                </Link>
            </div>

            {loading ? (
                <div className="flex justify-center py-20">
                    <Spinner size="lg" color="primary" />
                </div>
            ) : projects.length === 0 ? (
                <div className="text-center py-20 surface-container-high shape-lg border border-dashed border-[var(--md-sys-color-outline-variant)]">
                    <p className="title-medium text-[var(--md-sys-color-on-surface-variant)] mb-4">まだ料理プロジェクトがありません</p>
                    <p className="body-medium text-[var(--md-sys-color-on-surface-variant)] opacity-70">
                        「新しい料理を作る」ボタンから開始しましょう
                    </p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {projects.map((project) => (
                        <Link href={`/cooking/${project.id}`} key={project.id}>
                            <Card className="card-elevated h-full group hover:shadow-[var(--md-sys-elevation-3)] hover:-translate-y-1 transition-all duration-300">
                                <CardHeader className="flex justify-between items-start px-6 pt-6 pb-2">
                                    <div className="flex flex-col gap-1">
                                        <h2 className="headline-small group-hover:text-[var(--md-sys-color-primary)] transition-colors line-clamp-1">
                                            {project.title}
                                        </h2>
                                        <span className="label-small text-[var(--md-sys-color-on-surface-variant)] opacity-70">
                                            ID: {project.id.substring(0, 8)}...
                                        </span>
                                    </div>
                                    {getStatusChip(project.status)}
                                </CardHeader>
                                <CardBody className="px-6 pb-6">
                                    <p className="body-medium text-[var(--md-sys-color-on-surface-variant)] line-clamp-3 mb-4 min-h-[4.5em]">
                                        {project.description || "説明はありません"}
                                    </p>
                                    <div className="flex items-center gap-2 pt-4 border-t border-[var(--md-sys-color-outline-variant)] opacity-70">
                                        <span className="text-sm">📅</span>
                                        <span className="label-medium text-[var(--md-sys-color-on-surface-variant)]">
                                            {new Date(project.createdAt).toLocaleDateString('ja-JP')}
                                        </span>
                                    </div>
                                </CardBody>
                            </Card>
                        </Link>
                    ))}
                </div>
            )}
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

