// Settings page - Reward configuration (GICHO only)
import type { Route } from "./+types/settings";
import { useLoaderData, useFetcher, redirect } from "react-router";
import { Card, Form, InputNumber, Button, Typography, message } from "antd";
import { SettingOutlined } from "@ant-design/icons";
import { useState } from "react";
import { createDb, type Env } from "~/db/client.server";
import * as schema from "~/db/schema";
import { getSession, requireGicho } from "~/services/session.server";

const { Title, Text } = Typography;

export async function loader({ request, context }: Route.LoaderArgs) {
    const env = context.cloudflare.env as Env;
    const session = getSession(request);

    if (!session.user?.isGicho) {
        return { settings: null, isGicho: false, user: session.user };
    }

    const db = createDb(env);
    const allSettings = await db.select().from(schema.rewardSettings);
    const settingsObj = allSettings.reduce(
        (acc, s) => {
            acc[s.settingKey] = s.settingValue ?? 0;
            return acc;
        },
        { upload_points: 5, adoption_points: 20 } as Record<string, number>
    );

    return { settings: settingsObj, isGicho: true, user: session.user };
}

export async function action({ request, context }: Route.ActionArgs) {
    const env = context.cloudflare.env as Env;
    requireGicho(request);
    const db = createDb(env);
    const formData = await request.formData();
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

export function meta() {
    return [{ title: "設定 - 封解Box" }];
}

export default function Settings() {
    const { settings, isGicho, user } = useLoaderData<typeof loader>();
    const fetcher = useFetcher();
    const [uploadPoints, setUploadPoints] = useState(settings?.upload_points ?? 5);
    const [adoptionPoints, setAdoptionPoints] = useState(settings?.adoption_points ?? 20);

    if (!isGicho) {
        return (
            <div style={{ maxWidth: 800, margin: "0 auto", padding: 24 }}>
                <Card>
                    <Text type="secondary">儀長のみアクセス可能です</Text>
                </Card>
            </div>
        );
    }

    const handleSave = () => {
        fetcher.submit(
            { upload_points: uploadPoints.toString(), adoption_points: adoptionPoints.toString() },
            { method: "POST" }
        );
    };

    return (
        <div style={{ maxWidth: 800, margin: "0 auto", padding: 24 }}>
            <Title level={2} style={{ marginBottom: 24 }}>
                <SettingOutlined /> 点数設定
            </Title>

            <Card>
                <Form layout="vertical">
                    <Form.Item label={<span style={{ fontWeight: 600 }}>画像アップロード時の点数</span>}>
                        <InputNumber
                            min={0}
                            max={100}
                            value={uploadPoints}
                            onChange={(v) => setUploadPoints(v ?? 5)}
                            style={{ width: 200 }}
                            size="large"
                        />
                        <div style={{ fontSize: 12, color: "#666", marginTop: 8 }}>
                            ユーザーが画像をアップロードした時に付与される点数
                        </div>
                    </Form.Item>

                    <Form.Item
                        label={<span style={{ fontWeight: 600 }}>画像採用時のボーナス点数</span>}
                        style={{ marginTop: 24 }}
                    >
                        <InputNumber
                            min={0}
                            max={100}
                            value={adoptionPoints}
                            onChange={(v) => setAdoptionPoints(v ?? 20)}
                            style={{ width: 200 }}
                            size="large"
                        />
                        <div style={{ fontSize: 12, color: "#666", marginTop: 8 }}>
                            アップロードした画像が採用された時に追加で付与される点数
                        </div>
                    </Form.Item>

                    <Form.Item style={{ marginTop: 32 }}>
                        <Button
                            type="primary"
                            onClick={handleSave}
                            loading={fetcher.state === "submitting"}
                            size="large"
                        >
                            保存
                        </Button>
                        {fetcher.data?.success && (
                            <Text type="success" style={{ marginLeft: 16 }}>
                                保存しました
                            </Text>
                        )}
                    </Form.Item>
                </Form>
            </Card>
        </div>
    );
}
