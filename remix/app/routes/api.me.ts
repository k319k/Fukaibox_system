// Me API - Get current user info
import type { Route } from "./+types/api.me";
import { getSession } from "~/services/session.server";

// GET /api/me - Get current authenticated user
export async function loader({ request }: Route.LoaderArgs) {
    const session = getSession(request);

    if (!session.user) {
        return Response.json({ user: null });
    }

    return Response.json({ user: session.user });
}
