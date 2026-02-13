import { useState, useMemo } from "react";
import { Button, Tag, Divider, Progress, Spin, Avatar, Radio, Tooltip, message, Modal } from "antd"; import imageCompression from "browser-image-compression";
import { Icon } from "@iconify/react";
import { Section, UploadedImage } from "@/types/kitchen";
import { PresenceUser, PresenceStatus } from "@/hooks/kitchen/usePresence";
import ScriptViewerModal from "./ScriptViewerModal";
import { cn } from "@/lib/utils";

interface ImageUploadTabProps {
    sections: Section[];
    images: UploadedImage[];
    editorFontSize: number;
    uploadingSectionId: string | null;
    uploadProgress: number;
    uploaderNames: Record<string, string>;
    projectTitle: string;
    projectId: string;
    activeUsers?: PresenceUser[];
    currentUser?: { id: string; name: string; image: string | null } | null;
    onStatusUpdate?: (status: PresenceStatus) => Promise<void>;
    onTabChange?: (key: string) => void;
    onAddSection: (index: number) => void;
    onDeleteSection: (id: string) => void;
    onImageUpload: (sectionId: string, files: File[]) => void;
    onDeleteImage: (imageId: string) => void;
    onOpenLightbox: (images: UploadedImage[], index: number) => void;
    userRole?: string;
}

export default function ImageUploadTab({
    sections, images, editorFontSize, uploadingSectionId, uploadProgress, uploaderNames, projectTitle,
    projectId: _projectId, activeUsers = [], currentUser, onStatusUpdate, onTabChange,
    onAddSection, onDeleteSection, onImageUpload, onDeleteImage, onOpenLightbox,
    userRole = "guest"
}: ImageUploadTabProps) {
    const [isScriptViewerOpen, setIsScriptViewerOpen] = useState(false);

    // 自分の現在のステータスを取得（activeUsersから探す）
    const myStatus = useMemo(() => {
        if (!currentUser) return "not_participating";
        const me = activeUsers.find(u => u.userId === currentUser.id);
        return me?.status || "not_participating";
    }, [activeUsers, currentUser]);

    // 自分が画像をアップロードした枚数
    const myUploadCount = useMemo(() => {
        if (!currentUser) return 0;
        return images.filter(img => img.uploadedBy === currentUser.id).length;
    }, [images, currentUser]);

    const isGicho = userRole === 'gicho';

    if (sections.length === 0 || !sections.some(s => s.allowImageSubmission ?? true)) {
        return (
            <div className="flex flex-col items-center justify-center py-12 bg-[var(--md-sys-color-surface-container)] rounded-lg">
                <Icon icon="material-symbols:no-photography" className="text-6xl text-[var(--md-sys-color-on-surface-variant)] mb-4" />
                <p className="text-body-large text-[var(--md-sys-color-on-surface-variant)]">
                    {sections.length === 0
                        ? "まずは調理タブで台本を入力してください"
                        : "画像提出が許可されているセクションがありません"}
                </p>
            </div>
        );
    }

    return (
        <>
            <ScriptViewerModal isOpen={isScriptViewerOpen} onClose={() => setIsScriptViewerOpen(false)} sections={sections} projectTitle={projectTitle} />

            <div className="space-y-8 pb-32">
                <div className="flex flex-col md:flex-row justify-between items-center gap-4 px-2">
                    {/* Active Users Display & Participant Status */}
                    <div className="flex gap-2 items-center overflow-x-auto pb-2 w-full md:w-auto">
                        {/* Merge active users and uploaders */}
                        {(() => {
                            const allUserIds = new Set([
                                ...activeUsers.map(u => u.userId),
                                ...images.map(i => i.uploadedBy)
                            ]);

                            const sortedUsers = Array.from(allUserIds).map(userId => {
                                const userImages = images.filter(img => img.uploadedBy === userId);
                                const user = activeUsers.find(u => u.userId === userId);
                                const isActive = !!user; // userオブジェクトがあればactiveとみなす（lastSeenが新しいので）
                                const userName = uploaderNames[userId] || user?.userName || "Guest";
                                const userImage = user?.userImage;
                                const status = user?.status || "not_participating";

                                let statusText = "不参加";
                                let statusColor = "bg-gray-100 text-gray-500";

                                if (status === "participating") {
                                    statusText = "参加中";
                                    statusColor = "bg-blue-100 text-blue-700";
                                } else if (status === "completed") {
                                    statusText = "提出完了";
                                    statusColor = "bg-green-100 text-green-700";
                                }

                                if (userImages.length > 0) {
                                    // 提出枚数があればそちらを優先表示しつつ、色はstatusに従うか、目立たせる
                                    statusText = `${userImages.length}枚`;
                                    if (status === "completed") statusText += " (完了)";
                                    statusColor = "bg-[var(--md-sys-color-primary-container)] text-[var(--md-sys-color-on-primary-container)]";
                                }

                                return {
                                    userId,
                                    userName,
                                    userImage,
                                    isActive,
                                    status,
                                    uploadCount: userImages.length,
                                    statusText,
                                    statusColor
                                };
                            }).sort((a, b) => {
                                // 1. 提出枚数が多い順
                                if (b.uploadCount !== a.uploadCount) return b.uploadCount - a.uploadCount;
                                // 2. アクティブな人優先
                                if (b.isActive !== a.isActive) return b.isActive ? 1 : -1;
                                // 3. 名前順
                                return a.userName.localeCompare(b.userName);
                            });

                            return sortedUsers.map(user => (
                                <div key={user.userId} className="flex items-center gap-2 pr-4 min-w-max border-r last:border-0 border-[var(--md-sys-color-outline-variant)]">
                                    <div className="relative">
                                        <Avatar src={user.userImage} icon={<Icon icon="mdi:account" />} size="small" />
                                        {user.isActive && <span className="absolute bottom-0 right-0 w-2 h-2 bg-green-500 rounded-full border border-white" />}
                                    </div>
                                    <div className="flex flex-col">
                                        <span className="text-xs font-bold text-[var(--md-sys-color-on-surface)]">{user.userName}</span>
                                        <span className={`text-[10px] px-1.5 rounded-full w-fit ${user.statusColor}`}>
                                            {user.statusText}
                                        </span>
                                    </div>
                                </div>
                            ));
                        })()}
                    </div>

                    <div className="flex gap-2 shrink-0">
                        {onTabChange && (
                            <Button
                                icon={<Icon icon="material-symbols:edit-note" className="text-lg" />}
                                onClick={() => onTabChange("cooking")}
                                className="text-[var(--md-sys-color-primary)]"
                            >
                                調理（編集）に戻る
                            </Button>
                        )}
                        <Button
                            icon={<Icon icon="material-symbols:description-outline" className="text-lg" />}
                            onClick={() => setIsScriptViewerOpen(true)}
                            className="text-[var(--md-sys-color-primary)]"
                        >
                            原稿を見る
                        </Button>
                    </div>
                </div>
                {sections.filter(s => s.allowImageSubmission ?? true).map((section) => {
                    const sectionImages = images.filter(img => img.sectionId === section.id);
                    const originalIndex = sections.findIndex(s => s.id === section.id);
                    const isUploading = uploadingSectionId === section.id;

                    return (
                        <div key={section.id} className="space-y-4">
                            {isGicho && (
                                <div className="flex justify-center opacity-0 hover:opacity-100 transition-opacity">
                                    <Button
                                        size="small"
                                        shape="round"
                                        icon={<Icon icon="material-symbols:add" />}
                                        onClick={() => onAddSection(originalIndex)}
                                        className="bg-[var(--md-sys-color-primary-container)] text-[var(--md-sys-color-on-primary-container)] border-none shadow-none"
                                    >
                                        ここにセクションを追加
                                    </Button>
                                </div>
                            )}

                            <div className="m3-card-filled p-0 overflow-hidden shadow-sm">
                                <div className="p-4 flex flex-wrap justify-between items-center gap-2 border-b border-[var(--md-sys-color-outline-variant)] bg-[var(--md-sys-color-surface-container)]">
                                    <div className="flex flex-wrap items-center gap-2">
                                        <Tag className="rounded-full bg-[var(--md-sys-color-primary-container)] text-[var(--md-sys-color-on-primary-container)] border-none px-3 py-1 flex items-center text-label-large">
                                            <Icon icon="material-symbols:numbers" className="mr-1 text-lg" />
                                            セクション {originalIndex + 1}
                                        </Tag>
                                        <Tag className="rounded-full bg-[var(--md-sys-color-secondary-container)] text-[var(--md-sys-color-on-secondary-container)] border-none px-3 py-1 flex items-center text-label-large">
                                            <Icon icon="material-symbols:image" className="mr-1 text-lg" />
                                            {sectionImages.length}枚
                                        </Tag>
                                        <Tag className="rounded-full bg-[var(--color-giin-container)] text-[var(--color-giin)] border-none px-3 py-1 flex items-center text-label-large">
                                            <Icon icon="material-symbols:group" className="mr-1 text-lg" />
                                            {new Set(sectionImages.map(img => img.uploadedBy)).size}人参加
                                        </Tag>
                                    </div>
                                    {isGicho && (
                                        <Button
                                            size="small"
                                            danger
                                            type="text"
                                            icon={<Icon icon="material-symbols:delete-outline" className="text-lg" />}
                                            onClick={() => onDeleteSection(section.id)}
                                        />
                                    )}
                                </div>
                                <div className="p-4 space-y-4">
                                    <div
                                        className="text-[var(--md-sys-color-on-surface)] whitespace-pre-wrap font-medium"
                                        style={{ fontSize: `${editorFontSize}px`, lineHeight: 1.6 }}
                                    >
                                        {section.content}
                                    </div>

                                    {section.imageInstruction && (
                                        <div className="bg-[var(--md-sys-color-primary-container)]/30 border-l-4 border-[var(--md-sys-color-primary)] pl-4 py-3 rounded-r-lg">
                                            <div className="flex items-center gap-2 mb-1">
                                                <Icon icon="material-symbols:image" className="text-[var(--md-sys-color-primary)]" />
                                                <p className="text-label-large font-bold text-[var(--md-sys-color-primary)]">画像指示</p>
                                            </div>
                                            <p className="text-body-medium whitespace-pre-wrap">{section.imageInstruction}</p>
                                        </div>
                                    )}

                                    {(() => {
                                        const refUrls = (section.referenceImageUrls && section.referenceImageUrls.length > 0)
                                            ? section.referenceImageUrls
                                            : section.referenceImageUrl ? [section.referenceImageUrl] : [];
                                        if (refUrls.length === 0) return null;
                                        return (
                                            <div className="bg-[var(--md-sys-color-surface-container)] p-3 rounded-xl">
                                                <div className="flex justify-between items-center mb-2">
                                                    <p className="text-label-large text-[var(--md-sys-color-on-surface-variant)]">参考画像</p>
                                                </div>
                                                <div className="flex gap-2 flex-wrap">
                                                    {refUrls.map((url, idx) => (
                                                        /* eslint-disable-next-line @next/next/no-img-element */
                                                        <img key={idx} src={url} alt={`参考画像${idx + 1}`}
                                                            className="max-h-60 max-w-full rounded-lg border border-[var(--md-sys-color-outline-variant)] object-contain"
                                                            onError={(e) => (e.currentTarget.style.display = 'none')}
                                                        />
                                                    ))}
                                                </div>
                                            </div>
                                        );
                                    })()}

                                    <Divider className="border-[var(--md-sys-color-outline-variant)] opacity-50" />

                                    <div
                                        onPaste={(e) => {
                                            const items = e.clipboardData?.items;
                                            if (!items) return;
                                            const imageFiles: File[] = [];
                                            for (let i = 0; i < items.length; i++) {
                                                if (items[i].type.startsWith("image/")) {
                                                    const file = items[i].getAsFile();
                                                    if (file) imageFiles.push(file);
                                                }
                                            }
                                            if (imageFiles.length > 0) {
                                                e.preventDefault();
                                                onImageUpload(section.id, imageFiles);
                                                message.success(`${imageFiles.length}枚の画像を貼り付けました`);
                                            }
                                        }}
                                        onDragOver={(e) => { e.preventDefault(); e.stopPropagation(); }}
                                        onDrop={(e) => {
                                            e.preventDefault();
                                            e.stopPropagation();
                                            const files = Array.from(e.dataTransfer.files).filter(f => f.type.startsWith("image/"));
                                            if (files.length > 0) {
                                                onImageUpload(section.id, files);
                                                message.success(`${files.length}枚の画像をドロップしました`);
                                            }
                                        }}
                                        tabIndex={0}
                                    >
                                        <input
                                            type="file"
                                            multiple
                                            accept="image/*"
                                            onChange={(e) => {
                                                const files = e.target.files ? Array.from(e.target.files) : [];
                                                if (files.length > 0) {
                                                    onImageUpload(section.id, files);
                                                }
                                                e.target.value = '';
                                            }}
                                            className="hidden"
                                            id={`file-input-${section.id}`}
                                        />
                                        <label htmlFor={`file-input-${section.id}`}>
                                            <div className={cn(
                                                "rounded-xl p-8 text-center cursor-pointer transition-all duration-200",
                                                "border border-solid",
                                                isUploading
                                                    ? "border-[var(--md-sys-color-primary)] bg-[var(--md-sys-color-primary-container)]/20"
                                                    : "border-[var(--md-sys-color-outline)] hover:border-[var(--md-sys-color-primary)] hover:bg-[var(--md-sys-color-surface-container-high)]"
                                            )}>
                                                {isUploading ? (
                                                    <div className="space-y-3">
                                                        <Spin indicator={<Icon icon="material-symbols:progress-activity" className="text-3xl animate-spin text-[var(--md-sys-color-primary)]" />} />
                                                        <p className="text-body-medium text-[var(--md-sys-color-primary)] font-medium">アップロード中...</p>
                                                        <Progress percent={uploadProgress} size="small" showInfo={false} strokeColor="var(--md-sys-color-primary)" className="max-w-xs mx-auto" />
                                                    </div>
                                                ) : (
                                                    <div className="space-y-2">
                                                        <Icon icon="material-symbols:cloud-upload-outline" className="text-4xl text-[var(--md-sys-color-primary)] mx-auto" />
                                                        <p className="text-title-medium font-bold text-[var(--md-sys-color-on-surface)]">クリック・ドラッグ・貼り付けで画像をアップロード</p>
                                                        <p className="text-body-small text-[var(--md-sys-color-on-surface-variant)]">jpg, png, gif, webp対応 ｜ Ctrl+V で貼り付け可能</p>
                                                    </div>
                                                )}
                                            </div>
                                        </label>
                                    </div>

                                    {sectionImages.length > 0 && (
                                        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                                            {sectionImages.map((img, imgIndex) => {
                                                const isSelected = img.isSelected && img.sectionId === section.id;
                                                return (
                                                    <div key={img.id} className="relative group">
                                                        <div
                                                            className={cn(
                                                                "relative aspect-square rounded-xl overflow-hidden cursor-pointer transition-all duration-200",
                                                                "border-[3px]",
                                                                isSelected
                                                                    ? "border-[var(--md-sys-color-primary)] shadow-md"
                                                                    : "border-transparent hover:border-[var(--md-sys-color-outline-variant)]"
                                                            )}
                                                            onClick={() => onOpenLightbox(sectionImages, imgIndex)}
                                                        >
                                                            {/* eslint-disable-next-line @next/next/no-img-element */}
                                                            <img src={img.imageUrl} alt="uploaded" className="w-full h-full object-cover" />

                                                            {isSelected && (
                                                                <div className="absolute top-2 right-2 bg-[var(--md-sys-color-primary)] text-[var(--md-sys-color-on-primary)] p-1 rounded-full shadow-sm z-10">
                                                                    <Icon icon="material-symbols:check" className="text-lg" />
                                                                </div>
                                                            )}

                                                            <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity bg-black/20">
                                                                <Icon icon="material-symbols:zoom-in" className="text-white drop-shadow-md text-3xl" />
                                                            </div>
                                                        </div>

                                                        <button
                                                            className="absolute -top-2 -left-2 bg-[var(--md-sys-color-error-container)] text-[var(--md-sys-color-on-error-container)] p-1.5 rounded-full shadow-sm opacity-0 group-hover:opacity-100 transition-opacity z-20 hover:scale-110"
                                                            onClick={(e) => { e.stopPropagation(); onDeleteImage(img.id); }}
                                                            title="画像を削除"
                                                        >
                                                            <Icon icon="material-symbols:delete" className="text-sm" />
                                                        </button>

                                                        <div className="mt-1 px-1">
                                                            <span className="text-body-small text-[var(--md-sys-color-on-surface-variant)] truncate block max-w-full">
                                                                {uploaderNames[img.uploadedBy] || "User"}
                                                            </span>
                                                        </div>
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    )}
                                </div>
                            </div>

                            {isGicho && originalIndex === sections.length - 1 && (
                                <div className="flex justify-center pt-4">
                                    <Button
                                        size="small"
                                        shape="round"
                                        icon={<Icon icon="material-symbols:add" />}
                                        onClick={() => onAddSection(originalIndex + 1)}
                                        className="bg-[var(--md-sys-color-primary-container)] text-[var(--md-sys-color-on-primary-container)] border-none shadow-none"
                                    >
                                        末尾にセクションを追加
                                    </Button>
                                </div>
                            )}
                        </div>
                    );
                })}
            </div>

            {/* Status Selection Footer */}
            {currentUser && onStatusUpdate && (
                <div className="fixed bottom-0 left-0 right-0 p-4 bg-[var(--md-sys-color-surface-container-high)] border-t border-[var(--md-sys-color-outline-variant)] shadow-lg z-40 flex justify-center items-center gap-4">
                    <span className="text-label-large font-bold hidden sm:inline">あなたのステータス:</span>
                    <Radio.Group
                        value={myStatus}
                        onChange={(e) => {
                            if (e.target.value === "completed" && myUploadCount === 0) {
                                return; // Prevent selection (UI should be disabled ideally, but double check)
                            }
                            onStatusUpdate(e.target.value);
                        }}
                        buttonStyle="solid"
                        className="flex gap-2"
                    >
                        <Radio.Button value="not_participating">不参加</Radio.Button>
                        <Radio.Button value="participating">画像提出参加</Radio.Button>
                        <Tooltip title={myUploadCount === 0 ? "画像を1枚以上提出すると選択できます" : ""}>
                            <Radio.Button value="completed" disabled={myUploadCount === 0}>
                                提出完了
                            </Radio.Button>
                        </Tooltip>
                    </Radio.Group>
                </div>
            )}
        </>
    );
}
