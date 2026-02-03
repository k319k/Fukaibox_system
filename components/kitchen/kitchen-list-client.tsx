"use client";

import { Button } from "antd";
import { PlusOutlined } from "@ant-design/icons";
import { useState } from "react";
import { motion } from "framer-motion";
import ProjectList from "./list/ProjectList";
import CreateProjectModal from "./list/CreateProjectModal";
import DeleteProjectModal from "./list/DeleteProjectModal";
import { Project } from "@/types/kitchen";

interface KitchenListClientProps {
    projects: Project[];
    userRole: string;
}

export default function KitchenListClient({ projects: initialProjects, userRole }: KitchenListClientProps) {
    const [isOpen, setIsOpen] = useState(false);
    const [isDeleteOpen, setIsDeleteOpen] = useState(false);
    const [projects, setProjects] = useState(initialProjects);
    const [deleteTarget, setDeleteTarget] = useState<Project | null>(null);

    const isGicho = userRole === "gicho";

    const handleDeleteClick = (project: Project) => {
        setDeleteTarget(project);
        setIsDeleteOpen(true);
    };

    const handleProjectDeleted = (deletedId: string) => {
        setProjects(projects.filter(p => p.id !== deletedId));
    };

    return (
        <motion.div
            className="space-y-6"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
        >
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold text-[#73342b]">炊事場</h1>
                    <p className="text-[var(--md-sys-color-on-surface-variant)] mt-1">ショート動画制作プロジェクトを管理します</p>
                </div>
                {isGicho && (
                    <motion.div whileTap={{ scale: 0.95 }}>
                        <Button
                            type="primary"
                            shape="round"
                            icon={<PlusOutlined />}
                            onClick={() => setIsOpen(true)}
                            className="bg-[#ffdad5] text-[#73342b] font-semibold border-none hover:bg-[#ffdad5]/80"
                        >
                            新しい料理を作る
                        </Button>
                    </motion.div>
                )}
            </div>

            <ProjectList
                projects={projects}
                isGicho={isGicho}
                onDeleteClick={handleDeleteClick}
                onCreateClick={() => setIsOpen(true)}
            />

            <CreateProjectModal isOpen={isOpen} onClose={() => setIsOpen(false)} />
            <DeleteProjectModal isOpen={isDeleteOpen} onClose={() => setIsDeleteOpen(false)} project={deleteTarget} onProjectDeleted={handleProjectDeleted} />
        </motion.div>
    );
}
