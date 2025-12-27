// Image upload API for a sheet
import type { Route } from "./+types/api.images.$sheetId.upload";
import { createDb, type Env } from "~/db/client.server";
import * as schema from "~/db/schema";
import { requireUser } from "~/services/session.server";

// POST /api/images/:sheetId/upload
export async function action({ request, params, context }: Route.ActionArgs) {
    if (request.method !== "POST") {
        return Response.json({ error: "Method not allowed" }, { status: 405 });
    }

    const env = context.cloudflare.env as Env;
    const user = requireUser(request);
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
