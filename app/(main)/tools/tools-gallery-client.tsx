"use client";

import { Card, CardBody, Button, Chip, Input } from "@heroui/react";
import { Wrench, Search, Plus, Package, Code } from "lucide-react";
import { motion } from "framer-motion";
import { useState, useMemo } from "react";
import Link from "next/link";
import type { ToolApp } from "@/app/actions/tools";

interface ToolsGalleryClientProps {
    apps: ToolApp[];
    categories: string[];
}

const typeLabels: Record<string, string> = {
    embed: "埋め込み",
    link: "リンク",
    react: "React",
    html: "HTML",
};

const typeBadgeClasses: Record<string, string> = {
    embed: "bg-success text-[#10200a]",
    link: "bg-warning text-[#564419]",
    react: "bg-primary text-[#73342b]",
    html: "bg-content2 text-foreground",
};

const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
        opacity: 1,
        transition: { staggerChildren: 0.05, delayChildren: 0.1 },
    },
};

const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 },
};

function ToolCard({ app }: { app: ToolApp }) {
    return (
        <motion.div variants={itemVariants}>
            <Link href={`/tools/${app.id}`}>
                <Card
                    className="bg-content1 rounded-[28px] shadow-none border-none hover:bg-content2/50 transition-all cursor-pointer group w-full"
                    isPressable
                >
                    <CardBody className="p-6 gap-4">
                        <div className="flex items-start justify-between">
                            <div className="w-12 h-12 bg-primary rounded-[16px] flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform">
                                {app.type === "react" || app.type === "html" ? (
                                    <Code className="w-6 h-6 text-[#73342b]" />
                                ) : (
                                    <Package className="w-6 h-6 text-[#73342b]" />
                                )}
                            </div>
                            <Chip
                                size="sm"
                                variant="flat"
                                className={`rounded-full px-3 ${typeBadgeClasses[app.type]}`}
                            >
                                {typeLabels[app.type]}
                            </Chip>
                        </div>
                        <div>
                            <h3 className="text-lg font-bold text-foreground group-hover:text-[#73342b] transition-colors">
                                {app.name}
                            </h3>
                            {app.description && (
                                <p className="text-sm text-foreground/70 mt-1 line-clamp-2">
                                    {app.description}
                                </p>
                            )}
                        </div>
                        <div className="flex items-center justify-between pt-2">
                            {app.category && (
                                <Chip
                                    size="sm"
                                    variant="flat"
                                    className="rounded-full px-2 bg-content2 text-foreground/70"
                                >
                                    {app.category}
                                </Chip>
                            )}
                            <span className="text-xs text-foreground/60">
                                by {app.creatorName || "不明"}
                            </span>
                        </div>
                    </CardBody>
                </Card>
            </Link>
        </motion.div>
    );
}

export function ToolsGalleryClient({ apps, categories }: ToolsGalleryClientProps) {
    const [searchQuery, setSearchQuery] = useState("");
    const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

    const filteredApps = useMemo(() => {
        return apps.filter((app) => {
            const matchesSearch =
                searchQuery === "" ||
                app.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                app.description?.toLowerCase().includes(searchQuery.toLowerCase());

            const matchesCategory =
                selectedCategory === null || app.category === selectedCategory;

            return matchesSearch && matchesCategory;
        });
    }, [apps, searchQuery, selectedCategory]);

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className="max-w-6xl mx-auto gap-8 flex flex-col"
        >
            {/* Header */}
            <div className="flex items-center justify-between flex-wrap gap-4">
                <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-primary rounded-[16px] flex items-center justify-center">
                        <Wrench className="w-6 h-6 text-[#73342b]" />
                    </div>
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight text-foreground">
                            封解Box Tools
                        </h1>
                        <p className="text-foreground/70">
                            便利なツールを見つけて使おう
                        </p>
                    </div>
                </div>
                <Link href="/tools/new">
                    <Button
                        color="primary"
                        variant="flat"
                        radius="full"
                        className="h-12 px-6 font-bold bg-primary text-[#73342b] flex items-center justify-center gap-2 active:scale-95 transition-all"
                        startContent={<Plus className="w-4 h-4" />}
                    >
                        新規作成
                    </Button>
                </Link>
            </div>

            {/* Search & Filter */}
            <div className="flex flex-col sm:flex-row gap-4">
                <Input
                    placeholder="ツールを検索..."
                    variant="flat"
                    radius="lg"
                    startContent={
                        <Search className="w-4 h-4 text-foreground/60" />
                    }
                    value={searchQuery}
                    onValueChange={setSearchQuery}
                    classNames={{
                        inputWrapper: "bg-content2/50 px-4 h-14 focus-within:bg-background border-b-2 border-transparent focus-within:border-primary shadow-inner !opacity-100 rounded-[16px]",
                    }}
                    className="flex-1"
                />
                <div className="flex gap-2 flex-wrap">
                    <Chip
                        className={`cursor-pointer rounded-full px-4 transition-all ${selectedCategory === null
                            ? "bg-primary text-[#73342b]"
                            : "bg-content2 text-foreground/70"
                            }`}
                        onClick={() => setSelectedCategory(null)}
                    >
                        すべて
                    </Chip>
                    {categories.map((category) => (
                        <Chip
                            key={category}
                            className={`cursor-pointer rounded-full px-4 transition-all ${selectedCategory === category
                                ? "bg-primary text-[#73342b]"
                                : "bg-content2 text-foreground/70"
                                }`}
                            onClick={() => setSelectedCategory(category)}
                        >
                            {category}
                        </Chip>
                    ))}
                </div>
            </div>

            {/* Tools Grid */}
            {filteredApps.length > 0 ? (
                <motion.div
                    className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
                    variants={containerVariants}
                    initial="hidden"
                    animate="visible"
                >
                    {filteredApps.map((app) => (
                        <ToolCard key={app.id} app={app} />
                    ))}
                </motion.div>
            ) : (
                <Card className="bg-content1 rounded-[28px] shadow-none border-none w-full">
                    <CardBody className="py-16 text-center">
                        <div className="w-16 h-16 bg-content2 rounded-full flex items-center justify-center mx-auto mb-4">
                            <Package className="w-8 h-8 text-foreground/60" />
                        </div>
                        <h3 className="text-xl font-bold text-foreground mb-2">
                            ツールが見つかりません
                        </h3>
                        <p className="text-foreground/70 mb-6">
                            {searchQuery || selectedCategory
                                ? "検索条件に一致するツールがありません"
                                : "まだツールが登録されていません"}
                        </p>
                        <Link href="/tools/new">
                            <Button
                                color="primary"
                                variant="flat"
                                radius="full"
                                className="h-12 px-6 font-bold bg-primary text-[#73342b] flex items-center justify-center gap-2 active:scale-95 transition-all"
                                startContent={<Plus className="w-4 h-4" />}
                            >
                                最初のツールを作成
                            </Button>
                        </Link>
                    </CardBody>
                </Card>
            )}
        </motion.div>
    );
}
