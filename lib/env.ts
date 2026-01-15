import { z } from "zod";

/**
 * 環境変数のスキーマ定義
 */
const serverSchema = z.object({
    // アプリケーション
    NODE_ENV: z.enum(["development", "production", "test"]).default("development"),

    // データベース (Turso)
    // libsql:// と https:// の両方を許可し、接続時に libsql:// に変換する
    TURSO_DATABASE_URL: z.string().min(1).refine(
        (url) => url.startsWith("libsql://") || url.startsWith("https://"),
        { message: "Must be a libsql:// or https:// URL" }
    ),
    TURSO_AUTH_TOKEN: z.string().min(1),

    // 認証 (better-auth)
    BETTER_AUTH_SECRET: z.string().min(1),
    BETTER_AUTH_URL: z.string().url(),

    // Discord OAuth
    DISCORD_CLIENT_ID: z.string().min(1),
    DISCORD_CLIENT_SECRET: z.string().min(1),
    DISCORD_GUILD_ID: z.string().optional(),

    // ロール設定
    GICHO_DISCORD_IDS: z.string().optional(),
    GIIN_ROLE_ID: z.string().optional(),
    MEIYO_GIIN_ROLE_ID: z.string().optional(),
});

const clientSchema = z.object({
    NEXT_PUBLIC_APP_URL: z.string().url(),
});

/**
 * 環境変数の検証と取得
 */
const processEnv = {
    NODE_ENV: process.env.NODE_ENV,
    TURSO_DATABASE_URL: process.env.TURSO_DATABASE_URL || process.env.DATABASE_URL, // 互換性のため
    TURSO_AUTH_TOKEN: process.env.TURSO_AUTH_TOKEN || process.env.DATABASE_AUTH_TOKEN, // 互換性のため
    BETTER_AUTH_SECRET: process.env.BETTER_AUTH_SECRET,
    BETTER_AUTH_URL: process.env.BETTER_AUTH_URL,
    DISCORD_CLIENT_ID: process.env.DISCORD_CLIENT_ID,
    DISCORD_CLIENT_SECRET: process.env.DISCORD_CLIENT_SECRET,
    DISCORD_GUILD_ID: process.env.DISCORD_GUILD_ID,
    GICHO_DISCORD_IDS: process.env.GICHO_DISCORD_IDS,
    GIIN_ROLE_ID: process.env.GIIN_ROLE_ID,
    MEIYO_GIIN_ROLE_ID: process.env.MEIYO_GIIN_ROLE_ID,
    NEXT_PUBLIC_APP_URL: process.env.NEXT_PUBLIC_APP_URL,
};

// バリデーション実行
// 注意: ビルド時やサーバー起動時に実行される
const parsedServer = serverSchema.safeParse(processEnv);
const parsedClient = clientSchema.safeParse(processEnv);

if (!parsedServer.success) {
    console.error("❌ Invalid environment variables:", parsedServer.error.flatten().fieldErrors);
    // 本番環境ではエラーを投げて停止させるのが望ましいが、
    // ビルドプロセス中に環境変数が全て揃っていない場合もあるため、警告にとどめる場合もある。
    // 今回はユーザー要望により「完璧」を目指すため、エラーを投げる。
    if (process.env.NODE_ENV !== 'test') {
        throw new Error("Invalid environment variables");
    }
}

if (!parsedClient.success) {
    console.error("❌ Invalid public environment variables:", parsedClient.error.flatten().fieldErrors);
    if (process.env.NODE_ENV !== 'test') {
        throw new Error("Invalid public environment variables");
    }
}

export const env = {
    ...processEnv,
    ...parsedServer.data,
    ...parsedClient.data,
} as const;
