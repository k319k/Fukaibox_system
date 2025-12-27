// Session management using cookies
// .server suffix ensures this only runs on the server
import type { Env } from "~/db/client.server";

const SESSION_COOKIE_NAME = "__fukaibox_session";
const SESSION_MAX_AGE = 60 * 60 * 24 * 7; // 7 days

export interface SessionUser {
    id: number;
    username: string;
    displayName: string | null;
    discordId: string | null;
    discordUsername: string | null;
    avatarUrl: string | null;
    role: string;
    isGicho: boolean;
    isBlocked: boolean;
    points: number;
    canManageApiKeys: boolean;
}

export interface SessionData {
    user: SessionUser | null;
}

// Simple base64 encode/decode for session data
function encodeSession(data: SessionData): string {
    return btoa(JSON.stringify(data));
}

function decodeSession(encoded: string): SessionData | null {
    try {
        return JSON.parse(atob(encoded));
    } catch {
        return null;
    }
}

// Get session from request cookies
export function getSession(request: Request): SessionData {
    const cookieHeader = request.headers.get("Cookie");
    if (!cookieHeader) return { user: null };

    const cookies = Object.fromEntries(
        cookieHeader.split(";").map(c => {
            const [key, ...vals] = c.trim().split("=");
            return [key, vals.join("=")];
        })
    );

    const sessionCookie = cookies[SESSION_COOKIE_NAME];
    if (!sessionCookie) return { user: null };

    return decodeSession(sessionCookie) || { user: null };
}

// Create session cookie header
export function createSessionCookie(data: SessionData, env: Env): string {
    const encoded = encodeSession(data);
    const secure = env.FRONTEND_URL?.startsWith("https") ? "; Secure" : "";
    return `${SESSION_COOKIE_NAME}=${encoded}; Path=/; HttpOnly; SameSite=Lax; Max-Age=${SESSION_MAX_AGE}${secure}`;
}

// Clear session cookie header
export function clearSessionCookie(): string {
    return `${SESSION_COOKIE_NAME}=; Path=/; HttpOnly; SameSite=Lax; Max-Age=0`;
}

// Require authenticated user, throw redirect if not logged in
export function requireUser(request: Request): SessionUser {
    const session = getSession(request);
    if (!session.user) {
        throw new Response("Unauthorized", { status: 401 });
    }
    if (session.user.isBlocked) {
        throw new Response("User is blocked", { status: 403 });
    }
    return session.user;
}

// Require GICHO role
export function requireGicho(request: Request): SessionUser {
    const user = requireUser(request);
    if (!user.isGicho && user.role !== "GICHO") {
        throw new Response("Forbidden: GICHO role required", { status: 403 });
    }
    return user;
}
