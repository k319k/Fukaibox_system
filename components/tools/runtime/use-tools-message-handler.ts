import { useEffect, useRef } from "react";
import { useSession } from "@/lib/auth-client";
import { ToolsMessage, ToolsResponse } from "@/types/tools";
import { handleToolsDbAction, getToolsUserInfo } from "@/app/actions/tools";
import { mintSupabaseToken } from "@/app/actions/tools-data";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";
import { RealtimeChannel, SupabaseClient } from "@supabase/supabase-js";

export function useToolsMessageHandler(appId: string) {
    const { data: session } = useSession();
    const supabaseRef = useRef<SupabaseClient | null>(null);
    const channelsRef = useRef<Map<string, RealtimeChannel>>(new Map());

    // Initialize Supabase with Custom JWT
    useEffect(() => {
        let mounted = true;

        const initSupabase = async () => {
            // 1. Get Minted Token
            let token: string | null = null;
            if (session?.user) {
                token = await mintSupabaseToken();
            }

            if (!mounted) return;

            // 2. Create Client
            const client = createSupabaseBrowserClient(token || undefined);
            supabaseRef.current = client;
            console.log("[Tools Runtime] Supabase Client Initialized", { authenticated: !!token });
        };

        if (session !== undefined) { // Wait for session load (undefined check)
            initSupabase();
        }

        return () => {
            mounted = false;
            // Cleanup channels
            channelsRef.current.forEach(channel => channel.unsubscribe());
            channelsRef.current.clear();
        };
    }, [session, appId]);


    useEffect(() => {
        if (!appId) return;

        const handleMessage = async (event: MessageEvent) => {
            // Origin Check: We should ideally enforce this, but for now rely on Sandpack isolation.
            // If we knew the sandbox domain, we would check it here.

            const message = event.data as ToolsMessage;
            if (!message || !message.requestId || !message.action) return;

            const response: ToolsResponse = {
                requestId: message.requestId,
                success: false,
            };

            try {
                switch (message.action) {
                    case 'GET_USER':
                        // Use Server Action to get role-aware user info
                        const userInfo = await getToolsUserInfo();
                        if (userInfo) {
                            response.success = true;
                            response.data = userInfo;
                        } else {
                            response.error = "User info not found";
                        }
                        break;

                    case 'DB_GET':
                        try {
                            const result = await handleToolsDbAction(appId, 'get', message.payload);
                            response.success = true;
                            response.data = result;
                        } catch (err: any) {
                            response.error = err.message || "DB_GET failed";
                        }
                        break;

                    case 'DB_SET':
                        try {
                            await handleToolsDbAction(appId, 'set', message.payload);
                            response.success = true;
                        } catch (err: any) {
                            response.error = err.message || "DB_SET failed";
                        }
                        break;

                    case 'DB_QUERY':
                        try {
                            const result = await handleToolsDbAction(appId, 'query', message.payload);
                            response.success = true;
                            response.data = result;
                        } catch (err: any) {
                            response.error = err.message || "DB_QUERY failed";
                        }
                        break;

                    // --- Realtime ---

                    case 'REALTIME_SUBSCRIBE':
                        const { channelId } = message.payload;
                        if (!supabaseRef.current) {
                            throw new Error("Supabase client not initialized");
                        }

                        if (channelsRef.current.has(channelId)) {
                            response.success = true; // Already subscribed
                            break;
                        }

                        const channel = supabaseRef.current.channel(channelId);

                        // Setup listeners to relay to iframe
                        channel
                            .on('broadcast', { event: '*' }, (payload) => {
                                if (event.source) {
                                    (event.source as WindowProxy).postMessage({
                                        type: 'REALTIME_EVENT',
                                        channelId,
                                        payload: payload // { event, payload, type: 'broadcast' }
                                    }, { targetOrigin: event.origin });
                                }
                            })
                            .on('presence', { event: '*' }, (payload) => {
                                if (event.source) {
                                    (event.source as WindowProxy).postMessage({
                                        type: 'REALTIME_EVENT',
                                        channelId,
                                        payload // presence event
                                    }, { targetOrigin: event.origin });
                                }
                            })
                            .subscribe((status) => {
                                if (status === 'SUBSCRIBED') {
                                    // confirm subscription? The Promise handles the initial request return.
                                }
                            });

                        channelsRef.current.set(channelId, channel);
                        response.success = true;
                        break;

                    case 'REALTIME_BROADCAST':
                        const { channelId: bcChannelId, event: bcEvent, payload: bcPayload } = message.payload;
                        const bcChannel = channelsRef.current.get(bcChannelId);
                        if (!bcChannel) throw new Error("Channel not subscribed");

                        await bcChannel.send({
                            type: 'broadcast',
                            event: bcEvent,
                            payload: bcPayload
                        });
                        response.success = true;
                        break;

                    case 'REALTIME_TRACK':
                        const { channelId: trChannelId, state } = message.payload;
                        const trChannel = channelsRef.current.get(trChannelId);
                        if (!trChannel) throw new Error("Channel not subscribed");

                        await trChannel.track(state);
                        response.success = true;
                        break;

                    default:
                        response.error = "Unknown action: " + message.action;
                }
            } catch (e: any) {
                console.error("Tools SDK Error:", e);
                response.error = e.message;
            }

            // Send response back
            if (event.source) {
                (event.source as WindowProxy).postMessage(response, { targetOrigin: event.origin });
            }
        };

        window.addEventListener('message', handleMessage);
        return () => window.removeEventListener('message', handleMessage);
    }, [appId, session]); // Re-run if session changes (re-init Supabase)
}
