"use client";

import { useEffect, useState } from "react";
import { getAllUsersWithStatus } from "@/app/actions/user";
import { Card, CardBody, Avatar, Chip, Spinner } from "@heroui/react";
import { Icon } from "@iconify/react";

interface User {
    id: string;
    name: string | null;
    image: string | null;
    isOnline: boolean;
    discordUsername: string | null;
    role: string;
}

export default function UsersPage() {
    const [users, setUsers] = useState<User[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchUsers = async () => {
            try {
                const data = await getAllUsersWithStatus();
                setUsers(data);
            } catch (error) {
                console.error("Failed to fetch users:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchUsers();
        // 30秒ごとに更新
        const interval = setInterval(fetchUsers, 30000);
        return () => clearInterval(interval);
    }, []);

    if (loading) {
        return (
            <div className="flex justify-center items-center h-[calc(100vh-200px)]">
                <Spinner size="lg" color="danger" />
            </div>
        );
    }

    return (
        <div className="p-6 md:p-8 max-w-7xl mx-auto">
            <div className="flex items-center gap-3 mb-8">
                <Icon icon="solar:users-group-rounded-bold" className="text-3xl text-primary" />
                <h1 className="text-2xl font-bold font-m3-display text-default-900">儀員名簿</h1>
                <Chip size="sm" variant="flat" color="primary">
                    {users.length}名
                </Chip>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {users.map((user) => (
                    <Card key={user.id} className="border border-default-200 shadow-sm hover:shadow-md transition-shadow">
                        <CardBody className="flex flex-row items-center gap-4 p-4">
                            <div className="relative">
                                <Avatar
                                    src={user.image || undefined}
                                    name={user.discordUsername?.[0] || user.name?.[0] || "?"}
                                    size="lg"
                                    isBordered
                                    color={user.role === "admin" ? "danger" : "default"}
                                />
                                <span
                                    className={`absolute bottom-0 right-0 w-3.5 h-3.5 rounded-full border-2 border-background ${user.isOnline ? "bg-success" : "bg-default-400"
                                        }`}
                                />
                            </div>
                            <div className="flex flex-col min-w-0">
                                <span className="font-bold text-default-900 truncate">
                                    {user.discordUsername || user.name || "Unknown"}
                                </span>
                                <div className="flex items-center gap-1 text-tiny text-default-500">
                                    <Icon
                                        icon={user.role === "admin" ? "solar:shield-star-bold" : "solar:user-bold"}
                                        className={user.role === "admin" ? "text-danger" : ""}
                                    />
                                    <span className="capitalize">{user.role}</span>
                                </div>
                            </div>
                        </CardBody>
                    </Card>
                ))}
            </div>
        </div>
    );
}
