// Tools listing page
import type { Route } from "./+types/tools._index";
import { useLoaderData, Link } from "react-router";
import { Card, Button, Tag, Avatar, Typography, Empty } from "antd";
import { PlusOutlined, EyeOutlined, HeartOutlined } from "@ant-design/icons";
import { createDb, type Env } from "~/db/client.server";
import * as schema from "~/db/schema";
import { eq, desc, and } from "drizzle-orm";
import { getSession } from "~/services/session.server";

const { Title, Text } = Typography;

export async function loader({ request, context }: Route.LoaderArgs) {
    const env = context.cloudflare.env as Env;
    const db = createDb(env);
    const session = getSession(request);

    const projects = await db.query.toolProjects.findMany({
        where: and(
            eq(schema.toolProjects.isPublic, true),
            eq(schema.toolProjects.isDeleted, false)
        ),
        with: { owner: true },
        orderBy: [desc(schema.toolProjects.createdAt)],
    });

    return {
        projects,
        user: session.user,
        isLoggedIn: !!session.user,
    };
}

export function meta() {
    return [
        { title: "Tools - 封解Box" },
        { name: "description", content: "共有ツール一覧" },
    ];
}

export default function ToolsIndex() {
    const { projects, user, isLoggedIn } = useLoaderData<typeof loader>();

    return (
        <div style={{ padding: "24px", maxWidth: "1400px", margin: "0 auto" }}>
            {/* Header */}
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 32 }}>
                <div>
                    <Title level={1} style={{ margin: 0 }}>
                        Tools
                    </Title>
                    <Text type="secondary">共有ツール一覧</Text>
                </div>
                {isLoggedIn && (
                    <Link to="/tools/new">
                        <Button type="primary" icon={<PlusOutlined />} size="large">
                            新規作成
                        </Button>
                    </Link>
                )}
            </div>

            {/* Projects Grid */}
            {projects.length === 0 ? (
                <Card>
                    <Empty description="ツールがありません" />
                </Card>
            ) : (
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))", gap: 24 }}>
                    {projects.map((project: any) => (
                        <Link key={project.id} to={`/tools/${project.id}`} style={{ textDecoration: "none" }}>
                            <Card
                                hoverable
                                style={{ height: "100%" }}
                                title={
                                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                                        <span>{project.name}</span>
                                        <Tag color={project.projectType === "sandbox" ? "purple" : "blue"}>
                                            {project.projectType}
                                        </Tag>
                                    </div>
                                }
                            >
                                <Text type="secondary" style={{ display: "block", marginBottom: 16 }}>
                                    {project.description || "説明なし"}
                                </Text>
                                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                                    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                                        <Avatar size="small" src={project.owner?.avatarUrl}>
                                            {project.owner?.username?.[0]?.toUpperCase()}
                                        </Avatar>
                                        <Text type="secondary">{project.owner?.username}</Text>
                                    </div>
                                    <div style={{ display: "flex", gap: 16, color: "#666" }}>
                                        <span><EyeOutlined /> {project.viewCount || 0}</span>
                                        <span><HeartOutlined /> {project.voteCount || 0}</span>
                                    </div>
                                </div>
                            </Card>
                        </Link>
                    ))}
                </div>
            )}
        </div>
    );
}
