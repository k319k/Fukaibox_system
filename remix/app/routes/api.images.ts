// Images API resource route
import type { Route } from "./+types/api.images";
import { createDb, type Env } from "~/db/client.server";
import * as schema from "~/db/schema";
import { eq } from "drizzle-orm";

// GET /api/images - List images (optionally by sheet_id)
export async function loader({ request, context }: Route.LoaderArgs) {
    const env = context.cloudflare.env as Env;
    const db = createDb(env);
    const url = new URL(request.url);
    const sheetId = url.searchParams.get("sheet_id");

    if (!sheetId) {
        const allImages = await db.query.images.findMany({
            with: { uploader: true },
        });
        return Response.json(allImages);
    }

    const sheetImages = await db.query.images.findMany({
        where: eq(schema.images.sheetId, parseInt(sheetId)),
        with: { uploader: true },
    });

    return Response.json(sheetImages);
}
