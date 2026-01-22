"use client";

import { Card, CardBody, CardHeader, Button, Chip, Input, Skeleton } from "@heroui/react";
import { Wrench, Search, Plus, Package, ExternalLink, Code } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
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
    embed: "bg-[#d7f0cb] text-[#10200a]",
    link: "bg-[#fbe7a6] text-[#564419]",
    react: "bg-[#ffdad5] text-[#73342b]",
    html: "bg-[var(--md-sys-color-surface-container-high)] text-[var(--md-sys-color-on-surface-variant)]",
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
                    className="bg-[var(--md-sys-color-surface-container-lowest)] rounded-[28px] border-none shadow-none hover:bg-[var(--md-sys-color-surface-container-low)] transition-all cursor-pointer group"
                    isPressable
                >
                    <CardBody className="p-6 space-y-4">
                        <div className="flex items-start justify-between">
                            <div className="w-12 h-12 bg-[#ffdad5] rounded-[16px] flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform">
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
                            <h3 className="text-lg font-bold text-[var(--md-sys-color-on-surface)] group-hover:text-[#73342b] transition-colors">
                                {app.name}
                            </h3>
                            {app.description && (
                                <p className="text-sm text-[var(--md-sys-color-on-surface-variant)] mt-1 line-clamp-2">
                                    {app.description}
                                </p>
                            )}
                        </div>
                        <div className="flex items-center justify-between pt-2">
                            {app.category && (
                                <Chip
                                    size="sm"
                                    variant="flat"
                                    className="rounded-full px-2 bg-[var(--md-sys-color-surface-container-high)] text-[var(--md-sys-color-on-surface-variant)]"
                                >
                                    {app.category}
                                </Chip>
                            )}
                            <span className="text-xs text-[var(--md-sys-color-on-surface-variant)]">
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
            className="max-w-6xl mx-auto space-y-8"
        >
            {/* Header */}
            <div className="flex items-center justify-between flex-wrap gap-4">
                <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-[#ffdad5] rounded-[16px] flex items-center justify-center">
                        <Wrench className="w-6 h-6 text-[#73342b]" />
                    </div>
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight text-[var(--md-sys-color-on-surface)]">
                            封解Box Tools
                        </h1>
                        <p className="text-[var(--md-sys-color-on-surface-variant)]">
                            便利なツールを見つけて使おう
                        </p>
                    </div>
                </div>
                <Link href="/tools/new">
                    <motion.div whileTap={{ scale: 0.95 }}>
                        <Button
                            color="primary"
                            variant="flat"
                            radius="full"
                            className="h-12 px-6 font-bold bg-[#ffdad5] text-[#73342b] flex items-center justify-center gap-2"
                            startContent={<Plus className="w-4 h-4" />}
                        >
                            新規作成
                        </Button>
                    </motion.div>
                </Link>
            </div>

            {/* Search & Filter */}
            <div className="flex flex-col sm:flex-row gap-4">
                <Input
                    placeholder="ツールを検索..."
                    variant="flat"
                    radius="full"
                    startContent={
                        <Search className="w-4 h-4 text-[var(--md-sys-color-on-surface-variant)]" />
                    }
                    value={searchQuery}
                    onValueChange={setSearchQuery}
                    classNames={{
                        inputWrapper: "bg-[var(--md-sys-color-surface-container-low)] h-12",
                    }}
                    className="flex-1"
                />
                <div className="flex gap-2 flex-wrap">
                    <Chip
                        className={`cursor-pointer rounded-full px-4 transition-all ${selectedCategory === null
                                ? "bg-[#ffdad5] text-[#73342b]"
                                : "bg-[var(--md-sys-color-surface-container-high)] text-[var(--md-sys-color-on-surface-variant)]"
                            }`}
                        onClick={() => setSelectedCategory(null)}
                    >
                        すべて
                    </Chip>
                    {categories.map((category) => (
                        <Chip
                            key={category}
                            className={`cursor-pointer rounded-full px-4 transition-all ${selectedCategory === category
                                    ? "bg-[#ffdad5] text-[#73342b]"
                                    : "bg-[var(--md-sys-color-surface-container-high)] text-[var(--md-sys-color-on-surface-variant)]"
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
                <Card className="bg-[var(--md-sys-color-surface-container-lowest)] rounded-[28px] border-none shadow-none">
                    <CardBody className="py-16 text-center">
                        <div className="w-16 h-16 bg-[var(--md-sys-color-surface-container-high)] rounded-full flex items-center justify-center mx-auto mb-4">
                            <Package className="w-8 h-8 text-[var(--md-sys-color-on-surface-variant)]" />
                        </div>
                        <h3 className="text-xl font-bold text-[var(--md-sys-color-on-surface)] mb-2">
                            ツールが見つかりません
                        </h3>
                        <p className="text-[var(--md-sys-color-on-surface-variant)] mb-6">
                            {searchQuery || selectedCategory
                                ? "検索条件に一致するツールがありません"
                                : "まだツールが登録されていません"}
                        </p>
                        <Link href="/tools/new">
                            <motion.div whileTap={{ scale: 0.95 }} className="inline-block">
                                <Button
                                    color="primary"
                                    variant="flat"
                                    radius="full"
                                    className="h-12 px-6 font-bold bg-[#ffdad5] text-[#73342b] flex items-center justify-center gap-2"
                                    startContent={<Plus className="w-4 h-4" />}
                                >
                                    最初のツールを作成
                                </Button>
                            </motion.div>
                        </Link>
                    </CardBody>
                </Card>
            )}
        </motion.div>
    );
}
