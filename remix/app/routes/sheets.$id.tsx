// Sheet detail page
// Server-side data loading for sheet with sections and images
import type { Route } from "./+types/sheets.$id";
import { useLoaderData, Link, useFetcher } from "react-router";
import { Tabs, Tag, Button, Typography, Spin, Card } from "antd";
import { ArrowLeftOutlined } from "@ant-design/icons";
import { useState } from "react";
import { createDb, type Env } from "~/db/client.server";
import * as schema from "~/db/schema";
import { eq } from "drizzle-orm";
import { getSession } from "~/services/session.server";

const { Title, Text } = Typography;

// Loader: Get sheet with sections and images
export async function loader({ params, request, context }: Route.LoaderArgs) {
    const env = context.cloudflare.env as Env;
    const db = createDb(env);
    const session = getSession(request);
    const id = parseInt(params.id);

    const sheet = await db.query.sheets.findFirst({
        where: eq(schema.sheets.id, id),
        with: {
            creator: true,
            sections: { orderBy: [schema.scriptSections.orderIndex] },
            images: { with: { uploader: true } },
        },
    });

    if (!sheet) {
        throw new Response("Sheet not found", { status: 404 });
    }

    return {
        sheet,
        user: session.user,
        isLoggedIn: !!session.user,
        isGicho: session.user?.isGicho || false,
    };
}

// Meta tags
export function meta({ data }: Route.MetaArgs) {
    const title = data?.sheet?.title || "シート詳細";
    return [
        { title: `${title} - 封解Box` },
        { name: "description", content: `シート: ${title}` },
    ];
}

// Action: Update phase
export async function action({ request, params, context }: Route.ActionArgs) {
    const env = context.cloudflare.env as Env;
    const db = createDb(env);
    const id = parseInt(params.id);
    const formData = await request.formData();
    const phase = formData.get("phase") as string;

    await db
        .update(schema.sheets)
        .set({ currentPhase: phase, updatedAt: new Date().toISOString() })
        .where(eq(schema.sheets.id, id));

    return { success: true };
}

const phaseLabels: Record<string, { label: string; color: string; next: string | null }> = {
    draft: { label: "下書き", color: "default", next: "upload" },
    upload: { label: "募集中", color: "success", next: "select" },
    select: { label: "選定中", color: "warning", next: "complete" },
    complete: { label: "完了", color: "error", next: "archived" },
    archived: { label: "アーカイブ", color: "default", next: null },
};

export default function SheetDetail() {
    const { sheet, user, isLoggedIn, isGicho } = useLoaderData<typeof loader>();
    const [activeTab, setActiveTab] = useState("script");
    const fetcher = useFetcher();

    const currentPhase = phaseLabels[sheet.currentPhase ?? "draft"] || phaseLabels.draft;

    const handlePhaseChange = (nextPhase: string) => {
        fetcher.submit({ phase: nextPhase }, { method: "POST" });
    };

    const tabItems = [
        {
            key: "script",
            label: "推敲",
            children: (
                <div style={{ padding: 24 }}>
                    <Title level={4}>セクション一覧</Title>
                    {sheet.sections.length === 0 ? (
                        <Text type="secondary">セクションがありません</Text>
                    ) : (
                        sheet.sections.map((section: any, index: number) => (
                            <Card key={section.id} size="small" style={{ marginBottom: 16 }}>
                                <Text strong>セクション {index + 1}</Text>
                                <div style={{ marginTop: 8, whiteSpace: "pre-wrap" }}>
                                    {section.content || "内容なし"}
                                </div>
                                {section.imageInstruction && (
                                    <div style={{ marginTop: 8, color: "#666" }}>
                                        <Text type="secondary">画像指示: {section.imageInstruction}</Text>
                                    </div>
                                )}
                            </Card>
                        ))
                    )}
                </div>
            ),
        },
        {
            key: "upload",
            label: "画像アップロード",
            children: (
                <div style={{ padding: 24, textAlign: "center" }}>
                    <Text type="secondary">画像アップロード機能（移行中）</Text>
                </div>
            ),
        },
        {
            key: "selection",
            label: "画像採用",
            children: (
                <div style={{ padding: 24 }}>
                    <Title level={4}>アップロード画像</Title>
                    {sheet.images.length === 0 ? (
                        <Text type="secondary">画像がありません</Text>
                    ) : (
                        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))", gap: 16 }}>
                            {sheet.images.map((img: any) => (
                                <Card key={img.id} size="small" cover={<img src={img.imageUrl} alt="" style={{ maxHeight: 200, objectFit: "cover" }} />}>
                                    <Text type="secondary">{img.uploader?.username}</Text>
                                </Card>
                            ))}
                        </div>
                    )}
                </div>
            ),
        },
        {
            key: "download",
            label: "ダウンロード",
            children: (
                <div style={{ padding: 24, textAlign: "center" }}>
                    <Text type="secondary">ダウンロード機能（移行中）</Text>
                </div>
            ),
        },
    ];

    return (
        <div style={{ padding: "24px", maxWidth: "1400px", margin: "0 auto" }}>
            {/* Header */}
            <div style={{ marginBottom: 32 }}>
                <Link to="/" style={{ color: "#722ed1", fontSize: "14px", marginBottom: 8, display: "inline-flex", alignItems: "center", gap: 4 }}>
                    <ArrowLeftOutlined /> ホームに戻る
                </Link>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "start", marginTop: 8 }}>
                    <div>
                        <Title level={1} style={{ margin: 0, fontSize: "32px" }}>
                            {sheet.title}
                        </Title>
                        <div style={{ display: "flex", gap: 8, marginTop: 12 }}>
                            <Tag color={currentPhase.color}>{currentPhase.label}</Tag>
                            {sheet.isGiinOnly && <Tag>儀員限定</Tag>}
                        </div>
                        {sheet.description && (
                            <Text type="secondary" style={{ display: "block", marginTop: 8 }}>
                                {sheet.description}
                            </Text>
                        )}
                    </div>
                    {isGicho && currentPhase.next && (
                        <Button
                            type="primary"
                            size="large"
                            loading={fetcher.state === "submitting"}
                            onClick={() => handlePhaseChange(currentPhase.next!)}
                        >
                            次のフェーズへ
                        </Button>
                    )}
                </div>
            </div>

            {/* Tabs */}
            <Tabs
                activeKey={activeTab}
                onChange={setActiveTab}
                items={tabItems}
                size="large"
                style={{
                    background: "#1f1f1f",
                    borderRadius: 12,
                    padding: "0 24px",
                }}
            />
        </div>
    );
}
