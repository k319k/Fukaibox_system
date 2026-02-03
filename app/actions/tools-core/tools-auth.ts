"use server";

import { auth } from "@/lib/auth";
import { env } from "@/lib/env";
import { headers } from "next/headers";
import jwt from "jsonwebtoken";

// --- Mint Supabase Token ---

export async function mintSupabaseToken() {
    const session = await auth.api.getSession({
        headers: await headers()
    });

    if (!session?.user) {
        return null;
    }

    const secret = env.SUPABASE_JWT_SECRET;

    if (!secret) {
        console.warn("SUPABASE_JWT_SECRET is not set. Authenticated Realtime features will fall back to anon/unavailable.");
        return null;
    }

    const payload = {
        aud: "authenticated",
        role: "authenticated",
        sub: session.user.id,
        email: session.user.email,
        app_metadata: {
            provider: "fukai_box",
            providers: ["fukai_box"]
        },
        user_metadata: {
            name: session.user.name,
            image: session.user.image,
        },
        exp: Math.floor(Date.now() / 1000) + 60 * 60 * 24, // 24 hours
    };

    return jwt.sign(payload, secret);
}
