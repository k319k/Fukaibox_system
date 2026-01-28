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
        }
    };
    
    console.log("[Fukai SDK] Initialized");
})();
`;
