// Tools API resource route
// GET: List public tools, POST: Create tool
import type { Route } from "./+types/api.tools";
import { createDb, type Env } from "~/db/client.server";
import * as schema from "~/db/schema";
import { eq, desc, and } from "drizzle-orm";
import { requireUser } from "~/services/session.server";

// GET /api/tools - List public tools
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
    const user = requireUser(request);
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
