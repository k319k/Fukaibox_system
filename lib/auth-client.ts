import { createAuthClient } from "better-auth/react";

// クライアントサイドでは現在のオリジンを使用（ローカル開発時はlocalhost、本番では本番URL）
const getBaseURL = () => {
    if (typeof window !== "undefined") {
        return window.location.origin;
    }
    return process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
};

export const authClient = createAuthClient({
    baseURL: getBaseURL(),
});

export const {
    signIn,
    signUp,
    signOut,
    useSession,
    getSession,
} = authClient;

