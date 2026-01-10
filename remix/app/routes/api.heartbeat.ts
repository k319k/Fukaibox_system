// Heartbeat API - Update user last seen
import type { Route } from "./+types/api.heartbeat";
import { createDb, type Env } from "~/db/client.server";
import * as schema from "~/db/schema";
import { eq } from "drizzle-orm";

// POST /api/heartbeat
export async function action({ request, context }: Route.ActionArgs) {
    if (request.method !== "POST") {
        return Response.json({ error: "Method not allowed" }, { status: 405 });
    }

    const env = context.cloudflare.env as Env;
    const db = createDb(env);
    const body = (await request.json()) as { user_id: number };

    if (!body.user_id) {
        return Response.json({ error: "user_id required" }, { status: 400 });
    }

    await db
        .update(schema.users)
        .set({
            updatedAt: new Date().toISOString(),
            lastSeenAt: new Date().toISOString(),
        })
        .where(eq(schema.users.id, body.user_id));

    return Response.json({ success: true });
}
