import {
  isRouteErrorResponse,
  Links,
  Meta,
  Outlet,
  Scripts,
  ScrollRestoration,
  useLoaderData,
} from "react-router";
import { ConfigProvider, App as AntApp, theme } from "antd";
import jaJP from "antd/locale/ja_JP";

import type { Route } from "./+types/root";
import Layout from "./components/Layout";
import { getSession } from "./services/session.server";
import "./app.css";

// Root loader to provide user session data
export async function loader({ request }: Route.LoaderArgs) {
  const session = getSession(request);
  return {
    user: session.user,
    isLoggedIn: !!session.user,
    isGicho: session.user?.isGicho || false,
  };
}

// Ant Design dark theme configuration
const antdTheme = {
  token: {
    colorPrimary: "#722ed1",
    colorBgBase: "#141414",
    colorTextBase: "#ffffff",
    borderRadius: 8,
    fontFamily: "'Noto Sans JP', 'Inter', -apple-system, BlinkMacSystemFont, sans-serif",
  },
  algorithm: theme.darkAlgorithm,
};

export const links: Route.LinksFunction = () => [
  { rel: "preconnect", href: "https://fonts.googleapis.com" },
  {
    rel: "preconnect",
    href: "https://fonts.gstatic.com",
    crossOrigin: "anonymous",
  },
  {
    rel: "stylesheet",
    href: "https://fonts.googleapis.com/css2?family=Noto+Sans+JP:wght@400;500;700&family=Inter:wght@400;500;700&display=swap",
  },
];

export function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ja">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <meta name="description" content="封解Box - 共同作業プラットフォーム" />
        <title>封解Box</title>
        <Meta />
        <Links />
      </head>
      <body>
        {children}
        <ScrollRestoration />
        <Scripts />
      </body>
    </html>
  );
}

// Export as Layout for React Router
export { RootLayout as Layout };

export default function App() {
  const { user, isLoggedIn, isGicho } = useLoaderData<typeof loader>();

  return (
    <ConfigProvider locale={jaJP} theme={antdTheme}>
      <AntApp>
        <Layout user={user} isLoggedIn={isLoggedIn} isGicho={isGicho}>
          <Outlet />
        </Layout>
      </AntApp>
    </ConfigProvider>
  );
}

export function ErrorBoundary({ error }: Route.ErrorBoundaryProps) {
  let message = "エラーが発生しました";
  let details = "予期しないエラーが発生しました。";
  let stack: string | undefined;

  if (isRouteErrorResponse(error)) {
    message = error.status === 404 ? "404 - ページが見つかりません" : "エラー";
    details =
      error.status === 404
        ? "お探しのページは存在しません。"
        : error.statusText || details;
  } else if (error && error instanceof Error) {
    // Show error details even in production for debugging
    details = error.message;
    stack = error.stack;
  }

  return (
    <ConfigProvider locale={jaJP} theme={antdTheme}>
      <main style={{ padding: "2rem", maxWidth: "800px", margin: "0 auto", minHeight: "100vh", background: "#141414", color: "#fff" }}>
        <h1>{message}</h1>
        <p>{details}</p>
        {stack && (
          <pre style={{ overflow: "auto", padding: "1rem", background: "#1f1f1f", borderRadius: 8 }}>
            <code>{stack}</code>
          </pre>
        )}
      </main>
    </ConfigProvider>
  );
}
