import type { AppLoadContext, EntryContext } from "react-router";
import { ServerRouter } from "react-router";
import { isbot } from "isbot";
import { renderToString } from "react-dom/server";
import { createCache, extractStyle, StyleProvider } from "@ant-design/cssinjs";

export default async function handleRequest(
  request: Request,
  responseStatusCode: number,
  responseHeaders: Headers,
  routerContext: EntryContext,
  _loadContext: AppLoadContext
) {
  const userAgent = request.headers.get("user-agent");

  // Create Ant Design style cache for SSR
  const cache = createCache();

  // Render the app with StyleProvider
  const html = renderToString(
    <StyleProvider cache={cache}>
      <ServerRouter context={routerContext} url={request.url} />
    </StyleProvider>
  );

  // Extract styles from cache
  const styleText = extractStyle(cache);

  // Inject styles into head
  const finalHtml = html.replace(
    "</head>",
    `<style id="antd-ssr">${styleText}</style></head>`
  );

  // For bots or SPA mode, ensure all content is ready
  if ((userAgent && isbot(userAgent)) || routerContext.isSpaMode) {
    // Already using renderToString which is synchronous
  }

  responseHeaders.set("Content-Type", "text/html");
  return new Response(`<!DOCTYPE html>${finalHtml}`, {
    headers: responseHeaders,
    status: responseStatusCode,
  });
}
