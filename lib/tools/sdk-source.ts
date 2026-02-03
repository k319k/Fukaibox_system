/**
 * The raw source code of the SDK to be injected into the iframe.
 * uses postMessage to communicate with the parent window.
 */
export const FUKAI_SDK_SOURCE = `
(function() {
    class FukaiClient {
        constructor() {
            this.pendingRequests = new Map();
            
            // Listen for responses from parent
            window.addEventListener('message', (event) => {
                const { requestId, success, data, error } = event.data;
                
                if (requestId && this.pendingRequests.has(requestId)) {
                    const { resolve, reject } = this.pendingRequests.get(requestId);
                    
                    if (success) {
                        resolve(data);
                    } else {
                        reject(new Error(error || 'Unknown error'));
                    }
                    
                    this.pendingRequests.delete(requestId);
                }
            });
        }

        /**
         * Send a message to the parent window and wait for response
         */
        request(action, payload) {
            return new Promise((resolve, reject) => {
                const requestId = crypto.randomUUID();
                this.pendingRequests.set(requestId, { resolve, reject });
                
                window.parent.postMessage({
                    requestId,
                    action,
                    payload
                }, '*'); // In production, targetOrigin should be restricted if possible
            });
        }
    }

    const client = new FukaiClient();

    // The Public SDK API
    window.fukai = {
        getUser: async () => {
            return client.request('GET_USER');
        },
        
        db: {
            get: async (collection, key) => {
                return client.request('DB_GET', { collection, key });
            },
            set: async (collection, key, value) => {
                return client.request('DB_SET', { collection, key, value });
            },
            query: async (collection, filter) => {
                return client.request('DB_QUERY', { collection, filter });
            }
        },

        realtime: {
            /**
             * Subscribe to a channel
             * @param {string} channelId 
             * @param {(event: any) => void} callback 
             */
            subscribe: async (channelId, callback) => {
                // Register callback locally
                // Note: In this simple implementation, we support one callback per channel for simplicity.
                // Or we can just use window.addEventListener('message') logic inside the client to dispatch events.
                
                // We'll use a custom event listener for realtime events from parent
                if (!window._fukaiRealtimeListeners) {
                    window._fukaiRealtimeListeners = new Map();
                    window.addEventListener('message', (event) => {
                         const { type, channelId: msgChannel, payload } = event.data;
                         if (type === 'REALTIME_EVENT' && window._fukaiRealtimeListeners.has(msgChannel)) {
                             window._fukaiRealtimeListeners.get(msgChannel)(payload);
                         }
                    });
                }
                window._fukaiRealtimeListeners.set(channelId, callback);

                return client.request('REALTIME_SUBSCRIBE', { channelId });
            },
            broadcast: async (channelId, event, payload) => {
                return client.request('REALTIME_BROADCAST', { channelId, event, payload });
            },
            track: async (channelId, state) => {
                return client.request('REALTIME_TRACK', { channelId, state });
            }
        }
    };
    
    console.log("[Fukai SDK] Initialized");

    // Stub disallowed libraries to prevent runtime errors
    const disallowed = [
        'createClient', 'supabase', 'firebase', 'initializeApp',
        'getFirestore', 'getAuth', 'getDatabase'
    ];
    
    disallowed.forEach(fn => {
        // @ts-ignore
        if (typeof window[fn] === 'undefined') {
            // @ts-ignore
            window[fn] = () => {
                console.error(\`[Security Violation] '\${fn}' is not allowed in this environment.\`);
                throw new Error(\`Security Violation: '\${fn}' is forbidden.\`);
            };
        }
    });

})();
`;
