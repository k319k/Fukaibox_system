
import fs from "fs";
import path from "path";

// .envを手動で読み込む
try {
    const envPath = path.resolve(process.cwd(), ".env");
    const envFile = fs.readFileSync(envPath, "utf-8");
    envFile.split("\n").forEach(line => {
        const match = line.match(/^([^=]+)=(.*)$/);
        if (match) {
            const key = match[1].trim();
            const value = match[2].trim().replace(/^["']|["']$/g, ""); // クォート削除
            if (!process.env[key]) {
                process.env[key] = value;
            }
        }
    });
    console.log("Environment variables loaded from .env");
} catch (e) {
    console.error("Failed to load .env:", e);
}

// 動的インポート
async function main() {
    const { db } = await import("@/lib/db");
    const { sql, eq } = await import("drizzle-orm");
    const schema = await import("@/lib/db/schema");

    console.log("Starting Manual Avatar Sync...");

    try {
        // 1. Get all discord accounts
        const accounts = await db.all(sql`SELECT user_id, access_token FROM accounts WHERE provider_id = 'discord'`);
        console.log(`Found ${accounts.length} discord accounts.`);

        for (const account of accounts) {
            const { user_id, access_token } = account as any;
            if (!access_token) {
                console.log(`Skipping user ${user_id} (No access token)`);
                continue;
            }

            console.log(`Syncing user ${user_id}...`);

            try {
                // Fetch from Discord
                const response = await fetch("https://discord.com/api/users/@me", {
                    headers: {
                        Authorization: `Bearer ${access_token}`,
                    },
                });

                if (response.ok) {
                    const profile = await response.json();
                    const avatarUrl = profile.avatar
                        ? `https://cdn.discordapp.com/avatars/${profile.id}/${profile.avatar}.png`
                        : null;

                    console.log(`  - Got Avatar URL: ${avatarUrl}`);

                    if (avatarUrl) {
                        // SQL injection check? No, using parameterized query via Drizzle usually handles this, 
                        // but db.run(sql`...`) might need care. Using db.update is safer.
                        await db.update(schema.users)
                            .set({ image: avatarUrl, updatedAt: new Date() })
                            .where(eq(schema.users.id, user_id));

                        console.log(`  - Updated DB Success.`);
                    } else {
                        console.log(`  - No avatar found for this user.`);
                    }
                } else {
                    console.error(`  - Discord API Error: ${response.status} ${response.statusText}`);
                    if (response.status === 401) {
                        console.error("    Token might be expired.");
                    }
                }
            } catch (err) {
                console.error(`  - Failed to sync user ${user_id}:`, err);
            }

            // Wait slight delay to avoid rate limits
            await new Promise(resolve => setTimeout(resolve, 500));
        }

        console.log("Sync Completed.");

    } catch (error) {
        console.error("Sync script failed:", error);
    }
}

main().catch(console.error);
