// Individual section API resource route
// PUT: Update section, DELETE: Delete section
import type { Route } from "./+types/api.sections.$id";
import { createDb, type Env } from "~/db/client.server";
import * as schema from "~/db/schema";
import { eq } from "drizzle-orm";

// PUT/DELETE /api/sections/:id

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
export async function action({ request, params, context }: Route.ActionArgs) {
    const env = context.cloudflare.env as Env;
    await getAuthenticatedUser(request, env);
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
