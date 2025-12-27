import { json, type LoaderFunctionArgs } from "@remix-run/cloudflare";
import { createClient } from "@libsql/client/web";

export const loader = async ({ context }: LoaderFunctionArgs) => {
    const env = context.cloudflare.env as any;
    const url = env.TURSO_DATABASE_URL;
    const token = env.TURSO_AUTH_TOKEN;

    const debugInfo = {
        turso_url_exists: !!url,
        turso_url_masked: url ? url.replace(/:[^:]*@/, ":***@") : "MISSING", // Mask password if present
        turso_token_exists: !!token,
        turso_token_length: token ? token.length : 0,
        turso_token_start: token ? token.substring(0, 5) + "..." : "N/A",
    };

    let connectionStatus = "PENDING";
    let connectError = null;

    try {
        // Attempt standard connection
        const client = createClient({
            url: url ? url.replace("libsql://", "https://") : "",
            authToken: token,
        });

        // Try simplest possible query
        await client.execute("SELECT 1");
        connectionStatus = "SUCCESS";
    } catch (e: any) {
        connectionStatus = "FAILED";
        connectError = {
            message: e.message,
            name: e.name,
            cause: e.cause,
            stack: e.stack,
        };
    }

    return json({
        status: connectionStatus,
        env: debugInfo,
        error: connectError,
    });
};

export default function Debug() {
    return (
        <div style={{ fontFamily: "system-ui, sans-serif", lineHeight: "1.4", padding: "20px" }}>
            <h1>Database Connection Debugger</h1>
            <p>This page tests the connection to Turso from Cloudflare Workers.</p>
            <pre id="debug-output">Loading...</pre>
            <script dangerouslySetInnerHTML={{
                __html: `
          fetch(window.location.href, { headers: { 'Accept': 'application/json' } })
            .then(res => res.json())
            .then(data => {
              document.getElementById('debug-output').textContent = JSON.stringify(data, null, 2);
            });
        `
            }} />
        </div>
    );
}
