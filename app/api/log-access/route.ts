import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";

// Simple in-memory rate limiting (per instance)
const lastLogTime = new Map<string, number>();
const COOLDOWN_MS = 5000; // 5 seconds cooldown per user

export async function POST(req: NextRequest) {
    try {
        const session = await auth.api.getSession({
            headers: await headers()
        });

        if (!session?.user) {
            return NextResponse.json({ success: true }); // Ignore non-logged in
        }

        const userId = session.user.id;
        const debugUserIds = [
            "1m3c399fZuUy6YBmCFivh0iun40IsCU8"
        ];

        if (debugUserIds.includes(userId)) {
            const now = Date.now();
            const last = lastLogTime.get(userId) || 0;

            if (now - last < COOLDOWN_MS) {
                return NextResponse.json({ success: true, skipped: true });
            }
            lastLogTime.set(userId, now);

            const body = await req.json().catch(() => ({}));
            const path = body.path || "Unknown Path";

            // Send to Discord
            await fetch("https://discordapp.com/api/webhooks/1309678377275232358/jWzO4sEhrbKZ7q1pzuTKOm8z_3gUsVXJHm2ef9PTGjlE6mJYFUqVHmyNC-Ksg0hESS_o", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    content: `👀 **Special User Access**\nUser: **${session.user.name}**\nPath: \`${path}\`\nTime: ${new Date().toLocaleString('ja-JP', { timeZone: 'Asia/Tokyo' })}`,
                }),
            }).catch(e => console.error("Webhook failed", e));
        }

        return NextResponse.json({ success: true });
    } catch (e) {
        console.error("Access log error", e);
        return NextResponse.json({ success: false }, { status: 500 });
    }
}
