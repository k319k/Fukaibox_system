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

const statusConfig: Record<string, { label: string; bg: string; text: string }> = {
    cooking: { label: "調理中", bg: "#fbe7a6", text: "#564419" },
    image_upload: { label: "画像UP中", bg: "#ffdad5", text: "#73342b" },
    image_selection: { label: "画像採用中", bg: "#ffdad5", text: "#73342b" },
    download: { label: "完成", bg: "#d7f0cb", text: "#10200a" },
    archived: { label: "アーカイブ", bg: "#f3f4f6", text: "#6b7280" },
};

export default function ProjectCard({ project, isGicho, onDeleteClick }: ProjectCardProps) {
    const router = useRouter();
    const status = statusConfig[project.status] || statusConfig.archived;

    return (
        <motion.div whileTap={{ scale: 0.95 }}>
            <Card
                hoverable
                onClick={() => router.push(`/cooking/${project.id}`)}
                className="bg-[var(--md-sys-color-surface-container-lowest)] border-none shadow-none hover:shadow-lg transition-all duration-300 rounded-[28px]"
                styles={{ body: { padding: 0 } }}
            >
                <div className="flex justify-between items-start pb-1 p-6">
                    <div className="flex-1">
                        <h3 className="text-lg font-semibold text-[var(--md-sys-color-on-surface)]">{project.title}</h3>
                        {project.description && (
                            <p className="text-sm text-[var(--md-sys-color-on-surface-variant)] line-clamp-2">
                                {project.description}
                            </p>
                        )}
                    </div>
                    <Tag
                        className="rounded-full border-none"
                        style={{ backgroundColor: status.bg, color: status.text }}
                    >
                        {status.label}
                    </Tag>
                </div>
                <div className="pt-0 px-6 pb-6">
                    <div className="flex justify-between items-center">
                        <p className="text-xs text-[var(--md-sys-color-on-surface-variant)]">
                            作成: {new Date(project.createdAt).toLocaleDateString("ja-JP")}
                        </p>
                        {isGicho && (
                            <motion.div whileTap={{ scale: 0.9 }}>
                                <Button
                                    type="text"
                                    shape="circle"
                                    size="small"
                                    icon={<DeleteOutlined />}
                                    className="bg-[#ffdad6] text-[#93000a]"
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
