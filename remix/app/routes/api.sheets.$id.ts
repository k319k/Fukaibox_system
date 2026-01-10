// Individual sheet API resource route
// GET: Get sheet details, PUT: Update sheet, DELETE: Delete sheet
import type { Route } from "./+types/api.sheets.$id";
import { createDb, type Env } from "~/db/client.server";
import * as schema from "~/db/schema";
import { eq } from "drizzle-orm";

// GET /api/sheets/:id - Get sheet with sections and images

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
export async function loader({ params, context }: Route.LoaderArgs) {
    const env = context.cloudflare.env as Env;
    const db = createDb(env);
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
        return Response.json({ error: "Sheet not found" }, { status: 404 });
    }

    return Response.json(sheet);
}

// PUT/DELETE /api/sheets/:id
export async function action({ request, params, context }: Route.ActionArgs) {
    const env = context.cloudflare.env as Env;
    const user = await getAuthenticatedUser(request, env);
    const db = createDb(env);
    const id = parseInt(params.id);

    if (request.method === "PUT") {
        const body = await request.json() as { title?: string; description?: string; current_phase?: string };

        const [updated] = await db.update(schema.sheets)
            .set({
                title: body.title,
                description: body.description,
                currentPhase: body.current_phase,
                updatedAt: new Date().toISOString(),
            })
            .where(eq(schema.sheets.id, id))
            .returning();

        return Response.json(updated);
    }

    if (request.method === "DELETE") {
        await db.delete(schema.sheets).where(eq(schema.sheets.id, id));
        return Response.json({ success: true });
    }

    return Response.json({ error: "Method not allowed" }, { status: 405 });
}
