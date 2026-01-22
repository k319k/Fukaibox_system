"use client";

import { Card, Button, Tag, Input } from "antd";
import { Icon } from "@iconify/react";
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

const typeBadgeClasses: Record<string, { bg: string; text: string }> = {
    embed: { bg: "#d7f0cb", text: "#10200a" },
    link: { bg: "#fbe7a6", text: "#564419" },
    react: { bg: "#ffdad5", text: "#73342b" },
    html: { bg: "var(--md-sys-color-surface-container-high)", text: "var(--md-sys-color-on-surface)" },
};

const containerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.05, delayChildren: 0.1 } },
};

const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 },
};

function ToolCard({ app }: { app: ToolApp }) {
    const style = typeBadgeClasses[app.type];
    return (
        <motion.div variants={itemVariants}>
            <Link href={`/tools/${app.id}`}>
                <Card
                    hoverable
                    className="bg-[var(--md-sys-color-surface-container-lowest)] rounded-[28px] shadow-none border-none hover:bg-[var(--md-sys-color-surface-container-high)]/50 transition-all cursor-pointer group w-full"
                >
                    <div className="gap-4 flex flex-col">
                        <div className="flex items-start justify-between">
                            <div className="w-12 h-12 bg-[#ffdad5] rounded-[16px] flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform">
                                {app.type === "react" || app.type === "html" ? (
                                    <Icon icon="material-symbols:code" className="w-6 h-6 text-[#73342b]" />
                                ) : (
                                    <Icon icon="material-symbols:package-2-outline" className="w-6 h-6 text-[#73342b]" />
                                )}
                            </div>
                            <Tag className="rounded-full px-3 border-none" style={{ backgroundColor: style.bg, color: style.text }}>
                                {typeLabels[app.type]}
                            </Tag>
                        </div>
                        <div>
                            <h3 className="text-lg font-bold text-[var(--md-sys-color-on-surface)] group-hover:text-[#73342b] transition-colors">{app.name}</h3>
                            {app.description && (<p className="text-sm text-[var(--md-sys-color-on-surface-variant)] mt-1 line-clamp-2">{app.description}</p>)}
                        </div>
                        <div className="flex items-center justify-between pt-2">
                            {app.category && (<Tag className="rounded-full px-2 bg-[var(--md-sys-color-surface-container-high)] border-none">{app.category}</Tag>)}
                            <span className="text-xs text-[var(--md-sys-color-on-surface-variant)]">by {app.creatorName || "不明"}</span>
                        </div>
                    </div>
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
            const matchesSearch = searchQuery === "" || app.name.toLowerCase().includes(searchQuery.toLowerCase()) || app.description?.toLowerCase().includes(searchQuery.toLowerCase());
            const matchesCategory = selectedCategory === null || app.category === selectedCategory;
            return matchesSearch && matchesCategory;
        });
    }, [apps, searchQuery, selectedCategory]);

    return (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }} className="max-w-6xl mx-auto gap-8 flex flex-col">
            <div className="flex items-center justify-between flex-wrap gap-4">
                <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-[#ffdad5] rounded-[16px] flex items-center justify-center">
                        <Icon icon="material-symbols:build-outline" className="w-6 h-6 text-[#73342b]" />
                    </div>
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight text-[var(--md-sys-color-on-surface)]">封解Box Tools</h1>
                        <p className="text-[var(--md-sys-color-on-surface-variant)]">便利なツールを見つけて使おう</p>
                    </div>
                </div>
                <Link href="/tools/new">
                    <Button type="primary" shape="round" size="large" icon={<Icon icon="material-symbols:add" className="w-4 h-4" />} className="h-12 px-6 font-bold bg-[#ffdad5] text-[#73342b] border-none">
                        新規作成
                    </Button>
                </Link>
            </div>

            <div className="flex flex-col sm:flex-row gap-4">
                <Input
                    placeholder="ツールを検索..."
                    prefix={<Icon icon="material-symbols:search" className="w-5 h-5 text-[var(--md-sys-color-on-surface-variant)]" />}
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    size="large"
                    className="flex-1 rounded-[16px]"
                />
                <div className="flex gap-2 flex-wrap">
                    <Tag
                        className={`cursor-pointer rounded-full px-4 py-1 transition-all border-none ${selectedCategory === null ? "bg-[#ffdad5] text-[#73342b]" : "bg-[var(--md-sys-color-surface-container-high)] text-[var(--md-sys-color-on-surface-variant)]"}`}
                        onClick={() => setSelectedCategory(null)}
                    >すべて</Tag>
                    {categories.map((category) => (
                        <Tag
                            key={category}
                            className={`cursor-pointer rounded-full px-4 py-1 transition-all border-none ${selectedCategory === category ? "bg-[#ffdad5] text-[#73342b]" : "bg-[var(--md-sys-color-surface-container-high)] text-[var(--md-sys-color-on-surface-variant)]"}`}
                            onClick={() => setSelectedCategory(category)}
                        >{category}</Tag>
                    ))}
                </div>
            </div>

            {filteredApps.length > 0 ? (
                <motion.div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6" variants={containerVariants} initial="hidden" animate="visible">
                    {filteredApps.map((app) => (<ToolCard key={app.id} app={app} />))}
                </motion.div>
            ) : (
                <Card className="bg-[var(--md-sys-color-surface-container-lowest)] rounded-[28px] shadow-none border-none w-full">
                    <div className="py-16 text-center">
                        <div className="w-16 h-16 bg-[var(--md-sys-color-surface-container-high)] rounded-full flex items-center justify-center mx-auto mb-4">
                            <Icon icon="material-symbols:package-2-outline" className="w-8 h-8 text-[var(--md-sys-color-on-surface-variant)]" />
                        </div>
                        <h3 className="text-xl font-bold text-[var(--md-sys-color-on-surface)] mb-2">ツールが見つかりません</h3>
                        <p className="text-[var(--md-sys-color-on-surface-variant)] mb-6">{searchQuery || selectedCategory ? "検索条件に一致するツールがありません" : "まだツールが登録されていません"}</p>
                        <Link href="/tools/new">
                            <Button type="primary" shape="round" size="large" icon={<Icon icon="material-symbols:add" className="w-4 h-4" />} className="h-12 px-6 font-bold bg-[#ffdad5] text-[#73342b] border-none">
                                最初のツールを作成
                            </Button>
                        </Link>
                    </div>
                </Card>
            )}
        </motion.div>
    );
}
