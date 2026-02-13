"use client";

import { Card, Button } from "antd";
import { Icon } from "@iconify/react";
import { motion } from "framer-motion";
import { Project } from "@/types/kitchen";
import ProjectCard from "./ProjectCard";

interface ProjectListProps {
    projects: Project[];
    isGicho: boolean;
    onDeleteClick: (project: Project) => void;
    onCreateClick: () => void;
}

const containerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.05 } }
};

const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 }
};

export default function ProjectList({ projects, isGicho, onDeleteClick, onCreateClick }: ProjectListProps) {
    if (projects.length === 0) {
        return (
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
            >
                <Card className="bg-[var(--md-sys-color-surface-container-lowest)] border-none shadow-none rounded-[28px]">
                    <div className="text-center py-12">
                        <Icon icon="mdi:pot-steam-outline" className="text-6xl text-[var(--color-kitchen-tag-text)] mx-auto mb-4" />
                        <p className="text-[var(--md-sys-color-on-surface-variant)]">まだプロジェクトがありません</p>
                        {isGicho && (
                            <motion.div whileTap={{ scale: 0.95 }} className="mt-4 inline-block">
                                <Button
                                    shape="round"
                                    onClick={onCreateClick}
                                    className="bg-[var(--color-kitchen-tag-bg)] text-[var(--color-kitchen-tag-text)] font-semibold border-none"
                                >
                                    最初の料理を作る
                                </Button>
                            </motion.div>
                        )}
                    </div>
                </Card>
            </motion.div>
        );
    }

    return (
        <motion.div
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
            variants={containerVariants}
            initial="hidden"
            animate="visible"
        >
            {projects.map((project) => (
                <motion.div key={project.id} variants={itemVariants}>
                    <ProjectCard
                        project={project}
                        isGicho={isGicho}
                        onDeleteClick={onDeleteClick}
                    />
                </motion.div>
            ))}
        </motion.div>
    );
}
