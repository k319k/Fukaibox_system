import { createClient } from "@supabase/supabase-js";
import { env } from "@/lib/env";

export function createSupabaseBrowserClient(accessToken?: string) {
    const options = accessToken ? {
        global: {
            headers: {
                Authorization: `Bearer ${accessToken}`,
            },
        },
    } : {};

    return createClient(
        env.NEXT_PUBLIC_SUPABASE_URL!,
        env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        options
    );
}
