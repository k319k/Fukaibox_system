// Users API resource route
import type { Route } from "./+types/api.users";
import { createDb, type Env } from "~/db/client.server";
import * as schema from "~/db/schema";
import { desc } from "drizzle-orm";

// GET /api/users - List all users ordered by points
export async function loader({ context }: Route.LoaderArgs) {
    const env = context.cloudflare.env as Env;
    const db = createDb(env);

    const allUsers = await db.select().from(schema.users).orderBy(desc(schema.users.points));

    return Response.json(allUsers);
}
