/**
 * User information structure exposed to the SDK
 */
export interface ToolsUser {
    id: string;
    name: string;
    role: string;
}

/**
 * Supported actions for the Tools SDK
 */
export type ToolsAction =
    | 'GET_USER'
    | 'DB_GET'
    | 'DB_SET'
    | 'DB_QUERY'
    | 'REALTIME_SUBSCRIBE'
    | 'REALTIME_BROADCAST'
    | 'REALTIME_TRACK';

/**
 * Message sent from Child (SDK) to Parent
 */
export interface ToolsMessage<T = any> {
    requestId: string;
    action: ToolsAction;
    payload?: T;
}

/**
 * payloads
 */
export interface DbGetPayload {
    collection: string;
    key: string;
}

export interface DbSetPayload {
    collection: string;
    key: string;
    value: any;
}

export interface DbQueryPayload {
    collection: string;
    filter: any; // Simplified filter object
}

/**
 * Response sent from Parent to Child (SDK)
 */
export interface ToolsResponse<T = any> {
    requestId: string;
    success: boolean;
    data?: T;
    error?: string;
}
