"use client";

import { Card, CardBody, Button, Spinner } from "@heroui/react";
import { Icon } from "@iconify/react";

interface DownloadTabProps {
    isDownloading: boolean;
    onDownloadScript: () => void;
    onDownloadImages: () => void;
    onDownloadProject: () => void;
}

export default function DownloadTab({
    isDownloading,
    onDownloadScript,
    onDownloadImages,
    onDownloadProject
}: DownloadTabProps) {
    return (
        <div className="max-w-2xl mx-auto space-y-6 py-8">
            <Card className="card-elevated">
                <CardBody className="p-6">
                    <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
                        <Icon icon="mdi:file-document-outline" className="text-primary text-2xl" />
                        成果物ダウンロード
                    </h3>
                    <p className="text-sm text-foreground-muted mb-6">
                        プロジェクトの現在の状態に基づいた成果物をダウンロードできます。
                    </p>

                    <div className="space-y-4">
                        <Button
                            fullWidth
                            color="secondary"
                            variant="flat"
                            size="lg"
                            startContent={<Icon icon="mdi:script-text-outline" className="text-xl" />}
                            onPress={onDownloadScript}
                            isDisabled={isDownloading}
                        >
                            台本データ（.txt）のみダウンロード
                        </Button>

                        <Button
                            fullWidth
                            color="success"
                            variant="flat"
                            size="lg"
                            className="text-success-700 bg-success-50"
                            startContent={<Icon icon="mdi:image-multiple-outline" className="text-xl" />}
                            onPress={onDownloadImages}
                            isDisabled={isDownloading}
                        >
                            採用画像（.zip）のみダウンロード
                        </Button>

                        <div className="relative py-2">
                            <div className="absolute inset-0 flex items-center">
                                <span className="w-full border-t border-default-200"></span>
                            </div>
                            <div className="relative flex justify-center text-xs uppercase">
                                <span className="bg-content1 px-2 text-foreground-muted">Recommended</span>
                            </div>
                        </div>

                        <Button
                            fullWidth
                            color="primary"
                            size="lg"
                            className="font-bold shadow-md"
                            startContent={isDownloading ? <Spinner color="current" size="sm" /> : <Icon icon="mdi:folder-zip-outline" className="text-xl" />}
                            onPress={onDownloadProject}
                            isDisabled={isDownloading}
                        >
                            {isDownloading ? "生成中..." : "プロジェクト一式（台本+画像）をダウンロード"}
                        </Button>
                    </div>
                </CardBody>
            </Card>

            <div className="bg-warning/10 p-4 rounded-lg flex gap-3 items-start">
                <Icon icon="mdi:information-outline" className="text-warning text-xl shrink-0 mt-0.5" />
                <div className="text-xs text-warning-700 space-y-1">
                    <p className="font-bold">ダウンロードに関する注意</p>
                    <p>・採用画像がない場合、画像フォルダは空になります。</p>
                    <p>・zipファイルの生成には時間がかかる場合があります。</p>
                </div>
            </div>
        </div>
    );
}
