// OpenNext configuration for Cloudflare Pages
// See: https://opennext.js.org/config
const config = {
    default: {
        override: {
            wrapper: "cloudflare-node",
            converter: "edge",
            incrementalCache: "dummy",
            tagCache: "dummy",
            queue: "dummy",
        },
    },
};

export default config;
