// Points API resource route
// GET: Get user point history, POST: Add points
import type { Route } from "./+types/api.points.$userId";
import { createDb, type Env } from "~/db/client.server";
import * as schema from "~/db/schema";
import { eq, desc, sql } from "drizzle-orm";

// GET /api/points/:userId - Get point history

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
export async function loader({ params, context }: Route.LoaderArgs) {
    const env = context.cloudflare.env as Env;
    const db = createDb(env);
    const userId = parseInt(params.userId);

    const history = await db.query.pointHistory.findMany({
        where: eq(schema.pointHistory.userId, userId),
        orderBy: [desc(schema.pointHistory.createdAt)],
    });

    return Response.json(history);
}

// POST /api/points/:userId - Add points (GICHO only)
export async function action({ request, params, context }: Route.ActionArgs) {
    if (request.method !== "POST") {
        return Response.json({ error: "Method not allowed" }, { status: 405 });
    }

    const env = context.cloudflare.env as Env;
    await requireGicho(request, env);
    const db = createDb(env);
    const userId = parseInt(params.userId);
    const body = (await request.json()) as {
        points: number;
        reason?: string;
    };

    if (typeof body.points !== "number") {
        return Response.json({ error: "Points must be a number" }, { status: 400 });
    }

    try {
        // Transaction: update user points and add to history
        await db
            .update(schema.users)
            .set({
                points: sql`${schema.users.points} + ${body.points}`,
            })
            .where(eq(schema.users.id, userId));

        await db.insert(schema.pointHistory).values({
            userId,
            pointsChange: body.points,
            reason: body.reason ?? "Manual adjustment",
        });

        return Response.json({ success: true });
    } catch (error) {
        console.error("Failed to add points:", error);
        return Response.json(
            {
                error: "Failed to update points",
                details: error instanceof Error ? error.message : String(error),
            },
            { status: 500 }
        );
    }
}
