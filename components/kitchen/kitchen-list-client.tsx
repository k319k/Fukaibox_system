"use client";

import { useDisclosure, Button } from "@heroui/react";
import { Icon } from "@iconify/react";
import { useState } from "react";
import ProjectList from "./list/ProjectList";
import CreateProjectModal from "./list/CreateProjectModal";
import DeleteProjectModal from "./list/DeleteProjectModal";
import { Project } from "@/types/kitchen";

interface KitchenListClientProps {
    projects: Project[];
    userRole: string;
}

export default function KitchenListClient({ projects: initialProjects, userRole }: KitchenListClientProps) {
    const { isOpen, onOpen, onClose } = useDisclosure();
    const { isOpen: isDeleteOpen, onOpen: onDeleteOpen, onClose: onDeleteClose } = useDisclosure();
    const [projects, setProjects] = useState(initialProjects);
    const [deleteTarget, setDeleteTarget] = useState<Project | null>(null);

    const isGicho = userRole === "gicho";

    const handleDeleteClick = (project: Project) => {
        setDeleteTarget(project);
        onDeleteOpen();
    };

    const handleProjectDeleted = (deletedId: string) => {
        setProjects(projects.filter(p => p.id !== deletedId));
    };

    return (
        <div className="space-y-6">
            {/* ヘッダー */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold" style={{ color: 'var(--md-sys-color-primary)' }}>炊事場</h1>
                    <p className="text-foreground-muted mt-1">ショート動画制作プロジェクトを管理します</p>
                </div>
                {isGicho && (
                    <Button
                        color="primary"
                        radius="full"
                        startContent={<Icon icon="mdi:plus" className="text-xl" />}
                        onPress={onOpen}
                    >
                        新しい料理を作る
                    </Button>
                )}
            </div>

            {/* プロジェクト一覧 */}
            <ProjectList
                projects={projects}
                isGicho={isGicho}
                onDeleteClick={handleDeleteClick}
                onCreateClick={onOpen}
            />

            {/* モーダル */}
            <CreateProjectModal
                isOpen={isOpen}
                onClose={onClose}
            />

            <DeleteProjectModal
                isOpen={isDeleteOpen}
                onClose={onDeleteClose}
                project={deleteTarget}
                onProjectDeleted={handleProjectDeleted}
            />
        </div>
    );
}
