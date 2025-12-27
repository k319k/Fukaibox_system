// Individual image API - DELETE
import type { Route } from "./+types/api.images.$id";
import { createDb, type Env } from "~/db/client.server";
import * as schema from "~/db/schema";
import { eq } from "drizzle-orm";
import { requireUser } from "~/services/session.server";

// DELETE /api/images/:id
export async function action({ request, params, context }: Route.ActionArgs) {
    if (request.method !== "DELETE") {
        return Response.json({ error: "Method not allowed" }, { status: 405 });
    }

    const env = context.cloudflare.env as Env;
    requireUser(request);
    const db = createDb(env);
    const id = parseInt(params.id);

    await db.delete(schema.images).where(eq(schema.images.id, id));
    return Response.json({ success: true });
}
