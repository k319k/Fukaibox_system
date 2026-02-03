"use client";

import { Avatar } from "antd";
import { Icon } from "@iconify/react";
import { UploadedImage } from "@/types/kitchen";
import { PresenceUser } from "@/hooks/kitchen/usePresence";

interface ActiveUsersListProps {
    activeUsers: PresenceUser[];
    images: UploadedImage[];
    uploaderNames: Record<string, string>;
}

export default function ActiveUsersList({ activeUsers, images, uploaderNames }: ActiveUsersListProps) {
    const allUserIds = new Set([
        ...activeUsers.map(u => u.userId),
        ...images.map(i => i.uploadedBy)
    ]);

    const sortedUsers = Array.from(allUserIds).map(userId => {
        const userImages = images.filter(img => img.uploadedBy === userId);
        const user = activeUsers.find(u => u.userId === userId);
        const isActive = !!user;
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
        if (b.uploadCount !== a.uploadCount) return b.uploadCount - a.uploadCount;
        if (b.isActive !== a.isActive) return b.isActive ? 1 : -1;
        return a.userName.localeCompare(b.userName);
    });

    return (
        <div className="flex gap-2 items-center overflow-x-auto pb-2 w-full md:w-auto">
            {sortedUsers.map(user => (
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
            ))}
        </div>
    );
}
