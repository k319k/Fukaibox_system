// Helper functions for API routes (inline version to avoid client bundle issues)
// This is duplicated across API files to avoid importing server-only modules at module level

import type { Route } from "./+types/api.sheets";
import { createDb, type Env } from "~/db/client.server";
import * as schema from "~/db/schema";
import { desc } from "drizzle-orm";

// Inline auth helper to avoid importing session.server at module level
async function getAuthenticatedUser(request: Request, env: Env) {
    const { getSession } = await import("~/services/session.server");
    const session = await getSession(request.headers.get("Cookie") || "");
    const userId = session.get("userId");

    if (!userId) {
        throw new Response("Unauthorized", { status: 401 });
    }

    const db = createDb(env);
    const user = await db.query.users.findFirst({
        where: (users, { eq }) => eq(users.id, userId),
    });

    if (!user) {
        throw new Response("User not found", { status: 401 });
    }

    return user;
}

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
    const user = await getAuthenticatedUser(request, env);
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
