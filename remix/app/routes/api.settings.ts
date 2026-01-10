// Settings API - Get and update reward settings
import type { Route } from "./+types/api.settings";
import { createDb, type Env } from "~/db/client.server";
import * as schema from "~/db/schema";

// GET /api/settings

// Inline auth helper to avoid importing session.server at module level
async function getAuthenticatedUser(request: Request, env: any) {
  const { getSession } = await import("~/services/session.server");
  const session = await getSession(request.headers.get("Cookie") || "");
  const userId = session.get("userId");
  
  if (!userId) {
    throw new Response("Unauthorized", { status: 401 });
  }
  
  const { createDb } = await import("~/db/client.server");
  const db = createDb(env);
  const user = await db.query.users.findFirst({
    where: (users, { eq }) => eq(users.id, userId),
  });
  
  if (!user) {
    throw new Response("User not found", { status: 401 });
  }
  
  return user;
}

// Inline GICHO check helper
async function requireGicho(request: Request, env: any) {
  const user = await getAuthenticatedUser(request, env);
  if (!user.isGicho) {
    throw new Response("Forbidden - GICHO only", { status: 403 });
  }
  return user;
}
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
    await requireGicho(request, env);
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
