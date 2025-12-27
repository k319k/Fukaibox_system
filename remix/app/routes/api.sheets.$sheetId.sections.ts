// Sections API resource route
// GET: List sections for a sheet, POST: Create section
import type { Route } from "./+types/api.sheets.$sheetId.sections";
import { createDb, type Env } from "~/db/client.server";
import * as schema from "~/db/schema";
import { eq } from "drizzle-orm";

// GET /api/sheets/:sheetId/sections

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
    const sheetId = parseInt(params.sheetId);

    const allSections = await db.query.scriptSections.findMany({
        where: eq(schema.scriptSections.sheetId, sheetId),
        orderBy: [schema.scriptSections.orderIndex],
    });

    return Response.json(allSections);
}

// POST /api/sheets/:sheetId/sections
export async function action({ request, params, context }: Route.ActionArgs) {
    if (request.method !== "POST") {
        return Response.json({ error: "Method not allowed" }, { status: 405 });
    }

    const env = context.cloudflare.env as Env;
    await getAuthenticatedUser(request, env);
    const db = createDb(env);
    const sheetId = parseInt(params.sheetId);
    const body = (await request.json()) as {
        order_index: number;
        content: string;
        image_instruction?: string;
        reference_images?: string[];
    };

    const [section] = await db
        .insert(schema.scriptSections)
        .values({
            sheetId,
            orderIndex: body.order_index,
            content: body.content,
            imageInstruction: body.image_instruction ?? null,
            referenceImages: body.reference_images
                ? JSON.stringify(body.reference_images)
                : null,
        })
        .returning();

    return Response.json(section, { status: 201 });
}
