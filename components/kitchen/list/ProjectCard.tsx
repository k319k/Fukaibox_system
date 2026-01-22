"use client";

import { Card, Tag, Button } from "antd";
import { DeleteOutlined } from "@ant-design/icons";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Project } from "@/types/kitchen";

interface ProjectCardProps {
    project: Project;
    isGicho: boolean;
    onDeleteClick: (project: Project) => void;
}

const statusConfig: Record<string, { label: string; className: string }> = {
    cooking: { label: "調理中", className: "bg-[var(--md-sys-color-tertiary-container)] text-[var(--md-sys-color-on-tertiary-container)]" },
    image_upload: { label: "画像UP中", className: "bg-[var(--md-sys-color-primary-container)] text-[var(--md-sys-color-on-primary-container)]" },
    image_selection: { label: "画像採用中", className: "bg-[var(--md-sys-color-primary-container)] text-[var(--md-sys-color-on-primary-container)]" },
    download: { label: "完成", className: "bg-[var(--color-giin-container)] text-[var(--color-giin)]" },
    archived: { label: "アーカイブ", className: "bg-[var(--color-guest-container)] text-[var(--color-guest)]" },
};

export default function ProjectCard({ project, isGicho, onDeleteClick }: ProjectCardProps) {
    const router = useRouter();
    const status = statusConfig[project.status] || statusConfig.archived;

    return (
        <motion.div whileTap={{ scale: 0.95 }}>
            <Card
                hoverable
                onClick={() => router.push(`/cooking/${project.id}`)}
                className="m3-card-filled hover:shadow-md transition-all duration-300"
                styles={{ body: { padding: 0 } }}
            >
                <div className="flex justify-between items-start pb-1 p-6">
                    <div className="flex-1 pr-4">
                        <h3 className="text-title-large text-[var(--md-sys-color-on-surface)] mb-1">{project.title}</h3>
                        {project.description && (
                            <p className="text-body-medium text-[var(--md-sys-color-on-surface-variant)] line-clamp-2">
                                {project.description}
                            </p>
                        )}
                    </div>
                    <Tag
                        className={`rounded-full border-none px-3 py-1 flex items-center justify-center text-label-large ${status.className}`}
                    >
                        {status.label}
                    </Tag>
                </div>
                <div className="pt-0 px-6 pb-6">
                    <div className="flex justify-between items-center">
                        <p className="text-body-small text-[var(--md-sys-color-on-surface-variant)]">
                            作成: {new Date(project.createdAt).toLocaleDateString("ja-JP")}
                        </p>
                        {isGicho && (
                            <motion.div whileTap={{ scale: 0.9 }}>
                                <Button
                                    type="text"
                                    shape="circle"
                                    size="small"
                                    icon={<DeleteOutlined />}
                                    className="bg-[var(--md-sys-color-error-container)] text-[var(--md-sys-color-on-error-container)]"
                                    onClick={(e) => { e.stopPropagation(); onDeleteClick(project); }}
                                />
                            </motion.div>
                        )}
                    </div>
                </div>
            </Card>
        </motion.div>
    );
}
