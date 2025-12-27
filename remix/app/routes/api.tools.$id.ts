// Individual tool API resource route
// GET: Get tool detail, PUT: Update, DELETE: Soft delete
import type { Route } from "./+types/api.tools.$id";
import { createDb, type Env } from "~/db/client.server";
import * as schema from "~/db/schema";
import { eq } from "drizzle-orm";

// GET /api/tools/:id - Get tool detail

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
    const id = params.id;

    const project = await db.query.toolProjects.findFirst({
        where: eq(schema.toolProjects.id, id),
        with: {
            owner: true,
            votes: true,
            comments: { with: { user: true } },
        },
    });

    if (!project) {
        return Response.json({ error: "Project not found" }, { status: 404 });
    }

    // Increment view count
    await db
        .update(schema.toolProjects)
        .set({ viewCount: (project.viewCount ?? 0) + 1 })
        .where(eq(schema.toolProjects.id, id));

    return Response.json(project);
}

// PUT/DELETE /api/tools/:id
export async function action({ request, params, context }: Route.ActionArgs) {
    const env = context.cloudflare.env as Env;
    await getAuthenticatedUser(request, env);
    const db = createDb(env);
    const id = params.id;

    if (request.method === "PUT") {
        const body = (await request.json()) as {
            name?: string;
            description?: string;
            html_content?: string;
            embed_url?: string;
            is_public?: boolean;
        };

        const [updated] = await db
            .update(schema.toolProjects)
            .set({
                name: body.name,
                description: body.description,
                htmlContent: body.html_content,
                embedUrl: body.embed_url,
                isPublic: body.is_public,
                updatedAt: new Date().toISOString(),
            })
            .where(eq(schema.toolProjects.id, id))
            .returning();

        return Response.json(updated);
    }

    if (request.method === "DELETE") {
        await db
            .update(schema.toolProjects)
            .set({ isDeleted: true })
            .where(eq(schema.toolProjects.id, id));
        return Response.json({ success: true });
    }

    return Response.json({ error: "Method not allowed" }, { status: 405 });
}
