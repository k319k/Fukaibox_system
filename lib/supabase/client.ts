export function createSupabaseBrowserClient(accessToken?: string) {
    const options = accessToken ? {
        global: {
            headers: {
                Authorization: `Bearer ${accessToken}`,
            },
        },
    } : {};

    return createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        options
    );
}
