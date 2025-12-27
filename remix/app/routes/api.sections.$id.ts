// Individual section API resource route
// PUT: Update section, DELETE: Delete section
import type { Route } from "./+types/api.sections.$id";
import { createDb, type Env } from "~/db/client.server";
import * as schema from "~/db/schema";
import { eq } from "drizzle-orm";
import { requireUser } from "~/services/session.server";

// PUT/DELETE /api/sections/:id
export async function action({ request, params, context }: Route.ActionArgs) {
    const env = context.cloudflare.env as Env;
    requireUser(request);
    const db = createDb(env);
    const id = parseInt(params.id);

    if (request.method === "PUT") {
        const body = (await request.json()) as {
            content?: string;
            image_instruction?: string;
            reference_images?: string[];
        };

        const [updated] = await db
            .update(schema.scriptSections)
            .set({
                content: body.content,
                imageInstruction: body.image_instruction ?? null,
                referenceImages: body.reference_images
                    ? JSON.stringify(body.reference_images)
                    : null,
                updatedAt: new Date().toISOString(),
            })
            .where(eq(schema.scriptSections.id, id))
            .returning();

        return Response.json(updated);
    }

    if (request.method === "DELETE") {
        await db
            .delete(schema.scriptSections)
            .where(eq(schema.scriptSections.id, id));
        return Response.json({ success: true });
    }

    return Response.json({ error: "Method not allowed" }, { status: 405 });
}
