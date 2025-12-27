// Discord OAuth authentication service
// .server suffix ensures this only runs on the server
import { eq } from "drizzle-orm";
import { createDb, type Env } from "~/db/client.server";
import * as schema from "~/db/schema";
import { createSessionCookie, type SessionUser } from "./session.server";

interface DiscordUser {
    id: string;
    username: string;
    avatar: string | null;
    email?: string;
}

interface TokenResponse {
    access_token: string;
    token_type: string;
    expires_in: number;
    refresh_token: string;
    scope: string;
}

// Generate Discord OAuth login URL
export function getDiscordLoginUrl(env: Env): string {
    const clientId = env.DISCORD_CLIENT_ID;
    const redirectUri = env.DISCORD_REDIRECT_URI || `${env.FRONTEND_URL}/auth/discord/callback`;

    const params = new URLSearchParams({
        client_id: clientId,
        redirect_uri: redirectUri,
        response_type: "code",
        scope: "identify email",
    });

    return `https://discord.com/api/oauth2/authorize?${params}`;
}

// Exchange code for access token
export async function exchangeCodeForToken(
    code: string,
    env: Env
): Promise<TokenResponse | null> {
    const redirectUri = env.DISCORD_REDIRECT_URI || `${env.FRONTEND_URL}/auth/discord/callback`;

    const response = await fetch("https://discord.com/api/oauth2/token", {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: new URLSearchParams({
            client_id: env.DISCORD_CLIENT_ID,
            client_secret: env.DISCORD_CLIENT_SECRET,
            grant_type: "authorization_code",
            code,
            redirect_uri: redirectUri,
            scope: "identify email",
        }),
    });

    if (!response.ok) {
        console.error("Token exchange failed:", await response.text());
        return null;
    }

    return response.json() as Promise<TokenResponse>;
}

// Fetch Discord user data
export async function fetchDiscordUser(accessToken: string): Promise<DiscordUser | null> {
    const response = await fetch("https://discord.com/api/v10/users/@me", {
        headers: { Authorization: `Bearer ${accessToken}` },
    });

    if (!response.ok) {
        console.error("Failed to fetch Discord user:", await response.text());
        return null;
    }

    return response.json() as Promise<DiscordUser>;
}

// Process Discord OAuth callback and return session cookie
export async function processDiscordCallback(
    code: string,
    env: Env,
    gichoDiscordIds: string[] = []
): Promise<{ cookie: string; user: SessionUser } | { error: string }> {
    // Exchange code for token
    const tokens = await exchangeCodeForToken(code, env);
    if (!tokens) {
        return { error: "discord_token_failed" };
    }

    // Fetch Discord user
    const discordUser = await fetchDiscordUser(tokens.access_token);
    if (!discordUser) {
        return { error: "discord_user_failed" };
    }

    // Check if user is GICHO (admin)
    const isGicho = gichoDiscordIds.includes(discordUser.id);
    const role = isGicho ? "GICHO" : "GIIN";

    // Connect to database and find/create user
    const db = createDb(env);

    let user = await db.query.users.findFirst({
        where: eq(schema.users.discordId, discordUser.id),
    });

    if (!user) {
        // Create new user
        const avatarUrl = discordUser.avatar
            ? `https://cdn.discordapp.com/avatars/${discordUser.id}/${discordUser.avatar}.png`
            : null;

        const [newUser] = await db.insert(schema.users).values({
            username: discordUser.username,
            discordId: discordUser.id,
            discordUsername: discordUser.username,
            avatarUrl: avatarUrl,
            role: role,
            isGicho: isGicho,
        }).returning();

        user = newUser;
    } else {
        // Update role if user is now GICHO
        if (isGicho && !user.isGicho) {
            await db.update(schema.users)
                .set({ role: "GICHO", isGicho: true, updatedAt: new Date().toISOString() })
                .where(eq(schema.users.id, user.id));
            user = { ...user, role: "GICHO", isGicho: true };
        }

        // Update last seen
        await db.update(schema.users)
            .set({ lastSeenAt: new Date().toISOString() })
            .where(eq(schema.users.id, user.id));
    }

    // Create session user object
    const sessionUser: SessionUser = {
        id: user.id,
        username: user.username,
        displayName: user.displayName,
        discordId: user.discordId,
        discordUsername: user.discordUsername,
        avatarUrl: user.avatarUrl,
        role: user.role || "GIIN",
        isGicho: user.isGicho || false,
        isBlocked: user.isBlocked || false,
        points: user.points || 0,
        canManageApiKeys: user.canManageApiKeys || false,
    };

    // Create session cookie
    const cookie = createSessionCookie({ user: sessionUser }, env);

    return { cookie, user: sessionUser };
}
