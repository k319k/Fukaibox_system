// Home page route
// Server-side data loading with Remix loader
import type { Route } from "./+types/_index";
import { useLoaderData, Link } from "react-router";
import { Card, Button, Spin, Typography, Tag, Avatar } from "antd";
import { PlusOutlined, FileTextOutlined, UserOutlined } from "@ant-design/icons";
import { useState } from "react";
import { createDb, type Env } from "~/db/client.server";
import * as schema from "~/db/schema";
import { desc } from "drizzle-orm";
import { getSession } from "~/services/session.server";

const { Title, Text } = Typography;

// Loader: Server-side data fetching
export async function loader({ request, context }: Route.LoaderArgs) {
    // console.log("Home loader started");
    try {
        const env = context.cloudflare.env as Env;

        // Debug check for env existences
        if (!context.cloudflare || !env) {
            console.error("Cloudflare context or env is missing");
            return {
                sheets: [], topUsers: [], user: null, isLoggedIn: false, isGicho: false,
                error: "System Error: Cloudflare environment not loaded."
            };
        }

        if (!env.TURSO_DATABASE_URL) {
            console.error("Missing TURSO_DATABASE_URL");
            return {
                sheets: [], topUsers: [], user: null, isLoggedIn: false, isGicho: false,
                error: "Configuration Error: Database URL not set."
            };
        }

        const db = createDb(env);
        const session = getSession(request); // No DB access needed for session parsing if using cookie only

        // console.log("Fetching sheets...");
        const sheets = await db.query.sheets.findMany({
            with: { creator: true },
            orderBy: [desc(schema.sheets.createdAt)],
        });

        // console.log("Fetching ranking...");
        // Get top users for ranking
        const topUsers = await db.select().from(schema.users)
            .orderBy(desc(schema.users.points))
            .limit(10);

        return {
            sheets,
            topUsers,
            user: session.user,
            isLoggedIn: !!session.user,
            isGicho: session.user?.isGicho || false,
            error: null
        };
    } catch (e: any) {
        console.error("Home loader failed:", e);
        // Instead of throwing 500, return error state to display friendly message
        return {
            sheets: [],
            topUsers: [],
            user: null, // Session might be invalid if env failed
            isLoggedIn: false,
            isGicho: false,
            error: `Data Load Error: ${e.message}`
        };
    }
}

// Meta tags
export function meta() {
    return [
        { title: "封解Box - ホーム" },
        { name: "description", content: "封解Box - 共同作業プラットフォーム" },
    ];
}

// Phase configuration
const phaseConfig: Record<string, { label: string; color: string }> = {
    draft: { label: "下書き", color: "default" },
    upload: { label: "募集中", color: "success" },
    select: { label: "選定中", color: "warning" },
    complete: { label: "完了", color: "error" },
    archived: { label: "アーカイブ", color: "default" },
};

export default function Home() {
    const data = useLoaderData<typeof loader>();
    // Handle safe loader return (might have error property)
    const { sheets, topUsers, user, isLoggedIn, isGicho, error } = data as any;

    const [isModalOpen, setIsModalOpen] = useState(false);

    return (
        <div style={{ padding: "24px", maxWidth: "1400px", margin: "0 auto" }}>
            {error && (
                <div style={{ marginBottom: 24, padding: 16, background: "#fff2f0", border: "1px solid #ffccc7", borderRadius: 8, color: "#cf1322" }}>
                    <strong>エラーが発生しました:</strong> {error}
                </div>
            )}
            {/* Header Section */}
            <div style={{ marginBottom: 48 }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 32 }}>
                    <div>
                        <Title level={1} style={{ margin: 0, fontSize: "40px", fontWeight: 700, marginBottom: 8 }}>
                            シート一覧
                        </Title>
                        {isLoggedIn && user && (
                            <Text type="secondary" style={{ fontSize: "16px", display: "block", marginTop: "4px" }}>
                                ようこそ、{user.displayName || user.username} さん
                            </Text>
                        )}
                    </div>
                    {isGicho && (
                        <Button
                            type="primary"
                            size="large"
                            icon={<PlusOutlined />}
                            onClick={() => setIsModalOpen(true)}
                            style={{ height: "56px", fontSize: "16px", padding: "0 32px" }}
                        >
                            新規作成
                        </Button>
                    )}
                </div>

                {/* Stats Cards */}
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: 16 }}>
                    <Card size="small" style={{ background: "linear-gradient(135deg, #722ed1 0%, #9254de 100%)" }}>
                        <div style={{ color: "#fff" }}>
                            <FileTextOutlined style={{ fontSize: 24, marginBottom: 8 }} />
                            <div style={{ fontSize: 28, fontWeight: 700 }}>{sheets.length}</div>
                            <div>シート数</div>
                        </div>
                    </Card>
                    <Card size="small" style={{ background: "linear-gradient(135deg, #13c2c2 0%, #36cfc9 100%)" }}>
                        <div style={{ color: "#fff" }}>
                            <UserOutlined style={{ fontSize: 24, marginBottom: 8 }} />
                            <div style={{ fontSize: 28, fontWeight: 700 }}>{topUsers.length}</div>
                            <div>アクティブユーザー</div>
                        </div>
                    </Card>
                </div>
            </div>

            {/* 2-Column Layout */}
            <div style={{ display: "grid", gridTemplateColumns: isLoggedIn ? "1fr 350px" : "1fr", gap: 24, alignItems: "start" }}>
                {/* Sheets Grid */}
                <div>
                    {sheets.length === 0 ? (
                        <Card style={{ textAlign: "center", padding: 48 }}>
                            <FileTextOutlined style={{ fontSize: 48, color: "#666", marginBottom: 16 }} />
                            <Title level={4}>シートがありません</Title>
                            <Text type="secondary">まだシートが作成されていません</Text>
                        </Card>
                    ) : (
                        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))", gap: 24 }}>
                            {sheets.map((sheet: any) => (
                                <Link key={sheet.id} to={`/sheets/${sheet.id}`} style={{ textDecoration: "none" }}>
                                    <Card
                                        hoverable
                                        style={{ height: "100%" }}
                                        title={
                                            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                                                <span>{sheet.title}</span>
                                                <Tag color={phaseConfig[sheet.currentPhase]?.color || "default"}>
                                                    {phaseConfig[sheet.currentPhase]?.label || sheet.currentPhase}
                                                </Tag>
                                            </div>
                                        }
                                    >
                                        <Text type="secondary">{sheet.description || "説明なし"}</Text>
                                        <div style={{ marginTop: 16, display: "flex", alignItems: "center", gap: 8 }}>
                                            <Avatar size="small" src={sheet.creator?.avatarUrl}>
                                                {sheet.creator?.username?.[0]?.toUpperCase()}
                                            </Avatar>
                                            <Text type="secondary">{sheet.creator?.username}</Text>
                                        </div>
                                    </Card>
                                </Link>
                            ))}
                        </div>
                    )}
                </div>

                {/* Ranking Widget */}
                {isLoggedIn && (
                    <Card title="ランキング" size="small" style={{ position: "sticky", top: 24 }}>
                        {topUsers.map((u: any, index: number) => (
                            <div key={u.id} style={{ display: "flex", alignItems: "center", gap: 12, padding: "8px 0", borderBottom: "1px solid #333" }}>
                                <span style={{ width: 24, fontWeight: 700, color: index < 3 ? "#faad14" : "#666" }}>
                                    {index + 1}
                                </span>
                                <Avatar size="small" src={u.avatarUrl}>
                                    {u.username?.[0]?.toUpperCase()}
                                </Avatar>
                                <span style={{ flex: 1 }}>{u.displayName || u.username}</span>
                                <span style={{ color: "#722ed1", fontWeight: 600 }}>{u.points} pt</span>
                            </div>
                        ))}
                    </Card>
                )}
            </div>

            {/* Login prompt for non-logged in users */}
            {!isLoggedIn && (
                <Card style={{ marginTop: 24, textAlign: "center", padding: 24 }}>
                    <Title level={4}>ログインしてフル機能を利用</Title>
                    <Text type="secondary" style={{ display: "block", marginBottom: 16 }}>
                        Discordアカウントでログインすると、シートの作成や画像のアップロードができます
                    </Text>
                    <Link to="/auth/discord/login">
                        <Button type="primary" size="large">
                            Discordでログイン
                        </Button>
                    </Link>
                </Card>
            )}
        </div>
    );
}
