"use client";

import { Card, CardBody, Button } from "@heroui/react";
import { Icon } from "@iconify/react";
import { Project } from "@/types/kitchen";
import ProjectCard from "./ProjectCard";

interface ProjectListProps {
    projects: Project[];
    isGicho: boolean;
    onDeleteClick: (project: Project) => void;
    onCreateClick: () => void;
}

export default function ProjectList({ projects, isGicho, onDeleteClick, onCreateClick }: ProjectListProps) {
    if (projects.length === 0) {
        return (
            <Card className="card-elevated" radius="lg">
                <CardBody className="text-center py-12">
                    <Icon icon="mdi:pot-steam-outline" className="text-6xl text-foreground-muted mx-auto mb-4" />
                    <p className="text-foreground-muted">まだプロジェクトがありません</p>
                    {isGicho && (
                        <Button
                            color="primary"
                            radius="full"
                            className="mt-4"
                            onPress={onCreateClick}
                        >
                            最初の料理を作る
                        </Button>
                    )}
                </CardBody>
            </Card>
        );
    }

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {projects.map((project) => (
                <ProjectCard
                    key={project.id}
                    project={project}
                    isGicho={isGicho}
                    onDeleteClick={onDeleteClick}
                />
            ))}
        </div>
    );
}
