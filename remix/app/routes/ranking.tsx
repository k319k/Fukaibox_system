// Ranking page - Display user rankings by points
import type { Route } from "./+types/ranking";
import { useLoaderData } from "react-router";
import { Card, Table, Avatar, Tag, Typography } from "antd";
import { TrophyOutlined, CrownOutlined, FireOutlined, UserOutlined } from "@ant-design/icons";
import { createDb, type Env } from "~/db/client.server";
import * as schema from "~/db/schema";
import { desc } from "drizzle-orm";
import { getSession } from "~/services/session.server";

const { Title, Text } = Typography;

export async function loader({ request, context }: Route.LoaderArgs) {
    const env = context.cloudflare.env as Env;
    const db = createDb(env);
    const session = getSession(request);

    const users = await db
        .select()
        .from(schema.users)
        .orderBy(desc(schema.users.points))
        .limit(100);

    // Add rank to each user
    const rankings = users.map((user, index) => ({
        ...user,
        rank: index + 1,
    }));

    return {
        rankings,
        user: session.user,
        isLoggedIn: !!session.user,
    };
}

export function meta() {
    return [
        { title: "ランキング - 封解Box" },
        { name: "description", content: "貢献ランキング" },
    ];
}

export default function Ranking() {
    const { rankings } = useLoaderData<typeof loader>();

    const columns = [
        {
            title: "順位",
            dataIndex: "rank",
            key: "rank",
            width: 100,
            align: "center" as const,
            render: (rank: number) => {
                if (rank === 1) {
                    return (
                        <div style={{ color: "#FFD700", fontSize: 24 }}>
                            <CrownOutlined />
                        </div>
                    );
                }
                if (rank <= 3) {
                    return (
                        <span
                            style={{
                                color: rank === 2 ? "#C0C0C0" : "#CD7F32",
                                fontSize: 20,
                                fontWeight: "bold",
                            }}
                        >
                            {rank}
                        </span>
                    );
                }
                return <span style={{ fontSize: 16, color: "#666" }}>{rank}</span>;
            },
        },
        {
            title: "ユーザー",
            key: "user",
            render: (_: unknown, record: any) => (
                <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                    <Avatar
                        size={record.rank <= 3 ? 56 : 40}
                        src={record.avatarUrl}
                        style={{
                            border:
                                record.rank === 1
                                    ? "3px solid #FFD700"
                                    : record.rank === 2
                                        ? "3px solid #C0C0C0"
                                        : record.rank === 3
                                            ? "3px solid #CD7F32"
                                            : "2px solid #424242",
                        }}
                    >
                        {(record.displayName || record.username)?.[0]?.toUpperCase()}
                    </Avatar>
                    <div>
                        <div
                            style={{
                                fontWeight: record.rank <= 3 ? 700 : 500,
                                fontSize: record.rank <= 3 ? 18 : 14,
                                color:
                                    record.rank === 1
                                        ? "#FFD700"
                                        : record.rank === 2
                                            ? "#C0C0C0"
                                            : record.rank === 3
                                                ? "#CD7F32"
                                                : "#fff",
                            }}
                        >
                            {record.displayName || record.username}
                        </div>
                        {record.rank <= 3 && (
                            <Tag icon={<FireOutlined />} color={record.rank === 1 ? "gold" : record.rank === 2 ? "default" : "orange"}>
                                TOP {record.rank}
                            </Tag>
                        )}
                    </div>
                </div>
            ),
        },
        {
            title: "貢献点数",
            dataIndex: "points",
            key: "points",
            align: "right" as const,
            width: 200,
            render: (points: number, record: any) => (
                <div style={{ textAlign: "right" }}>
                    <div style={{ display: "flex", alignItems: "center", justifyContent: "flex-end", gap: 8 }}>
                        <FireOutlined
                            style={{
                                color: record.rank === 1 ? "#FFD700" : record.rank === 2 ? "#C0C0C0" : record.rank === 3 ? "#CD7F32" : "#722ed1",
                                fontSize: record.rank <= 3 ? 20 : 16,
                            }}
                        />
                        <span
                            style={{
                                fontSize: record.rank <= 3 ? 28 : 20,
                                fontWeight: "bold",
                                color: record.rank === 1 ? "#FFD700" : record.rank === 2 ? "#C0C0C0" : record.rank === 3 ? "#CD7F32" : "#722ed1",
                            }}
                        >
                            {(points || 0).toLocaleString()}
                        </span>
                    </div>
                    <Text type="secondary" style={{ fontSize: 12 }}>
                        POINTS
                    </Text>
                </div>
            ),
        },
    ];

    return (
        <div style={{ padding: "24px", maxWidth: "1000px", margin: "0 auto" }}>
            {/* Header */}
            <div style={{ marginBottom: 32 }}>
                <Title level={1} style={{ display: "flex", alignItems: "center", gap: 16, margin: 0 }}>
                    <TrophyOutlined style={{ fontSize: 48, color: "#FFD700" }} />
                    <span style={{ color: "#FFD700" }}>点数ランキング</span>
                </Title>
                <Text type="secondary" style={{ fontSize: 16, marginLeft: 64 }}>
                    儀員の貢献度をリアルタイムで確認
                </Text>
                <div style={{ float: "right", textAlign: "right" }}>
                    <Text type="secondary" style={{ fontSize: 12 }}>総参加者数</Text>
                    <div style={{ fontSize: 32, fontWeight: "bold", color: "#FFD700" }}>{rankings.length}</div>
                </div>
            </div>

            {/* Ranking Table */}
            <Card
                title={
                    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                        <UserOutlined />
                        <span>ユーザー一覧</span>
                    </div>
                }
            >
                <Table
                    columns={columns}
                    dataSource={rankings}
                    rowKey="id"
                    pagination={{
                        pageSize: 20,
                        showSizeChanger: false,
                        showTotal: (total) => `全 ${total} 名`,
                    }}
                />
            </Card>
        </div>
    );
}
