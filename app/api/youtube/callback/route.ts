import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { db } from "@/lib/db";
import { youtubeTokens } from "@/lib/db/schema/youtube";
import { exchangeCodeForTokens } from "@/lib/youtube-api";
import crypto from "crypto";

export async function GET(req: NextRequest) {
    try {
        const session = await auth.api.getSession({
            headers: await headers(),
        });

        if (!session?.user) {
            return NextResponse.redirect(new URL("/login", req.url));
        }

        const { searchParams } = new URL(req.url);
        const code = searchParams.get("code");
        const error = searchParams.get("error");

        if (error) {
            console.error("YouTube OAuth error:", error);
            return NextResponse.redirect(new URL("/youtube?error=auth_failed", req.url));
        }

        if (!code) {
            return NextResponse.redirect(new URL("/youtube?error=missing_code", req.url));
        }

        // トークン取得
        const { accessToken, refreshToken, expiresAt } = await exchangeCodeForTokens(code);

        // DBに保存
        await db.insert(youtubeTokens).values({
            id: crypto.randomUUID(),
            userId: session.user.id,
            accessToken,
            refreshToken,
            expiresAt,
            createdAt: new Date(),
            updatedAt: new Date(),
        }).onConflictDoUpdate({
            target: youtubeTokens.userId,
            set: {
                accessToken,
                refreshToken,
                expiresAt,
                updatedAt: new Date(),
            },
        });

        return NextResponse.redirect(new URL("/youtube?connected=true", req.url));
    } catch (error: any) {
        console.error("YouTube callback error:", error);
        return NextResponse.redirect(new URL("/youtube?error=connection_failed", req.url));
    }
}
