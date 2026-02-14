"use client";

import { useState } from "react";
import { Modal, Upload, Input, DatePicker, Form, message, Button, Spin } from "antd";
import type { UploadFile } from "antd";
import { InboxOutlined, YoutubeOutlined, ExperimentOutlined } from "@ant-design/icons";
import { scheduleVideoUpload } from "@/app/actions/youtube-manager"; // To be implemented or updated
import dayjs from "dayjs";

const { Dragger } = Upload;
const { TextArea } = Input;

interface UploadModalProps {
    visible: boolean;
    onClose: () => void;
    initialTitle?: string;
    initialDescription?: string;
    projectId?: string; // If uploading from Kitchen
}

export default function UploadModal({ visible, onClose, initialTitle, initialDescription, projectId }: UploadModalProps) {
    const [form] = Form.useForm();
    const [fileList, setFileList] = useState<UploadFile[]>([]);
    const [uploading, setUploading] = useState(false);

    const handleUpload = async () => {
        try {
            const values = await form.validateFields();
            if (fileList.length === 0) {
                message.error("動画ファイルを選択してください");
                return;
            }

            setUploading(true);

            // TODO: Implement real upload pipeline:
            // 1. Get Presigned URL for Video (PUT) from R2
            // 2. Upload file to R2 with real progress tracking
            // 3. Call Server Action to trigger "R2 -> YouTube" sync

            // Register Scheduled Video (metadata only — real functionality)
            const result = await scheduleVideoUpload({
                title: values.title,
                description: values.description,
                scheduledDate: values.scheduledDate.toDate(),
                cookingProjectId: projectId
            });

            if (result.success) {
                message.success("アップロード予約が完了しました！");
                onClose();
                form.resetFields();
                setFileList([]);
            } else {
                message.error(result.error || "アップロードに失敗しました");
            }

        } catch (error) {
            console.error(error);
            message.error("エラーが発生しました");
        } finally {
            setUploading(false);
        }
    };

    const uploadProps = {
        onRemove: () => {
            setFileList([]);
        },
        beforeUpload: (file: any) => {
            const isVideo = file.type.startsWith('video/');
            if (!isVideo) {
                message.error(`${file.name} is not a video file`);
                return Upload.LIST_IGNORE;
            }
            setFileList([file]);
            return false;
        },
        fileList,
    };

    return (
        <Modal
            title={<div className="flex items-center gap-2"><YoutubeOutlined className="text-[var(--color-kitchen-error-text)]" /> 動画アップロード予約 <span className="text-xs bg-[var(--color-kitchen-gold-bg)] text-[var(--color-kitchen-gold-text)] px-2 py-0.5 rounded-full"><ExperimentOutlined /> WIP</span></div>}
            open={visible}
            onCancel={!uploading ? onClose : undefined}
            footer={[
                <Button key="cancel" disabled={uploading} onClick={onClose}>キャンセル</Button>,
                <Button key="submit" type="primary" loading={uploading} onClick={handleUpload}>
                    {uploading ? "アップロード中..." : "予約する"}
                </Button>
            ]}
            width={600}
        >
            <Form
                form={form}
                layout="vertical"
                initialValues={{
                    title: initialTitle,
                    description: initialDescription,
                    scheduledDate: dayjs().add(1, 'day').hour(19).minute(0)
                }}
            >
                <div className="mb-6">
                    <Dragger {...uploadProps} disabled={uploading} height={150}>
                        <p className="ant-upload-drag-icon">
                            <InboxOutlined />
                        </p>
                        <p className="ant-upload-text">クリックまたはドラッグ＆ドロップで動画を追加</p>
                        <p className="ant-upload-hint">
                            MP4, MOV, MKV files are supported.
                        </p>
                    </Dragger>
                </div>

                {uploading && (
                    <div className="mb-6 text-center">
                        <Spin />
                        <p className="text-xs text-[var(--md-sys-color-on-surface-variant)] mt-2">メタデータを登録中...</p>
                    </div>
                )}

                <Form.Item name="title" label="タイトル" rules={[{ required: true }]}>
                    <Input placeholder="動画のタイトル" size="large" />
                </Form.Item>

                <Form.Item name="description" label="説明">
                    <TextArea rows={4} placeholder="動画の説明文..." />
                </Form.Item>

                <Form.Item name="scheduledDate" label="公開予定日時" rules={[{ required: true }]}>
                    <DatePicker showTime format="YYYY-MM-DD HH:mm" className="w-full" size="large" />
                </Form.Item>

                <p className="text-xs text-[var(--md-sys-color-on-surface-variant)] bg-[var(--md-sys-color-surface-container-high)] p-3 rounded">
                    ※ 動画は一旦非公開(Private)としてアップロードされ、指定日時に公開設定が変更されます。<br />
                    ※ 現在はメタデータ登録のみ動作します。動画ファイルのアップロード機能は開発中です。
                </p>
            </Form>
        </Modal>
    );
}
