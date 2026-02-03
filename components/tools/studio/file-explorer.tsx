"use client";

import { useSandpack } from "@codesandbox/sandpack-react";
import { FileOutlined, DeleteOutlined, FileAddOutlined } from "@ant-design/icons";
import { theme, Button, Input, Modal, Tooltip } from "antd";
import { useState } from "react";
import { cn } from "@/lib/utils";

export function CustomFileExplorer({ className }: { className?: string }) {
    const { sandpack } = useSandpack();
    const { files, activeFile, addFile, deleteFile, openFile } = sandpack;
    const { token } = theme.useToken();
    const [isCreating, setIsCreating] = useState(false);
    const [newFileName, setNewFileName] = useState("");

    const handleFileClick = (fileName: string) => {
        openFile(fileName);
    };

    const handleCreateFile = () => {
        if (!newFileName.trim()) return;
        let finalName = newFileName.trim();
        if (!finalName.startsWith("/")) finalName = "/" + finalName;

        addFile(finalName, "");
        openFile(finalName);
        setNewFileName("");
        setIsCreating(false);
    };

    const handleDeleteFile = (e: React.MouseEvent, fileName: string) => {
        e.stopPropagation();
        Modal.confirm({
            title: "ファイルを削除しますか？",
            content: `${fileName} を削除します。この操作は取り消せません。`,
            okText: "削除",
            okType: "danger",
            cancelText: "キャンセル",
            onOk: () => {
                deleteFile(fileName);
            }
        });
    };

    const sortedFiles = Object.keys(files).sort();

    return (
        <div className={cn("flex flex-col h-full", className)} style={{ backgroundColor: token.colorBgContainer }}>
            <div className="flex items-center justify-between p-2 border-b" style={{ borderColor: token.colorBorder }}>
                <span className="text-xs font-bold px-2 text-muted-foreground">EXPLORER</span>
                <Tooltip title="新規ファイル">
                    <Button
                        size="small"
                        type="text"
                        icon={<FileAddOutlined />}
                        onClick={() => setIsCreating(true)}
                    />
                </Tooltip>
            </div>

            {isCreating && (
                <div className="p-2 border-b" style={{ borderColor: token.colorBorder }}>
                    <Input
                        autoFocus
                        size="small"
                        placeholder="Filename (e.g. /utils.ts)"
                        value={newFileName}
                        onChange={(e) => setNewFileName(e.target.value)}
                        onPressEnter={handleCreateFile}
                        onBlur={() => setIsCreating(false)}
                    />
                </div>
            )}

            <div className="flex-1 overflow-y-auto py-1">
                {sortedFiles.map((fileName) => {
                    const isActive = activeFile === fileName;
                    return (
                        <div
                            key={fileName}
                            onClick={() => handleFileClick(fileName)}
                            className={cn(
                                "group flex items-center justify-between px-3 py-1.5 cursor-pointer text-sm transition-colors",
                                isActive ? "bg-primary/10 text-primary" : "hover:bg-muted/50 text-foreground"
                            )}
                            style={{
                                borderLeft: isActive ? `2px solid ${token.colorPrimary}` : "2px solid transparent"
                            }}
                        >
                            <div className="flex items-center gap-2 overflow-hidden">
                                <FileOutlined className={isActive ? "text-primary" : "text-muted-foreground"} />
                                <span className="truncate">{fileName.replace(/^\//, "")}</span>
                            </div>
                            {fileName !== "/App.tsx" && fileName !== "/index.html" && fileName !== "/package.json" && (
                                <Button
                                    type="text"
                                    size="small"
                                    className="opacity-0 group-hover:opacity-100 h-6 w-6 min-w-0 p-0"
                                    icon={<DeleteOutlined className="text-xs" />}
                                    onClick={(e) => handleDeleteFile(e, fileName)}
                                />
                            )}
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
