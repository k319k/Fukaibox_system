// Admin Panel - User management and settings (GICHO only)
import type { Route } from "./+types/admin";
import { useLoaderData, useSearchParams, useFetcher } from "react-router";
import { Tabs, Card, Typography, Table, Avatar, Tag, Button, Modal, InputNumber, Switch, Input } from "antd";
import { SettingOutlined, TeamOutlined, EditOutlined } from "@ant-design/icons";
import { useState } from "react";
import { createDb, type Env } from "~/db/client.server";
import * as schema from "~/db/schema";
import { desc, eq, sql } from "drizzle-orm";
import { getSession, requireGicho } from "~/services/session.server";

const { Title, Text } = Typography;

export async function loader({ request, context }: Route.LoaderArgs) {
    const env = context.cloudflare.env as Env;
    const session = getSession(request);

    if (!session.user?.isGicho) {
        return { users: [], settings: null, isGicho: false, user: session.user };
    }

    const db = createDb(env);

    // Fetch users
    const users = await db.select().from(schema.users).orderBy(desc(schema.users.points));

    // Fetch settings
    const allSettings = await db.select().from(schema.rewardSettings);
    const settingsObj = allSettings.reduce(
        (acc, s) => {
            acc[s.settingKey] = s.settingValue ?? 0;
            return acc;
        },
        {} as Record<string, number>
    );

    return { users, settings: settingsObj, isGicho: true, user: session.user };
}

export async function action({ request, context }: Route.ActionArgs) {
    const env = context.cloudflare.env as Env;
    requireGicho(request);
    const db = createDb(env);
    const formData = await request.formData();
    const action = formData.get("_action");

    if (action === "updateUser") {
        const userId = Number(formData.get("userId"));
        const points = Number(formData.get("points"));
        const isBlocked = formData.get("isBlocked") === "true";
        const isGicho = formData.get("isGicho") === "true";

        // Get current user to calculate point diff
        const currentUser = await db.query.users.findFirst({
            where: eq(schema.users.id, userId),
        });

        if (currentUser) {
            const diff = points - (currentUser.points ?? 0);
            if (diff !== 0) {
                await db.update(schema.users)
                    .set({ points: sql`${schema.users.points} + ${diff}` })
                    .where(eq(schema.users.id, userId));

                await db.insert(schema.pointHistory).values({
                    userId,
                    pointsChange: diff,
                    reason: "Admin edit",
                });
            }
        }

        await db.update(schema.users)
            .set({ isBlocked, isGicho })
            .where(eq(schema.users.id, userId));

        return { success: true };
    }

    if (action === "updateSettings") {
        const upload_points = Number(formData.get("upload_points"));
        const adoption_points = Number(formData.get("adoption_points"));

        for (const [key, value] of Object.entries({ upload_points, adoption_points })) {
            await db
                .insert(schema.rewardSettings)
                .values({ settingKey: key, settingValue: value })
                .onConflictDoUpdate({
                    target: schema.rewardSettings.settingKey,
                    set: { settingValue: value },
                });
        }

        return { success: true };
    }

    return { error: "Unknown action" };
}

export function meta() {
    return [{ title: "管理パネル - 封解Box" }];
}

export default function AdminPanel() {
    const { users, settings, isGicho, user } = useLoaderData<typeof loader>();
    const [searchParams, setSearchParams] = useSearchParams();
    const activeTab = searchParams.get("tab") || "users";
    const fetcher = useFetcher();

    const [editUser, setEditUser] = useState<any>(null);
    const [editPoints, setEditPoints] = useState(0);
    const [editBlocked, setEditBlocked] = useState(false);
    const [editGicho, setEditGicho] = useState(false);

    const handleTabChange = (key: string) => {
        setSearchParams({ tab: key });
    };

    if (!isGicho) {
        return (
            <div style={{ maxWidth: 1400, margin: "0 auto", padding: 24 }}>
                <Card>
                    <Text type="secondary">儀長のみアクセス可能です</Text>
                </Card>
            </div>
        );
    }

    const openEditModal = (record: any) => {
        setEditUser(record);
        setEditPoints(record.points ?? 0);
        setEditBlocked(record.isBlocked ?? false);
        setEditGicho(record.isGicho ?? false);
    };

    const handleSaveUser = () => {
        fetcher.submit(
            {
                _action: "updateUser",
                userId: editUser.id.toString(),
                points: editPoints.toString(),
                isBlocked: editBlocked.toString(),
                isGicho: editGicho.toString(),
            },
            { method: "POST" }
        );
        setEditUser(null);
    };

    const userColumns = [
        {
            title: "ユーザー",
            key: "user",
            render: (_: unknown, record: any) => (
                <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                    <Avatar src={record.avatarUrl}>{record.username?.[0]?.toUpperCase()}</Avatar>
                    <div>
                        <div style={{ fontWeight: 500 }}>{record.displayName || record.username}</div>
                        <Text type="secondary" style={{ fontSize: 12 }}>@{record.username}</Text>
                    </div>
                </div>
            ),
        },
        { title: "Points", dataIndex: "points", key: "points", render: (p: number) => <span style={{ color: "#722ed1", fontWeight: 600 }}>{p ?? 0}</span> },
        {
            title: "Status",
            key: "status",
            render: (_: unknown, record: any) => (
                <>
                    {record.isGicho && <Tag color="gold">儀長</Tag>}
                    {record.isBlocked && <Tag color="red">ブロック</Tag>}
                </>
            ),
        },
        {
            title: "Actions",
            key: "actions",
            render: (_: unknown, record: any) => (
                <Button icon={<EditOutlined />} onClick={() => openEditModal(record)}>
                    編集
                </Button>
            ),
        },
    ];

    const tabItems = [
        {
            key: "users",
            label: <span><TeamOutlined /> ユーザー管理</span>,
            children: (
                <Table
                    dataSource={users}
                    columns={userColumns}
                    rowKey="id"
                    pagination={{ pageSize: 20 }}
                />
            ),
        },
        {
            key: "settings",
            label: <span><SettingOutlined /> 報酬設定</span>,
            children: (
                <Card style={{ maxWidth: 500 }}>
                    <Text>報酬設定は /settings ページで管理できます</Text>
                </Card>
            ),
        },
    ];

    return (
        <div style={{ maxWidth: 1400, margin: "0 auto", padding: 24 }}>
            <Title level={2} style={{ marginBottom: 24 }}>管理パネル</Title>

            <Tabs activeKey={activeTab} onChange={handleTabChange} items={tabItems} size="large" />

            <Modal
                title="ユーザー編集"
                open={!!editUser}
                onCancel={() => setEditUser(null)}
                onOk={handleSaveUser}
                confirmLoading={fetcher.state === "submitting"}
            >
                {editUser && (
                    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                        <div>
                            <Text strong>ユーザー:</Text> {editUser.displayName || editUser.username}
                        </div>
                        <div>
                            <Text strong>Points:</Text>
                            <InputNumber value={editPoints} onChange={(v) => setEditPoints(v ?? 0)} style={{ width: 150, marginLeft: 8 }} />
                        </div>
                        <div>
                            <Text strong>儀長:</Text>
                            <Switch checked={editGicho} onChange={setEditGicho} style={{ marginLeft: 8 }} />
                        </div>
                        <div>
                            <Text strong>ブロック:</Text>
                            <Switch checked={editBlocked} onChange={setEditBlocked} style={{ marginLeft: 8 }} />
                        </div>
                    </div>
                )}
            </Modal>
        </div>
    );
}
