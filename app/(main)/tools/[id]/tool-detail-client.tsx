"use client";

import { Card, CardBody, CardHeader, Button, Chip, Avatar, Textarea, Divider } from "@heroui/react";
import { ArrowLeft, ThumbsUp, ThumbsDown, ExternalLink, Code, Edit, Trash2 } from "lucide-react";
import { motion } from "framer-motion";
import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import type { ToolApp } from "@/app/actions/tools";
import type { ToolRating } from "@/app/actions/tools-ratings";
import { rateApp, deleteRating } from "@/app/actions/tools-ratings";
import { deleteApp } from "@/app/actions/tools";

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

const typeBadgeClasses: Record<string, string> = {
    embed: "bg-success text-[#10200a]",
    link: "bg-warning text-[#564419]",
    react: "bg-primary text-[#73342b]",
    html: "bg-content2 text-foreground",
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
        const result = await rateApp({
            appId: app.id,
            rating,
            comment: comment.trim() || undefined,
        });

        if (result.success) {
            router.refresh();
        }
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

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className="max-w-4xl mx-auto gap-8 flex flex-col"
        >
            {/* Header */}
            <div className="flex items-start justify-between flex-wrap gap-4">
                <div className="flex items-center gap-4">
                    <Link href="/tools">
                        <Button
                            isIconOnly
                            variant="light"
                            radius="full"
                            className="flex items-center justify-center active:scale-95 transition-all"
                        >
                            <ArrowLeft className="w-5 h-5" />
                        </Button>
                    </Link>
                    <div>
                        <div className="flex items-center gap-3 mb-1">
                            <h1 className="text-3xl font-bold tracking-tight text-foreground">
                                {app.name}
                            </h1>
                            <Chip size="sm" variant="flat" className={`rounded-full px-3 ${typeBadgeClasses[app.type]}`}>
                                {typeLabels[app.type]}
                            </Chip>
                        </div>
                        {app.description && (
                            <p className="text-foreground/70">{app.description}</p>
                        )}
                    </div>
                </div>

                {isOwner && (
                    <div className="flex gap-2">
                        <Button
                            variant="flat"
                            radius="full"
                            className="h-10 px-4 flex items-center justify-center gap-2 active:scale-95 transition-all"
                            startContent={<Edit className="w-4 h-4" />}
                            isDisabled
                        >
                            編集
                        </Button>
                        <Button
                            color="danger"
                            variant="flat"
                            radius="full"
                            className="h-10 px-4 flex items-center justify-center gap-2 active:scale-95 transition-all"
                            startContent={<Trash2 className="w-4 h-4" />}
                            isLoading={isDeleting}
                            onPress={handleDelete}
                        >
                            削除
                        </Button>
                    </div>
                )}
            </div>

            {/* App Content */}
            <Card className="bg-content1 rounded-[28px] shadow-none border-none overflow-hidden w-full">
                {app.type === "embed" && app.embedUrl && (
                    <div className="w-full aspect-video">
                        <iframe
                            src={app.embedUrl}
                            className="w-full h-full border-none"
                            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                            allowFullScreen
                        />
                    </div>
                )}

                {app.type === "link" && app.embedUrl && (
                    <CardBody className="p-8 text-center">
                        <p className="text-foreground/70 mb-6">
                            このツールは外部サイトへのリンクです
                        </p>
                        <Button
                            as="a"
                            href={app.embedUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            color="primary"
                            variant="flat"
                            radius="full"
                            className="h-14 px-8 font-bold bg-primary text-[#73342b] flex items-center justify-center gap-2 active:scale-95 transition-all"
                            endContent={<ExternalLink className="w-5 h-5" />}
                        >
                            外部サイトを開く
                        </Button>
                    </CardBody>
                )}

                {(app.type === "react" || app.type === "html") && (
                    <CardBody className="p-8 text-center">
                        <div className="w-16 h-16 bg-content2 rounded-full flex items-center justify-center mx-auto mb-4">
                            <Code className="w-8 h-8 text-foreground/60" />
                        </div>
                        <p className="text-foreground/70">
                            コード実行機能は今後実装予定です
                        </p>
                    </CardBody>
                )}
            </Card>

            {/* Rating Section */}
            <Card className="bg-content1 rounded-[28px] shadow-none border-none w-full">
                <CardHeader className="p-8 pb-4 flex-row items-center justify-between">
                    <h2 className="text-xl font-bold tracking-tight text-foreground">
                        評価
                    </h2>
                    <div className="flex items-center gap-4">
                        <div className="flex items-center gap-2">
                            <ThumbsUp className="w-4 h-4 text-[#10200a]" />
                            <span className="font-mono">{likes}</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <ThumbsDown className="w-4 h-4 text-[#93000a]" />
                            <span className="font-mono">{dislikes}</span>
                        </div>
                    </div>
                </CardHeader>
                <CardBody className="px-8 pb-8 gap-6 flex flex-col">
                    {/* Rate Form */}
                    {currentUserId && !isOwner && (
                        <div className="gap-4 flex flex-col">
                            {userRating ? (
                                <div className="p-4 rounded-[20px] bg-content2/50">
                                    <p className="text-sm text-foreground/70 mb-2">
                                        あなたの評価
                                    </p>
                                    <div className="flex items-center justify-between">
                                        <Chip
                                            size="sm"
                                            variant="flat"
                                            className={`rounded-full px-3 ${userRating.rating === 1
                                                ? "bg-success text-[#10200a]"
                                                : "bg-danger text-[#93000a]"
                                                }`}
                                        >
                                            {userRating.rating === 1 ? "高評価" : "低評価"}
                                        </Chip>
                                        <Button
                                            size="sm"
                                            variant="light"
                                            radius="full"
                                            onPress={handleDeleteRating}
                                            isLoading={isRating}
                                            className="active:scale-95 transition-all"
                                        >
                                            取り消す
                                        </Button>
                                    </div>
                                </div>
                            ) : (
                                <>
                                    <Textarea
                                        placeholder="コメントを追加（任意）"
                                        variant="flat"
                                        radius="lg"
                                        value={comment}
                                        onValueChange={setComment}
                                        minRows={3}
                                        classNames={{
                                            inputWrapper: "bg-content2/50 rounded-[16px] !opacity-100 min-h-[100px] border-none shadow-none",
                                            input: "placeholder:text-default-400 py-2 leading-relaxed",
                                        }}
                                    />
                                    <div className="flex gap-3">
                                        <Button
                                            variant="flat"
                                            radius="full"
                                            className="flex-1 h-12 font-bold bg-success text-[#10200a] flex items-center justify-center gap-2 active:scale-95 transition-all"
                                            startContent={<ThumbsUp className="w-4 h-4" />}
                                            isLoading={isRating}
                                            onPress={() => handleRate(1)}
                                        >
                                            高評価
                                        </Button>
                                        <Button
                                            variant="flat"
                                            radius="full"
                                            className="flex-1 h-12 font-bold bg-danger text-[#93000a] flex items-center justify-center gap-2 active:scale-95 transition-all"
                                            startContent={<ThumbsDown className="w-4 h-4" />}
                                            isLoading={isRating}
                                            onPress={() => handleRate(-1)}
                                        >
                                            低評価
                                        </Button>
                                    </div>
                                </>
                            )}
                        </div>
                    )}

                    {!currentUserId && (
                        <div className="text-center py-4">
                            <p className="text-foreground/70 mb-4">
                                評価するにはログインが必要です
                            </p>
                            <Link href="/login">
                                <Button
                                    variant="flat"
                                    radius="full"
                                    className="h-10 px-6 font-medium bg-primary text-[#73342b] active:scale-95 transition-all"
                                >
                                    ログイン
                                </Button>
                            </Link>
                        </div>
                    )}

                    {/* Comments List */}
                    {ratings.filter((r) => r.comment).length > 0 && (
                        <>
                            <Divider className="bg-divider/30 my-8" />
                            <div className="gap-4 flex flex-col">
                                <h3 className="font-medium text-foreground">
                                    コメント
                                </h3>
                                {ratings
                                    .filter((r) => r.comment)
                                    .map((r) => (
                                        <div
                                            key={r.id}
                                            className="flex gap-4 p-4 rounded-[20px] bg-content2/50"
                                        >
                                            <Avatar
                                                size="sm"
                                                name={r.userName?.[0] || "?"}
                                                src={r.userImage || undefined}
                                                classNames={{ base: "shrink-0 rounded-[16px]" }}
                                            />
                                            <div className="flex-1">
                                                <div className="flex items-center gap-2 mb-1">
                                                    <span className="font-bold text-foreground">
                                                        {r.userName || "不明"}
                                                    </span>
                                                    <Chip
                                                        size="sm"
                                                        variant="flat"
                                                        className={`rounded-full px-2 text-xs ${r.rating === 1
                                                            ? "bg-success text-[#10200a]"
                                                            : "bg-danger text-[#93000a]"
                                                            }`}
                                                    >
                                                        {r.rating === 1 ? "👍" : "👎"}
                                                    </Chip>
                                                </div>
                                                <p className="text-sm text-foreground/70">
                                                    {r.comment}
                                                </p>
                                            </div>
                                        </div>
                                    ))}
                            </div>
                        </>
                    )}
                </CardBody>
            </Card>

            {/* Info Section */}
            <Card className="bg-content1 rounded-[28px] shadow-none border-none w-full">
                <CardBody className="p-8">
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                        <div>
                            <p className="text-xs text-foreground/60 mb-1">
                                作成者
                            </p>
                            <div className="flex items-center gap-2">
                                <Avatar
                                    size="sm"
                                    name={app.creatorName?.[0] || "?"}
                                    src={app.creatorImage || undefined}
                                    classNames={{ base: "rounded-[16px]" }}
                                />
                                <span className="font-bold text-foreground">
                                    {app.creatorName || "不明"}
                                </span>
                            </div>
                        </div>
                        {app.category && (
                            <div>
                                <p className="text-xs text-foreground/60 mb-1">
                                    カテゴリ
                                </p>
                                <Chip
                                    size="sm"
                                    variant="flat"
                                    className="rounded-full px-3 bg-content2"
                                >
                                    {app.category}
                                </Chip>
                            </div>
                        )}
                        <div>
                            <p className="text-xs text-foreground/60 mb-1">
                                作成日
                            </p>
                            <p className="font-medium text-foreground">
                                {app.createdAt.toLocaleDateString("ja-JP")}
                            </p>
                        </div>
                        <div>
                            <p className="text-xs text-foreground/60 mb-1">
                                公開設定
                            </p>
                            <Chip
                                size="sm"
                                variant="flat"
                                className={`rounded-full px-3 ${app.isPublic
                                    ? "bg-success text-[#10200a]"
                                    : "bg-content2 text-foreground/70"
                                    }`}
                            >
                                {app.isPublic ? "公開" : "非公開"}
                            </Chip>
                        </div>
                    </div>
                </CardBody>
            </Card>
        </motion.div>
    );
}
