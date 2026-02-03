"use client";

import { useState } from "react";
import { Card, Table, Modal, Form, Input, DatePicker, message as antdMessage, Popconfirm, Tag } from "antd";
import { PlusOutlined, EditOutlined, DeleteOutlined } from "@ant-design/icons";
import { M3Button } from "@/components/ui/m3-button";
import {
    scheduleVideoUpload,
    updateScheduledVideo,
    deleteScheduledVideo,
} from "@/app/actions/youtube-manager";
import dayjs from "dayjs";

interface SchedulePanelProps {
    initialVideos: any[];
    onUpdate: (videos: any[]) => void;
}

export function SchedulePanel({ initialVideos, onUpdate }: SchedulePanelProps) {
    const [videos, setVideos] = useState(initialVideos);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingVideo, setEditingVideo] = useState<any>(null);
    const [loading, setLoading] = useState(false);
    const [form] = Form.useForm();

    const handleCreate = () => {
        setEditingVideo(null);
        form.resetFields();
        setIsModalOpen(true);
    };

    const handleEdit = (video: any) => {
        setEditingVideo(video);
        form.setFieldsValue({
            title: video.title,
            description: video.description,
            scheduledDate: dayjs(video.scheduledDate),
        });
        setIsModalOpen(true);
    };

    const handleSubmit = async (values: any) => {
        setLoading(true);
        try {
            if (editingVideo) {
                // 更新
                const result = await updateScheduledVideo(editingVideo.id, values.scheduledDate.toDate());
                if (result.success) {
                    antdMessage.success("予約を更新しました");
                    window.location.reload(); // 再読み込みして最新を表示
                } else {
                    antdMessage.error(result.error || "更新に失敗しました");
                }
            } else {
                // 新規作成
                const result = await scheduleVideoUpload({
                    title: values.title,
                    description: values.description,
                    scheduledDate: values.scheduledDate.toDate(),
                });
                if (result.success) {
                    antdMessage.success("予約を作成しました");
                    window.location.reload();
                } else {
                    antdMessage.error(result.error || "作成に失敗しました");
                }
            }
            setIsModalOpen(false);
        } catch (error: any) {
            antdMessage.error(error.message);
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (videoId: string) => {
        const result = await deleteScheduledVideo(videoId);
        if (result.success) {
            antdMessage.success("予約を削除しました");
            setVideos(videos.filter(v => v.id !== videoId));
            onUpdate(videos.filter(v => v.id !== videoId));
        } else {
            antdMessage.error(result.error || "削除に失敗しました");
        }
    };

    const columns = [
        {
            title: "タイトル",
            dataIndex: "title",
            key: "title",
            ellipsis: true,
        },
        {
            title: "予約日",
            dataIndex: "scheduledDate",
            key: "scheduledDate",
            render: (date: Date) => dayjs(date).format("YYYY年MM月DD日"),
            sorter: (a: any, b: any) => new Date(a.scheduledDate).getTime() - new Date(b.scheduledDate).getTime(),
        },
        {
            title: "ステータス",
            dataIndex: "status",
            key: "status",
            render: (status: string) => {
                const statusMap: Record<string, { color: string; label: string }> = {
                    pending: { color: "default", label: "待機中" },
                    uploaded: { color: "processing", label: "アップロード済" },
                    published: { color: "success", label: "公開済" },
                    failed: { color: "error", label: "失敗" },
                };
                const config = statusMap[status] || statusMap.pending;
                return <Tag color={config.color}>{config.label}</Tag>;
            },
        },
        {
            title: "操作",
            key: "actions",
            render: (_: any, record: any) => (
                <div className="flex gap-2">
                    <M3Button
                        variant="text"
                        icon={<EditOutlined />}
                        onClick={() => handleEdit(record)}
                        className="text-xs"
                    >
                        編集
                    </M3Button>
                    <Popconfirm
                        title="この予約を削除しますか"
                        onConfirm={() => handleDelete(record.id)}
                        okText="削除"
                        cancelText="キャンセル"
                    >
                        <M3Button
                            variant="text"
                            icon={<DeleteOutlined />}
                            className="text-xs text-[var(--md-sys-color-error)]"
                        >
                            削除
                        </M3Button>
                    </Popconfirm>
                </div>
            ),
        },
    ];

    return (
        <div className="p-6">
            <div className="mb-4 flex justify-between items-center">
                <h3 className="text-[var(--md-sys-color-on-surface)] text-lg">予約リスト</h3>
                <M3Button
                    variant="filled"
                    icon={<PlusOutlined />}
                    onClick={handleCreate}
                >
                    新規予約
                </M3Button>
            </div>

            <Card
                className="shadow-sm"
                style={{
                    backgroundColor: "var(--md-sys-color-surface-container-lowest)",
                    borderColor: "var(--md-sys-color-outline-variant)",
                }}
            >
                <Table
                    dataSource={videos}
                    columns={columns}
                    rowKey="id"
                    pagination={{ pageSize: 10 }}
                    locale={{ emptyText: "予約がありません" }}
                />
            </Card>

            <Modal
                title={editingVideo ? "予約を編集" : "新規予約"}
                open={isModalOpen}
                onCancel={() => setIsModalOpen(false)}
                footer={null}
            >
                <Form
                    form={form}
                    layout="vertical"
                    onFinish={handleSubmit}
                >
                    <Form.Item
                        name="title"
                        label="タイトル"
                        rules={[{ required: true, message: "タイトルを入力してください" }]}
                    >
                        <Input placeholder="動画のタイトル" disabled={!!editingVideo} />
                    </Form.Item>

                    <Form.Item
                        name="description"
                        label="説明"
                    >
                        <Input.TextArea rows={4} placeholder="動画の説明" disabled={!!editingVideo} />
                    </Form.Item>

                    <Form.Item
                        name="scheduledDate"
                        label="予約日"
                        rules={[{ required: true, message: "予約日を選択してください" }]}
                    >
                        <DatePicker className="w-full" />
                    </Form.Item>

                    <Form.Item className="mb-0 mt-6">
                        <div className="flex justify-end gap-2">
                            <M3Button variant="outlined" onClick={() => setIsModalOpen(false)}>
                                キャンセル
                            </M3Button>
                            <M3Button variant="filled" onClick={() => form.submit()} disabled={loading}>
                                {loading ? "保存中..." : "保存"}
                            </M3Button>
                        </div>
                    </Form.Item>
                </Form>
            </Modal>
        </div>
    );
}
