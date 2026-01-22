"use client";

import { Card, Button, Tag, Avatar, Input, Divider } from "antd";
import { Icon } from "@iconify/react";
import { motion } from "framer-motion";
import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import type { ToolApp } from "@/app/actions/tools";
import type { ToolRating } from "@/app/actions/tools-ratings";
import { rateApp, deleteRating } from "@/app/actions/tools-ratings";
import { deleteApp } from "@/app/actions/tools";

const { TextArea } = Input;

interface ToolDetailClientProps {
    app: ToolApp;
    ratings: ToolRating[];
    currentUserId?: string;
    currentUserRole?: string;
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

export function ToolDetailClient({ app, ratings, currentUserId, currentUserRole }: ToolDetailClientProps) {
    const router = useRouter();
    const [isDeleting, setIsDeleting] = useState(false);
    const [isRating, setIsRating] = useState(false);
    const [comment, setComment] = useState("");

    const isOwner = currentUserId === app.createdBy;
    const userRating = ratings.find((r) => r.userId === currentUserId);
    const likes = ratings.filter((r) => r.rating === 1).length;
    const dislikes = ratings.filter((r) => r.rating === -1).length;

    const handleRate = async (rating: 1 | -1) => {
        if (!currentUserId) {
            router.push("/login");
            return;
        }
        setIsRating(true);
        const result = await rateApp({ appId: app.id, rating, comment: comment.trim() || undefined });
        if (result.success) router.refresh();
        setIsRating(false);
    };

    const handleDeleteRating = async () => {
        setIsRating(true);
        await deleteRating(app.id);
        router.refresh();
        setIsRating(false);
    };

    const handleDelete = async () => {
        if (!confirm("このツールを削除しますか？")) return;
        setIsDeleting(true);
        const result = await deleteApp(app.id);
        if (result.success) {
            router.push("/tools");
        } else {
            alert(result.error);
            setIsDeleting(false);
        }
    };

    const style = typeBadgeClasses[app.type];

    return (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }} className="max-w-4xl mx-auto gap-8 flex flex-col">
            {/* Header */}
            <div className="flex items-start justify-between flex-wrap gap-4">
                <div className="flex items-center gap-4">
                    <Link href="/tools">
                        <Button type="text" shape="circle" icon={<Icon icon="material-symbols:arrow-back" className="w-5 h-5" />} />
                    </Link>
                    <div>
                        <div className="flex items-center gap-3 mb-1">
                            <h1 className="text-3xl font-bold tracking-tight text-[var(--md-sys-color-on-surface)]">{app.name}</h1>
                            <Tag className="rounded-full px-3 border-none" style={{ backgroundColor: style.bg, color: style.text }}>{typeLabels[app.type]}</Tag>
                        </div>
                        {app.description && (<p className="text-[var(--md-sys-color-on-surface-variant)]">{app.description}</p>)}
                    </div>
                </div>
                {isOwner && (
                    <div className="flex gap-2">
                        <Button shape="round" icon={<Icon icon="material-symbols:edit-outline" className="w-4 h-4" />} disabled>編集</Button>
                        <Button danger shape="round" icon={<Icon icon="material-symbols:delete-outline" className="w-4 h-4" />} loading={isDeleting} onClick={handleDelete}>削除</Button>
                    </div>
                )}
            </div>

            {/* App Content */}
            <Card className="bg-[var(--md-sys-color-surface-container-lowest)] rounded-[28px] shadow-none border-none overflow-hidden w-full">
                {app.type === "embed" && app.embedUrl && (
                    <div className="w-full aspect-video">
                        <iframe src={app.embedUrl} className="w-full h-full border-none" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowFullScreen />
                    </div>
                )}
                {app.type === "link" && app.embedUrl && (
                    <div className="p-8 text-center">
                        <p className="text-[var(--md-sys-color-on-surface-variant)] mb-6">このツールは外部サイトへのリンクです</p>
                        <Button type="primary" shape="round" size="large" href={app.embedUrl} target="_blank" rel="noopener noreferrer" className="h-14 px-8 font-bold bg-[#73342b] border-none" icon={<Icon icon="material-symbols:open-in-new" className="w-5 h-5" />}>
                            外部サイトを開く
                        </Button>
                    </div>
                )}
                {(app.type === "react" || app.type === "html") && (
                    <div className="p-8 text-center">
                        <div className="w-16 h-16 bg-[var(--md-sys-color-surface-container-high)] rounded-full flex items-center justify-center mx-auto mb-4">
                            <Icon icon="material-symbols:code" className="w-8 h-8 text-[var(--md-sys-color-on-surface-variant)]" />
                        </div>
                        <p className="text-[var(--md-sys-color-on-surface-variant)]">コード実行機能は今後実装予定です</p>
                    </div>
                )}
            </Card>

            {/* Rating Section */}
            <Card className="bg-[var(--md-sys-color-surface-container-lowest)] rounded-[28px] shadow-none border-none w-full">
                <div className="p-8 pb-4 flex items-center justify-between">
                    <h2 className="text-xl font-bold tracking-tight text-[var(--md-sys-color-on-surface)]">評価</h2>
                    <div className="flex items-center gap-4">
                        <div className="flex items-center gap-2">
                            <Icon icon="material-symbols:thumb-up" className="w-4 h-4 text-[#10200a]" />
                            <span className="font-mono">{likes}</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <Icon icon="material-symbols:thumb-down" className="w-4 h-4 text-[#93000a]" />
                            <span className="font-mono">{dislikes}</span>
                        </div>
                    </div>
                </div>
                <div className="px-8 pb-8 gap-6 flex flex-col">
                    {currentUserId && !isOwner && (
                        <div className="gap-4 flex flex-col">
                            {userRating ? (
                                <div className="p-4 rounded-[20px] bg-[var(--md-sys-color-surface-container-high)]/50">
                                    <p className="text-sm text-[var(--md-sys-color-on-surface-variant)] mb-2">あなたの評価</p>
                                    <div className="flex items-center justify-between">
                                        <Tag className={`rounded-full px-3 border-none ${userRating.rating === 1 ? "bg-[#d7f0cb] text-[#10200a]" : "bg-[#ffdad6] text-[#93000a]"}`}>
                                            {userRating.rating === 1 ? "高評価" : "低評価"}
                                        </Tag>
                                        <Button size="small" type="text" shape="round" onClick={handleDeleteRating} loading={isRating}>取り消す</Button>
                                    </div>
                                </div>
                            ) : (
                                <>
                                    <TextArea placeholder="コメントを追加（任意）" value={comment} onChange={(e) => setComment(e.target.value)} rows={3} className="rounded-[16px]" />
                                    <div className="flex gap-3">
                                        <Button block size="large" shape="round" className="flex-1 h-12 font-bold bg-[#d7f0cb] text-[#10200a] border-none" icon={<Icon icon="material-symbols:thumb-up-outline" className="w-4 h-4" />} loading={isRating} onClick={() => handleRate(1)}>高評価</Button>
                                        <Button block size="large" shape="round" className="flex-1 h-12 font-bold bg-[#ffdad6] text-[#93000a] border-none" icon={<Icon icon="material-symbols:thumb-down-outline" className="w-4 h-4" />} loading={isRating} onClick={() => handleRate(-1)}>低評価</Button>
                                    </div>
                                </>
                            )}
                        </div>
                    )}
                    {!currentUserId && (
                        <div className="text-center py-4">
                            <p className="text-[var(--md-sys-color-on-surface-variant)] mb-4">評価するにはログインが必要です</p>
                            <Link href="/login"><Button shape="round" className="h-10 px-6 font-medium bg-[#ffdad5] text-[#73342b] border-none">ログイン</Button></Link>
                        </div>
                    )}
                    {ratings.filter((r) => r.comment).length > 0 && (
                        <>
                            <Divider className="bg-[var(--md-sys-color-outline-variant)]/30 my-8" />
                            <div className="gap-4 flex flex-col">
                                <h3 className="font-medium text-[var(--md-sys-color-on-surface)]">コメント</h3>
                                {ratings.filter((r) => r.comment).map((r) => (
                                    <div key={r.id} className="flex gap-4 p-4 rounded-[20px] bg-[var(--md-sys-color-surface-container-high)]/50">
                                        <Avatar size="small" src={r.userImage || undefined}>{r.userName?.[0] || "?"}</Avatar>
                                        <div className="flex-1">
                                            <div className="flex items-center gap-2 mb-1">
                                                <span className="font-bold text-[var(--md-sys-color-on-surface)]">{r.userName || "不明"}</span>
                                                <Tag className={`rounded-full px-2 text-xs border-none ${r.rating === 1 ? "bg-[#d7f0cb] text-[#10200a]" : "bg-[#ffdad6] text-[#93000a]"}`}>{r.rating === 1 ? "👍" : "👎"}</Tag>
                                            </div>
                                            <p className="text-sm text-[var(--md-sys-color-on-surface-variant)]">{r.comment}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </>
                    )}
                </div>
            </Card>

            {/* Info Section */}
            <Card className="bg-[var(--md-sys-color-surface-container-lowest)] rounded-[28px] shadow-none border-none w-full">
                <div className="p-8">
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                        <div>
                            <p className="text-xs text-[var(--md-sys-color-on-surface-variant)] mb-1">作成者</p>
                            <div className="flex items-center gap-2">
                                <Avatar size="small" src={app.creatorImage || undefined}>{app.creatorName?.[0] || "?"}</Avatar>
                                <span className="font-bold text-[var(--md-sys-color-on-surface)]">{app.creatorName || "不明"}</span>
                            </div>
                        </div>
                        {app.category && (
                            <div>
                                <p className="text-xs text-[var(--md-sys-color-on-surface-variant)] mb-1">カテゴリ</p>
                                <Tag className="rounded-full px-3 bg-[var(--md-sys-color-surface-container-high)] border-none">{app.category}</Tag>
                            </div>
                        )}
                        <div>
                            <p className="text-xs text-[var(--md-sys-color-on-surface-variant)] mb-1">作成日</p>
                            <p className="font-medium text-[var(--md-sys-color-on-surface)]">{app.createdAt.toLocaleDateString("ja-JP")}</p>
                        </div>
                        <div>
                            <p className="text-xs text-[var(--md-sys-color-on-surface-variant)] mb-1">公開設定</p>
                            <Tag className={`rounded-full px-3 border-none ${app.isPublic ? "bg-[#d7f0cb] text-[#10200a]" : "bg-[var(--md-sys-color-surface-container-high)] text-[var(--md-sys-color-on-surface-variant)]"}`}>{app.isPublic ? "公開" : "非公開"}</Tag>
                        </div>
                    </div>
                </div>
            </Card>
        </motion.div>
    );
}
