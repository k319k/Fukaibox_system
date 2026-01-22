"use client";

import { Card, Button, Spin } from "antd";
import { LoadingOutlined } from "@ant-design/icons";
import { Icon } from "@iconify/react";

interface DownloadTabProps {
    isDownloading: boolean;
    onDownloadScript: () => void;
    onDownloadScriptBodyOnly: () => void;
    onDownloadImages: () => void;
    onDownloadProject: () => void;
}

export default function DownloadTab({
    isDownloading, onDownloadScript, onDownloadScriptBodyOnly, onDownloadImages, onDownloadProject
}: DownloadTabProps) {
    return (
        <div className="max-w-2xl mx-auto space-y-6 py-8">
            <Card className="card-elevated">
                <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
                    <Icon icon="mdi:file-document-outline" className="text-[#73342b] text-2xl" />
                    成果物ダウンロード
                </h3>
                <p className="text-sm text-[var(--md-sys-color-on-surface-variant)] mb-6">
                    プロジェクトの現在の状態に基づいた成果物をダウンロードできます。
                </p>

                <div className="space-y-4">
                    <div className="space-y-2">
                        <p className="text-xs font-semibold text-[var(--md-sys-color-on-surface-variant)] uppercase tracking-wide">台本データ</p>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                            <Button
                                block
                                size="large"
                                icon={<Icon icon="mdi:script-text" className="text-xl" />}
                                onClick={onDownloadScriptBodyOnly}
                                disabled={isDownloading}
                                className="bg-[#9E2B1F]/10 text-[#9E2B1F] border-none"
                            >
                                本文のみ(.txt)
                            </Button>
                            <Button
                                block
                                size="large"
                                icon={<Icon icon="mdi:script-text-outline" className="text-xl" />}
                                onClick={onDownloadScript}
                                disabled={isDownloading}
                            >
                                詳細版(.txt)
                            </Button>
                        </div>
                        <p className="text-xs text-[var(--md-sys-color-on-surface-variant)]">
                            本文のみ：セリフのみ / 詳細版：セクション区切り・画像指示込み
                        </p>
                    </div>

                    <Button
                        block
                        size="large"
                        icon={<Icon icon="mdi:image-multiple-outline" className="text-xl" />}
                        onClick={onDownloadImages}
                        disabled={isDownloading}
                        className="bg-[#d7f0cb] text-[#10200a] border-none"
                    >
                        採用画像（.zip）のみダウンロード
                    </Button>

                    <div className="relative py-2">
                        <div className="absolute inset-0 flex items-center">
                            <span className="w-full border-t border-[var(--md-sys-color-outline-variant)]"></span>
                        </div>
                        <div className="relative flex justify-center text-xs uppercase">
                            <span className="bg-[var(--md-sys-color-surface-container-lowest)] px-2 text-[var(--md-sys-color-on-surface-variant)]">Recommended</span>
                        </div>
                    </div>

                    <Button
                        block
                        type="primary"
                        size="large"
                        className="font-bold shadow-md bg-[#73342b]"
                        icon={isDownloading ? <LoadingOutlined /> : <Icon icon="mdi:folder-zip-outline" className="text-xl" />}
                        onClick={onDownloadProject}
                        disabled={isDownloading}
                    >
                        {isDownloading ? "生成中..." : "プロジェクト一式（台本+画像）をダウンロード"}
                    </Button>
                </div>
            </Card>

            <div className="bg-[#fbe7a6]/30 p-4 rounded-lg flex gap-3 items-start">
                <Icon icon="mdi:information-outline" className="text-[#564419] text-xl shrink-0 mt-0.5" />
                <div className="text-xs text-[#564419] space-y-1">
                    <p className="font-bold">ダウンロードに関する注意</p>
                    <p>・採用画像がない場合、画像フォルダは空になります。</p>
                    <p>・zipファイルの生成には時間がかかる場合があります。</p>
                </div>
            </div>
        </div>
    );
}
