import { createRequestHandler } from "react-router";

declare module "react-router" {
  export interface AppLoadContext {
    cloudflare: {
      env: Env;
      ctx: ExecutionContext;
    };
  }
}

const requestHandler = createRequestHandler(
  () => import("virtual:react-router/server-build"),
  import.meta.env.MODE
);

export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);
    if (url.pathname.startsWith("/") && !url.pathname.startsWith("/api/") && !url.pathname.startsWith("/auth/")) {
      // Checking for static assets (like css, js, images)
      if (env.ASSETS) {
        try {
          const assetResponse = await env.ASSETS.fetch(request.clone());
          if (assetResponse.status < 400) {
            return assetResponse;
          }
        } catch (e) { }
      }
    }

    // Also try simpler check: Cloudflare Pages usually routes static assets BEFORE worker if configured.
    // But in Advanced Mode with _worker.js at root, it routes everything to worker.
    // We should fallback to assets if the route is not matched, OR check assets first for specific extensions.

    if (env.ASSETS) {
      // Try serving static asset first
      const assetResponse = await env.ASSETS.fetch(request.clone());
      if (assetResponse.status < 400) {
        return assetResponse;
      }
    }

    return requestHandler(request, {
      cloudflare: { env, ctx },
    });
  },
} satisfies ExportedHandler<Env>;
