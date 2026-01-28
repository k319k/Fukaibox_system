import { useEffect } from "react";
import { useSession } from "@/lib/auth-client"; // Better-Auth hook
import { ToolsMessage, ToolsResponse, ToolsUser } from "@/types/tools";
import { handleToolsDbAction, getToolsUserInfo } from "@/app/actions/tools";

export function useToolsMessageHandler(appId: string) {
    const { data: session } = useSession();

    useEffect(() => {
        if (!appId || !session) return;

        const handleMessage = async (event: MessageEvent) => {
            // Origin check: For now allow * but rely on iframe source check implicit in mechanism

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

                    default:
                        response.error = "Unknown action";
                }
            } catch (e: any) {
                console.error("Tools SDK Error:", e);
                response.error = e.message;
            }

            // Send response back
            // event.source is the window that sent the message (the iframe)
            if (event.source) {
                (event.source as WindowProxy).postMessage(response, { targetOrigin: event.origin });
            }
        };

        window.addEventListener('message', handleMessage);
        return () => window.removeEventListener('message', handleMessage);
    }, [appId, session]);
}
