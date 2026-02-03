'use server';

import { mintToolsToken } from "@/lib/supabase/admin";
import { auth } from "@/lib/auth"; // Better-Auth
import { db } from "@/lib/db";
import { userRoles } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { headers } from "next/headers";
import { createClient } from "@supabase/supabase-js";
import { env } from "@/lib/env";

/**
 * Get current user info including role for Tools SDK
 */
export async function getToolsUserInfo() {
    const session = await auth.api.getSession({
        headers: await headers()
    });

    if (!session || !session.user) {
        return null;
    }

    const roles = await db.select().from(userRoles).where(eq(userRoles.userId, session.user.id));
    const role = roles[0]?.role || "guest";

    return {
        id: session.user.id,
        name: session.user.name,
        role: role
    };
}

/**
 * Perform a DB operation on behalf of the user/app.
 */
export async function handleToolsDbAction(
    appId: string,
    action: 'get' | 'set' | 'query',
    payload: any
) {
    const session = await auth.api.getSession({
        headers: await headers()
    });

    if (!session || !session.user) {
        throw new Error("Unauthorized");
    }

    const userId = session.user.id;

    // 1. Mint Token
    // In a real scenario we'd cache this or pass it down, but minting is fast enough.
    const token = await mintToolsToken(userId, { appId, role: 'user' });

    // 2. Create Scoped Client
    const scopedClient = createClient(
        env.NEXT_PUBLIC_SUPABASE_URL,
        env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
        {
            global: {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            }
        }
    );

    // 3. Execute Operation
    const { collection, key, value } = payload;

    if (action === 'get') {
        const { data, error } = await scopedClient
            .from('tools_app_data')
            .select('data')
            .eq('collection', collection)
            .single();

        if (error && error.code !== 'PGRST116') { // PGRST116 = JSON 0 rows
            throw new Error(error.message);
        }

        if (!data) return null;
        return data.data[key];
    }

    if (action === 'set') {
        // Strategy: Fetch, Merge, Upsert.
        // Limitation: Race condition possible.
        // For v0.1: Read-Modify-Write is acceptable.

        const { data: existing } = await scopedClient
            .from('tools_app_data')
            .select('data')
            .eq('collection', collection)
            .single(); // Implicitly filtered by user_id & app_id via RLS

        const newData = existing ? { ...existing.data, [key]: value } : { [key]: value };

        const { error } = await scopedClient
            .from('tools_app_data')
            .upsert({
                app_id: appId,
                user_id: userId,
                collection: collection,
                data: newData
            }, {
                onConflict: 'app_id,user_id,collection' // Need Unique Constraint!
            });

        if (error) throw new Error(error.message);
        return true;
    }

    if (action === 'query') {
        // TODO: Implement sophisticated query
        return [];
    }
}
