// Admin API routes
// GET: List all users, PUT: Update user (GICHO only)
import type { Route } from "./+types/api.admin.users";
import { createDb, type Env } from "~/db/client.server";
import * as schema from "~/db/schema";
import { eq, sql } from "drizzle-orm";
import { requireGicho } from "~/services/session.server";

// GET /api/admin/users - List all users (GICHO only)
export async function loader({ request, context }: Route.LoaderArgs) {
    const env = context.cloudflare.env as Env;
    requireGicho(request);
    const db = createDb(env);

    const allUsers = await db.select().from(schema.users);
    return Response.json(allUsers);
}
