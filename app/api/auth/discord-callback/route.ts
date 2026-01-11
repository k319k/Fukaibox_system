import { NextRequest, NextResponse } from "next/server";
import { determineRoleFromDiscordRoles } from "@/lib/auth";
import { updateUserRole } from "@/app/actions/auth";

const DISCORD_GUILD_ID = process.env.DISCORD_GUILD_ID || "";

/**
 * Discord OAuth認証後のカスタム処理
 * ユーザーのDiscord Guild Member情報を取得してロールを判定・保存
 */
export async function GET(request: NextRequest) {
    try {
        const searchParams = request.nextUrl.searchParams;
        const accessToken = searchParams.get("access_token");
        const userId = searchParams.get("user_id");

        if (!accessToken || !userId) {
            return NextResponse.json(
                { error: "Missing required parameters" },
                { status: 400 }
            );
        }

        // Discord User情報を取得
        const userResponse = await fetch("https://discord.com/api/v10/users/@me", {
            headers: {
                Authorization: `Bearer ${accessToken}`,
            },
        });

        if (!userResponse.ok) {
            console.error("Failed to fetch Discord user info");
            return NextResponse.json(
                { error: "Failed to fetch user info" },
                { status: 500 }
            );
        }

        const discordUser = await userResponse.json();
        const discordId = discordUser.id;
        const discordUsername = discordUser.username;

        // Discord Guild Member情報を取得（ロール情報を含む）
        let roleIds: string[] = [];

        if (DISCORD_GUILD_ID) {
            try {
                const memberResponse = await fetch(
                    `https://discord.com/api/v10/users/@me/guilds/${DISCORD_GUILD_ID}/member`,
                    {
                        headers: {
                            Authorization: `Bearer ${accessToken}`,
                        },
                    }
                );

                if (memberResponse.ok) {
                    const member = await memberResponse.json();
                    roleIds = member.roles || [];
                } else {
                    console.warn("Failed to fetch guild member info, using default roles");
                }
            } catch (error) {
                console.error("Error fetching guild member:", error);
            }
        }

        // ロールを判定
        const role = determineRoleFromDiscordRoles(discordId, roleIds);

        // DBに保存
        await updateUserRole(userId, role, discordId, discordUsername);

        // リダイレクト先は better-auth が自動的に処理する
        return NextResponse.redirect(new URL("/", request.url));
    } catch (error) {
        console.error("Discord callback error:", error);
        return NextResponse.json(
            { error: "Internal server error" },
            { status: 500 }
        );
    }
}
