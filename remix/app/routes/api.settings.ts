// Settings API - Get and update reward settings
import type { Route } from "./+types/api.settings";
import { createDb, type Env } from "~/db/client.server";
import * as schema from "~/db/schema";
import { requireGicho } from "~/services/session.server";

// GET /api/settings
export async function loader({ context }: Route.LoaderArgs) {
    const env = context.cloudflare.env as Env;
    const db = createDb(env);

    const allSettings = await db.select().from(schema.rewardSettings);
    const settingsObj = allSettings.reduce(
        (acc, s) => {
            acc[s.settingKey] = s.settingValue;
            return acc;
        },
        {} as Record<string, number | null>
    );

    return Response.json(settingsObj);
}

// POST /api/settings - Update settings (GICHO only)
export async function action({ request, context }: Route.ActionArgs) {
    if (request.method !== "POST") {
        return Response.json({ error: "Method not allowed" }, { status: 405 });
    }

    const env = context.cloudflare.env as Env;
    requireGicho(request);
    const db = createDb(env);
    const body = (await request.json()) as Record<string, number>;

    const updates = [];
    for (const [key, value] of Object.entries(body)) {
        const [setting] = await db
            .insert(schema.rewardSettings)
            .values({
                settingKey: key,
                settingValue: value,
            })
            .onConflictDoUpdate({
                target: schema.rewardSettings.settingKey,
                set: { settingValue: value },
            })
            .returning();
        updates.push(setting);
    }

    return Response.json(updates);
}
