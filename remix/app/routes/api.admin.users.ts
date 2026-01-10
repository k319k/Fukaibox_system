// Admin API routes
// GET: List all users, PUT: Update user (GICHO only)
import type { Route } from "./+types/api.admin.users";
import { createDb, type Env } from "~/db/client.server";
import * as schema from "~/db/schema";
import { eq, sql } from "drizzle-orm";

// GET /api/admin/users - List all users (GICHO only)

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
export async function loader({ request, context }: Route.LoaderArgs) {
    const env = context.cloudflare.env as Env;
    await requireGicho(request, env);
    const db = createDb(env);

    const allUsers = await db.select().from(schema.users);
    return Response.json(allUsers);
}
