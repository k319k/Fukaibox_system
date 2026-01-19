"use client";

import { Card, CardBody, CardHeader, Chip, Button } from "@heroui/react";
import { Icon } from "@iconify/react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Project } from "@/types/kitchen";

interface ProjectCardProps {
    project: Project;
    isGicho: boolean;
    onDeleteClick: (project: Project) => void;
}

const statusConfig: Record<string, { label: string; bg: string; text: string }> = {
    cooking: { label: "調理中", bg: "bg-[#fbe7a6]", text: "text-[#564419]" },
    image_upload: { label: "画像UP中", bg: "bg-[#ffdad5]", text: "text-[#73342b]" },
    image_selection: { label: "画像採用中", bg: "bg-[#ffdad5]", text: "text-[#73342b]" },
    download: { label: "完成", bg: "bg-[#d7f0cb]", text: "text-[#10200a]" },
    archived: { label: "アーカイブ", bg: "bg-[#f3f4f6]", text: "text-[#6b7280]" },
};

export default function ProjectCard({ project, isGicho, onDeleteClick }: ProjectCardProps) {
    const router = useRouter();
    const status = statusConfig[project.status] || statusConfig.archived;

    return (
        <motion.div whileTap={{ scale: 0.95 }}>
            <Card
                isPressable
                onPress={() => router.push(`/cooking/${project.id}`)}
                className="bg-[var(--md-sys-color-surface-container-lowest)] border-none shadow-none hover:shadow-lg transition-all duration-300 rounded-[28px]"
            >
                <CardHeader className="flex justify-between items-start pb-1 p-6">
                    <div className="flex-1">
                        <h3 className="text-lg font-semibold text-[var(--md-sys-color-on-surface)]">{project.title}</h3>
                        {project.description && (
                            <p className="text-sm text-[var(--md-sys-color-on-surface-variant)] line-clamp-2">
                                {project.description}
                            </p>
                        )}
                    </div>
                    <Chip size="sm" className={`rounded-full ${status.bg} ${status.text}`}>
                        {status.label}
                    </Chip>
                </CardHeader>
                <CardBody className="pt-0 px-6 pb-6">
                    <div className="flex justify-between items-center">
                        <p className="text-xs text-[var(--md-sys-color-on-surface-variant)]">
                            作成: {new Date(project.createdAt).toLocaleDateString("ja-JP")}
                        </p>
                        {isGicho && (
                            <motion.div whileTap={{ scale: 0.9 }}>
                                <Button
                                    isIconOnly
                                    size="sm"
                                    className="rounded-full bg-[#ffdad6] text-[#93000a]"
                                    onClick={(e) => { e.stopPropagation(); onDeleteClick(project); }}
                                >
                                    <Icon icon="mdi:delete" className="text-lg" />
                                </Button>
                            </motion.div>
                        )}
                    </div>
                </CardBody>
            </Card>
        </motion.div>
    );
}
