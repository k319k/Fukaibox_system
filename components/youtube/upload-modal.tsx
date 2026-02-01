"use client";

import { useState } from "react";
import { Modal, Upload, Input, DatePicker, Form, message, Button, Progress } from "antd";
import { InboxOutlined, YoutubeOutlined } from "@ant-design/icons";
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
    const [fileList, setFileList] = useState<any[]>([]);
    const [uploading, setUploading] = useState(false);
    const [progress, setProgress] = useState(0);

    const handleUpload = async () => {
        try {
            const values = await form.validateFields();
            if (fileList.length === 0) {
                message.error("動画ファイルを選択してください");
                return;
            }

            setUploading(true);
            const file = fileList[0].originFileObj;

            // 1. Upload to R2 (Client-side Presigned URL flow or Server Action with Stream)
            // For now, let's assume we send it to a server action that handles R2 -> YouTube
            // But realistically, large files should be chunked or sent to R2 first.

            // FIXME: Implement robust large file upload.
            // For Phase 9.3 MVP, we might send small files directly or implement R2 signed url.
            // Let's use a server action that accepts FormData for simplicity first, 
            // but Next.js Server Actions have size limits (4MB default).
            // We need R2 Presigned URL.

            // Since we already did R2 for images, we can reuse that pattern but for video.
            // However, implementing full video upload pipeline is complex.
            // Let's Stub the upload process for now or look for existing R2 helpers.

            // Actual implementation plan:
            // 1. Get Presigned URL for Video (PUT)
            // 2. Upload File to R2
            // 3. Call Server Action to trigger "R2 -> YouTube" sync (or schedule it)

            message.loading("動画をアップロード中...", 0);

            // Simulate Upload
            let p = 0;
            const interval = setInterval(() => {
                p += 10;
                setProgress(p);
                if (p >= 100) clearInterval(interval);
            }, 500);

            // Dummy Call
            await new Promise(resolve => setTimeout(resolve, 5000));

            // Register Scheduled Video
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
            setProgress(0);
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
            title={<div className="flex items-center gap-2"><YoutubeOutlined className="text-red-600" /> 動画アップロード予約</div>}
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
                    <div className="mb-6">
                        <Progress percent={progress} status="active" />
                        <p className="text-xs text-gray-500 text-center mt-1">Cloudflare R2へアップロード中...</p>
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

                <p className="text-xs text-gray-500 bg-gray-50 p-3 rounded">
                    ※ 動画は一旦非公開(Private)としてアップロードされ、指定日時に公開設定が変更されます。<br />
                    ※ 現在はアップロードシミュレーションのみ動作します。
                </p>
            </Form>
        </Modal>
    );
}
