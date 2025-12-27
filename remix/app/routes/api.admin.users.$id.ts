// Admin user update API
// PUT: Update user details (GICHO only)
import type { Route } from "./+types/api.admin.users.$id";
import { createDb, type Env } from "~/db/client.server";
import * as schema from "~/db/schema";
import { eq, sql } from "drizzle-orm";

// PUT /api/admin/users/:id - Update user (GICHO only)

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
export async function action({ request, params, context }: Route.ActionArgs) {
    if (request.method !== "PUT") {
        return Response.json({ error: "Method not allowed" }, { status: 405 });
    }

    const env = context.cloudflare.env as Env;
    await requireGicho(request, env);
    const db = createDb(env);
    const id = parseInt(params.id);
    const body = (await request.json()) as {
        points?: number;
        is_gicho?: boolean;
        is_blocked?: boolean;
        block_reason?: string;
        role?: string;
    };

    // Handle Points Update with audit trail
    if (body.points !== undefined && body.points !== null) {
        const currentUser = await db.query.users.findFirst({
            where: eq(schema.users.id, id),
            columns: { points: true },
        });

        if (currentUser) {
            const currentPoints = currentUser.points ?? 0;
            const targetPoints = Number(body.points);
            const diff = targetPoints - currentPoints;

            if (diff !== 0) {
                await db
                    .update(schema.users)
                    .set({ points: sql`${schema.users.points} + ${diff}` })
                    .where(eq(schema.users.id, id));

                await db.insert(schema.pointHistory).values({
                    userId: id,
                    pointsChange: diff,
                    reason: "Admin detailed edit",
                });
            }
        }
    }

    // Handle other fields
    const updateData: Record<string, unknown> = {};
    if (body.is_gicho !== undefined) updateData.isGicho = body.is_gicho;
    if (body.is_blocked !== undefined) updateData.isBlocked = body.is_blocked;
    if (body.block_reason !== undefined) updateData.blockReason = body.block_reason;
    if (body.role !== undefined) updateData.role = body.role;

    if (Object.keys(updateData).length === 0) {
        const user = await db.query.users.findFirst({
            where: eq(schema.users.id, id),
        });
        return Response.json(user);
    }

    const [updated] = await db
        .update(schema.users)
        .set(updateData)
        .where(eq(schema.users.id, id))
        .returning();

    return Response.json(updated);
}
