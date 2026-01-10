// API Keys management
import type { Route } from "./+types/api.api-keys";
import { createDb, type Env } from "~/db/client.server";
import * as schema from "~/db/schema";
import { eq, and } from "drizzle-orm";

// GET /api/api-keys?user_id=X

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
export async function loader({ request, context }: Route.LoaderArgs) {
    const env = context.cloudflare.env as Env;
    const db = createDb(env);
    const url = new URL(request.url);
    const userId = url.searchParams.get("user_id");

    if (!userId) {
        return Response.json({ error: "user_id required" }, { status: 400 });
    }

    const keys = await db.query.apiKeys.findMany({
        where: and(
            eq(schema.apiKeys.userId, parseInt(userId)),
            eq(schema.apiKeys.isActive, true)
        ),
    });

    // Don't return keyHash
    return Response.json(
        keys.map((k) => ({
            id: k.id,
            keyName: k.keyName,
            usageCount: k.usageCount,
            lastUsedAt: k.lastUsedAt,
            createdAt: k.createdAt,
            isActive: k.isActive,
        }))
    );
}

// POST /api/api-keys - Create new API key
export async function action({ request, context }: Route.ActionArgs) {
    if (request.method !== "POST") {
        return Response.json({ error: "Method not allowed" }, { status: 405 });
    }

    const env = context.cloudflare.env as Env;
    const user = await getAuthenticatedUser(request, env);
    const db = createDb(env);
    const body = (await request.json()) as { key_name: string };

    const rawKey = `fkb_${crypto.randomUUID().replace(/-/g, "")}`;
    const keyHash = await crypto.subtle
        .digest("SHA-256", new TextEncoder().encode(rawKey))
        .then((hash) =>
            Array.from(new Uint8Array(hash))
                .map((b) => b.toString(16).padStart(2, "0"))
                .join("")
        );

    const [apiKey] = await db
        .insert(schema.apiKeys)
        .values({
            userId: user.id,
            keyName: body.key_name,
            keyHash: keyHash,
        })
        .returning();

    return Response.json(
        {
            id: apiKey.id,
            keyName: apiKey.keyName,
            key: rawKey, // Only returned once!
        },
        { status: 201 }
    );
}
