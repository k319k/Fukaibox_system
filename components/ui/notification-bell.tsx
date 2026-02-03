"use client";

import { useEffect, useState } from "react";
import { Badge, Popover, List, Button, Typography, Empty, Avatar } from "antd";
import { BellOutlined, CheckOutlined, InfoCircleOutlined, CheckCircleOutlined, WarningOutlined, CloseCircleOutlined } from "@ant-design/icons";
import { getNotificationsAction, markAsReadAction, markAllAsReadAction } from "@/app/actions/notifications";
import Link from "next/link";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import "dayjs/locale/ja";

dayjs.extend(relativeTime);
dayjs.locale("ja");

export default function NotificationBell() {
    const [notifications, setNotifications] = useState<any[]>([]);
    const [unreadCount, setUnreadCount] = useState(0);
    const [loading, setLoading] = useState(false);
    const [open, setOpen] = useState(false);

    const fetchNotifications = async () => {
        setLoading(true);
        const res = await getNotificationsAction();
        if (res.success && res.data) {
            setNotifications(res.data);
            setUnreadCount(res.data.filter((n: any) => !n.isRead).length);
        }
        setLoading(false);
    };

    useEffect(() => {
        fetchNotifications();
        const interval = setInterval(fetchNotifications, 60000); // Poll every minute
        return () => clearInterval(interval);
    }, []);

    const handleMarkAsRead = async (id: string) => {
        // Optimistic update
        setNotifications(prev => prev.map(n => n.id === id ? { ...n, isRead: true } : n));
        setUnreadCount(prev => Math.max(0, prev - 1));
        await markAsReadAction(id);
    };

    const handleMarkAllAsRead = async () => {
        setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
        setUnreadCount(0);
        await markAllAsReadAction();
    };

    const getIcon = (type: string) => {
        switch (type) {
            case "success": return <CheckCircleOutlined className="text-green-500" />;
            case "warning": return <WarningOutlined className="text-orange-500" />;
            case "error": return <CloseCircleOutlined className="text-red-500" />;
            default: return <InfoCircleOutlined className="text-blue-500" />;
        }
    };

    const content = (
        <div className="w-[350px] max-h-[400px] overflow-y-auto">
            <div className="flex justify-between items-center mb-2 px-2">
                <Typography.Text strong>通知</Typography.Text>
                {unreadCount > 0 && (
                    <Button type="link" size="small" onClick={handleMarkAllAsRead} icon={<CheckOutlined />}>
                        すべて既読
                    </Button>
                )}
            </div>
            {notifications.length > 0 ? (
                <List
                    itemLayout="horizontal"
                    dataSource={notifications}
                    renderItem={(item) => (
                        <List.Item
                            className={`px-2 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors ${!item.isRead ? 'bg-blue-50/50 dark:bg-blue-900/10' : ''}`}
                            actions={[
                                !item.isRead && (
                                    <Button
                                        type="text"
                                        size="small"
                                        icon={<CheckCircleOutlined />}
                                        onClick={() => handleMarkAsRead(item.id)}
                                        title="既読にする"
                                    />
                                )
                            ]}
                        >
                            <List.Item.Meta
                                avatar={<Avatar icon={getIcon(item.type)} style={{ backgroundColor: 'transparent' }} />}
                                title={
                                    <div className="flex justify-between items-start">
                                        <span className={`text-sm ${!item.isRead ? 'font-bold' : ''}`}>
                                            {item.link ? (
                                                <Link href={item.link} onClick={() => !item.isRead && handleMarkAsRead(item.id)}>
                                                    {item.title}
                                                </Link>
                                            ) : item.title}
                                        </span>
                                    </div>
                                }
                                description={
                                    <div className="flex flex-col gap-1">
                                        <span className="text-xs text-gray-500">{item.message}</span>
                                        <span className="text-[10px] text-gray-400">{dayjs(item.createdAt).fromNow()}</span>
                                    </div>
                                }
                            />
                        </List.Item>
                    )}
                />
            ) : (
                <Empty description="通知はありません" image={Empty.PRESENTED_IMAGE_SIMPLE} />
            )}
        </div>
    );

    return (
        <Popover
            content={content}
            title={null}
            trigger="click"
            open={open}
            onOpenChange={setOpen}
            placement="bottomRight"
            overlayClassName="notification-popover"
        >
            <Badge count={unreadCount} size="small">
                <Button type="text" shape="circle" icon={<BellOutlined style={{ fontSize: '18px' }} />} />
            </Badge>
        </Popover>
    );
}
