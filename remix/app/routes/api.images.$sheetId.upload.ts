// Image upload API for a sheet
import type { Route } from "./+types/api.images.$sheetId.upload";
import { createDb, type Env } from "~/db/client.server";
import * as schema from "~/db/schema";

// POST /api/images/:sheetId/upload

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
    if (request.method !== "POST") {
        return Response.json({ error: "Method not allowed" }, { status: 405 });
    }

    const env = context.cloudflare.env as Env;
    const user = await getAuthenticatedUser(request, env);
    const db = createDb(env);
    const sheetId = parseInt(params.sheetId);
    const body = (await request.json()) as {
        file_path: string;
        section_id?: number;
    };

    const [image] = await db
        .insert(schema.images)
        .values({
            sheetId,
            uploaderId: user.id,
            filePath: body.file_path || "placeholder.jpg",
            sectionId: body.section_id ?? null,
        })
        .returning();

    return Response.json(image, { status: 201 });
}
