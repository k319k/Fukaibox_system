// Discord OAuth login route
// Redirects user to Discord for authentication
import type { Route } from "./+types/auth.discord.login";
import { redirect } from "react-router";
import { getDiscordLoginUrl } from "~/services/auth.server";
import type { Env } from "~/db/client.server";

export async function loader({ context }: Route.LoaderArgs) {
    const env = context.cloudflare.env as Env;
    const loginUrl = getDiscordLoginUrl(env);
    return redirect(loginUrl);
}
