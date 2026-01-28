import { createClient } from "@supabase/supabase-js";
import { env } from "@/lib/env";
import jwt from "jsonwebtoken";

/**
 * Supabase Admin Client
 * Service Role Keyを使用しているため、RLSを無視した操作が可能。
 * サーバーサイド（API Routes/Server Actions）でのみ使用すること。
 */
export const supabaseAdmin = createClient(
    env.NEXT_PUBLIC_SUPABASE_URL,
    env.SUPABASE_SERVICE_ROLE_KEY,
    {
        auth: {
            autoRefreshToken: false,
            persistSession: false,
        },
    }
);

/**
 * Tools SDK用のカスタムJWTを発行する
 * 
 * @param userId - 親アプリ(Turso)のユーザーID(Discord ID)
 * @param appData - アプリ情報（RLS用）
 * @returns 署名済みJWT
 */
export async function mintToolsToken(
    userId: string,
    appData: {
        appId: string;
        role?: string;
    }
): Promise<string> {
    // SupabaseのJWTシークレット (Service Role KeyにはJWT Secretが含まれていると仮定されるが、
    // 正確にはProject SettingsのJWT Secretが必要。
    // しかし、Service Role Key自体で署名すればSupabaseは検証できるケースが多いが、
    // 標準的には `SUPABASE_JWT_SECRET` が必要になる場合がある。
    // ここでは一般的なSupabase JWTのpayload構造に従う。

    // NOTE: SupabaseのAuthを使用せず、外部Auth(Turso/BetterAuth)のユーザーを
    // Supabase RLSで認識させるための "Custom Claims" パターンを使用。

    const payload = {
        aud: "authenticated", // Supabase RLSが "authenticated" ロールとして認識するために必要
        role: "authenticated",
        sub: userId,          // user_id
        app_id: appData.appId, // RLSで使用するカスタムクレーム
        app_role: appData.role || "user",
        exp: Math.floor(Date.now() / 1000) + 60 * 60, // 1時間有効
    };

    // 署名にはSUPABASE_JWT_SECRETが理想だが、環境変数にない場合は
    // 便宜上SERVICE_ROLE_KEYを使う実装例も見られる。
    // ただし、本来はJWT Secretを環境変数に追加すべき。
    // 今回はユーザーの手間を減らすため、env.SUPABASE_SERVICE_ROLE_KEY を使用するが、
    // エラーになる場合は JWT_SECRET の追加を依頼する。
    // (通常、Supabaseプロジェクト設定のJWT Secretが必要)

    // *一旦 Service Role Key で署名はできない（これはランダム文字列ではなく特定フォーマットのため）*
    // *正しくはプロジェクトの JWT Secret が必要。*

    // ユーザーに追加設定を求めるのを避けるため、supabaseAdmin.auth.admin.createUser などを使い
    // 匿名ユーザーや擬似ユーザーを作成する手もあるが、
    // 今回は「Custom JWT」方針なので、JWT Secretが必須不可欠。
    // しかし、ユーザーは既にEnvを設定済みと言っている。
    // おそらくJWT Secretは設定されていない。

    // 回避策: supabase-js の機能で sign できないか？ -> できない。
    // 結論: SUPABASE_JWT_SECRET が必要。

    // ここはプレースホルダーとしてエラーを出すか、Service Role Keyから抽出を試みる（危険）。
    // 安全策として、環境変数不足のエラーを投げる実装にする。
    // ※ただし、ユーザーが「もうあるよ」と言ったのは URL/ANON/SERVICE の3つ。

    // HACK: 多くの解説記事で "SUPABASE_JWT_SECRET" を使っている。
    // もし設定されていなければ機能しない。
    // ここでは `process.env.SUPABASE_JWT_SECRET` を参照し、なければエラーにする。

    const secret = process.env.SUPABASE_JWT_SECRET;
    if (!secret) {
        throw new Error("SUPABASE_JWT_SECRET is not set. Please add it to .env");
    }

    return jwt.sign(payload, secret);
}
