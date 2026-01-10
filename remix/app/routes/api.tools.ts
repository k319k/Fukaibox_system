// Tools API resource route
// GET: List public tools, POST: Create tool
import type { Route } from "./+types/api.tools";
import { createDb, type Env } from "~/db/client.server";
import * as schema from "~/db/schema";
import { eq, desc, and } from "drizzle-orm";

// GET /api/tools - List public tools

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
export async function loader({ context }: Route.LoaderArgs) {
    const env = context.cloudflare.env as Env;
    const db = createDb(env);

    const projects = await db.query.toolProjects.findMany({
        where: and(
            eq(schema.toolProjects.isPublic, true),
            eq(schema.toolProjects.isDeleted, false)
        ),
        with: { owner: true },
        orderBy: [desc(schema.toolProjects.createdAt)],
    });

    return Response.json(projects);
}

// POST /api/tools - Create new tool
export async function action({ request, context }: Route.ActionArgs) {
    if (request.method !== "POST") {
        return Response.json({ error: "Method not allowed" }, { status: 405 });
    }

    const env = context.cloudflare.env as Env;
    const user = await getAuthenticatedUser(request, env);
    const db = createDb(env);
    const body = (await request.json()) as {
        name: string;
        description?: string;
        project_type?: string;
        html_content?: string;
        embed_source?: string;
        embed_url?: string;
        is_public?: boolean;
    };

    const [project] = await db
        .insert(schema.toolProjects)
        .values({
            id: crypto.randomUUID(),
            ownerId: user.id,
            name: body.name,
            description: body.description ?? null,
            projectType: body.project_type ?? "sandbox",
            htmlContent: body.html_content ?? null,
            embedSource: body.embed_source ?? null,
            embedUrl: body.embed_url ?? null,
            isPublic: body.is_public !== false,
        })
        .returning();

    return Response.json(project, { status: 201 });
}
