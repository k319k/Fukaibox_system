// Discord OAuth callback route
// Handles the redirect from Discord and creates session
import type { Route } from "./+types/auth.discord.callback";
import { redirect } from "react-router";
import { processDiscordCallback } from "~/services/auth.server";
import type { Env } from "~/db/client.server";

export async function loader({ request, context }: Route.LoaderArgs) {
    const env = context.cloudflare.env as Env;
    const url = new URL(request.url);
    const code = url.searchParams.get("code");
    const error = url.searchParams.get("error");

    // Handle Discord errors
    if (error) {
        return redirect(`/?auth_error=${error}`);
    }

    if (!code) {
        return redirect("/?auth_error=no_code");
    }

    // Get GICHO IDs from environment (comma-separated)
    const gichoIds = (env as any).GICHO_DISCORD_IDS?.split(",").map((id: string) => id.trim()) || [];

    try {
        const result = await processDiscordCallback(code, env, gichoIds);

        if ("error" in result) {
            return redirect(`/?auth_error=${result.error}`);
        }

        // Redirect to home with session cookie
        return redirect("/", {
            headers: {
                "Set-Cookie": result.cookie,
            },
        });
    } catch (error) {
        console.error("Discord callback error:", error);
        return redirect(`/?auth_error=internal`);
    }
}
