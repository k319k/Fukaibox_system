"use client";

import { Card, CardBody, CardHeader, Chip, Button } from "@heroui/react";
import { Icon } from "@iconify/react";
import { useRouter } from "next/navigation";
import { Project, UserRole } from "@/types/kitchen";

interface ProjectCardProps {
    project: Project;
    isGicho: boolean;
    onDeleteClick: (project: Project) => void;
}

export default function ProjectCard({ project, isGicho, onDeleteClick }: ProjectCardProps) {
    const router = useRouter();

    const getStatusLabel = (status: string) => {
        switch (status) {
            case "cooking": return "調理中";
            case "image_upload": return "画像UP中";
            case "image_selection": return "画像採用中";
            case "download": return "完成";
            case "archived": return "アーカイブ";
            default: return status;
        }
    };

    type ChipColor = "warning" | "primary" | "secondary" | "success" | "default";
    const getStatusColor = (status: string): ChipColor => {
        switch (status) {
            case "cooking": return "warning";
            case "image_upload": return "primary";
            case "image_selection": return "secondary";
            case "download": return "success";
            case "archived": return "default";
            default: return "default";
        }
    };

    return (
        <Card
            isPressable
            onPress={() => router.push(`/cooking/${project.id}`)}
            className="card-elevated hover:scale-[1.02] transition-transform"
            radius="lg"
        >
            <CardHeader className="flex justify-between items-start pb-1">
                <div className="flex-1">
                    <h3 className="text-lg font-semibold">{project.title}</h3>
                    {project.description && (
                        <p className="text-sm text-foreground-muted line-clamp-2">
                            {project.description}
                        </p>
                    )}
                </div>
                <Chip
                    size="sm"
                    color={getStatusColor(project.status)}
                    variant="solid"
                >
                    {getStatusLabel(project.status)}
                </Chip>
            </CardHeader>
            <CardBody className="pt-0">
                <div className="flex justify-between items-center">
                    <p className="text-xs text-foreground-muted">
                        作成: {new Date(project.createdAt).toLocaleDateString("ja-JP")}
                    </p>
                    {isGicho && (
                        <Button
                            isIconOnly
                            size="sm"
                            variant="flat"
                            radius="full"
                            color="danger"
                            onClick={(e) => {
                                e.stopPropagation();
                                onDeleteClick(project);
                            }}
                        >
                            <Icon icon="mdi:delete" className="text-lg" />
                        </Button>
                    )}
                </div>
            </CardBody>
        </Card>
    );
}
