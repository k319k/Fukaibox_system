// Sheets API resource route
// GET: List all sheets, POST: Create new sheet
import type { Route } from "./+types/api.sheets";
import { createDb, type Env } from "~/db/client.server";
import * as schema from "~/db/schema";
import { desc } from "drizzle-orm";
import { requireUser } from "~/services/session.server";

// GET /api/sheets - List all sheets
export async function loader({ context }: Route.LoaderArgs) {
    const env = context.cloudflare.env as Env;
    const db = createDb(env);

    const allSheets = await db.query.sheets.findMany({
        with: { creator: true },
        orderBy: [desc(schema.sheets.createdAt)],
    });

    return Response.json(allSheets);
}

// POST /api/sheets - Create new sheet
export async function action({ request, context }: Route.ActionArgs) {
    if (request.method !== "POST") {
        return Response.json({ error: "Method not allowed" }, { status: 405 });
    }

    const env = context.cloudflare.env as Env;
    const user = requireUser(request);
    const db = createDb(env);
    const body = (await request.json()) as {
        title?: string;
        description?: string;
        is_giin_only?: boolean;
    };

    const [newSheet] = await db
        .insert(schema.sheets)
        .values({
            title: body.title ?? "Untitled",
            description: body.description ?? null,
            creatorId: user.id,
            isGiinOnly: body.is_giin_only ?? false,
        })
        .returning();

    return Response.json(newSheet, { status: 201 });
}
