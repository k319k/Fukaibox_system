import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

// 公開ルート（認証不要）
const publicRoutes = ["/login", "/register", "/"];

// 保護ルートと必要なロール
const protectedRoutes = [
    { path: "/kitchen", roles: ["giin", "meiyo_giin", "gicho"] },
    { path: "/youtube", roles: ["gicho"] },
    { path: "/dev-studio", roles: ["gicho"] },
    { path: "/admin", roles: ["gicho"] },
];

export async function proxy(request: NextRequest) {
    const { pathname } = request.nextUrl;

    // 公開ルートはスキップ
    if (publicRoutes.some((route) => pathname === route)) {
        return NextResponse.next();
    }

    // 静的ファイル、API、_nextはスキップ
    if (
        pathname.startsWith("/_next") ||
        pathname.startsWith("/api") ||
        pathname.includes(".")
    ) {
        return NextResponse.next();
    }

    // セッションチェック（better-authのクッキーをチェック）
    const sessionToken = request.cookies.get("better-auth.session_token");

    if (!sessionToken) {
        // 未ログインの場合、保護ルートならログインページへリダイレクト
        const isProtected = protectedRoutes.some((route) =>
            pathname.startsWith(route.path)
        );

        if (isProtected) {
            const url = request.nextUrl.clone();
            url.pathname = "/login";
            return NextResponse.redirect(url);
        }

        return NextResponse.next();
    }

    // ロールベースアクセス制御
    // Note: ミドルウェアでは簡易チェックのみ。詳細なチェックはServer Componentsで行う
    const matchedRoute = protectedRoutes.find((route) =>
        pathname.startsWith(route.path)
    );

    if (matchedRoute) {
        // ロールチェックは Server Components で行うため、ここでは通す
        // ミドルウェアではセッションの存在のみチェック
        return NextResponse.next();
    }

    return NextResponse.next();
}

export const config = {
    matcher: [
        /*
         * 以下を除く全てのパスにマッチ:
         * - api (APIルート)
         * - _next/static (静的ファイル)
         * - _next/image (画像最適化)
         * - favicon.ico (ファビコン)
         */
        "/((?!api|_next/static|_next/image|favicon.ico).*)",
    ],
};
