// Individual sheet API resource route
// GET: Get sheet details, PUT: Update sheet, DELETE: Delete sheet
import type { Route } from "./+types/api.sheets.$id";
import { createDb, type Env } from "~/db/client.server";
import * as schema from "~/db/schema";
import { eq } from "drizzle-orm";
import { requireUser } from "~/services/session.server";

// GET /api/sheets/:id - Get sheet with sections and images
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
    const user = requireUser(request);
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
