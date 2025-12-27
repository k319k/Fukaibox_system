import { useLoaderData } from "react-router";
import { createClient } from "@libsql/client/web";

export const loader = async ({ context }: any) => {
    const env = context.cloudflare.env;
    const url = env.TURSO_DATABASE_URL;
    const token = env.TURSO_AUTH_TOKEN;

    const debugInfo = {
        turso_url_exists: !!url,
        turso_url_masked: url ? url.replace(/:[^:]*@/, ":***@") : "MISSING",
        turso_token_exists: !!token,
        turso_token_length: token ? token.length : 0,
        turso_token_start: token ? token.substring(0, 5) + "..." : "N/A",
    };

    let connectionStatus = "PENDING";
    let connectError = null;
    let pingResult = null;

    try {
        // Attempt standard connection
        const client = createClient({
            url: url ? url.replace("libsql://", "https://") : "",
            authToken: token,
        });

        // Try simplest possible query
        pingResult = await client.execute("SELECT 1");
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

    // Return plain object for useLoaderData
    return {
        status: connectionStatus,
        env: debugInfo,
        error: connectError,
        pingResult
    };
};

export default function Debug() {
    const data = useLoaderData();

    return (
        <div style={{ fontFamily: "system-ui, sans-serif", lineHeight: "1.4", padding: "20px", color: "white", background: "#111", minHeight: "100vh" }}>
            <h1>Database Connection Debugger</h1>
            <p>This page tests the connection to Turso from Cloudflare Workers.</p>

            <div style={{ marginTop: "20px", padding: "10px", border: "1px solid #333", borderRadius: "5px" }}>
                <h3>Status: <span style={{ color: data.status === "SUCCESS" ? "#4caf50" : "#f44336" }}>{data.status}</span></h3>

                <h4>Environment Variables</h4>
                <pre style={{ background: "#222", padding: "10px", overflow: "auto" }}>
                    {JSON.stringify(data.env, null, 2)}
                </pre>

                {data.error && (
                    <>
                        <h4 style={{ color: "#f44336" }}>Connection Error</h4>
                        <pre style={{ background: "#300", padding: "10px", overflow: "auto" }}>
                            {JSON.stringify(data.error, null, 2)}
                        </pre>
                    </>
                )}

                {data.pingResult && (
                    <>
                        <h4 style={{ color: "#4caf50" }}>Ping Result</h4>
                        <pre style={{ background: "#030", padding: "10px", overflow: "auto" }}>
                            {JSON.stringify(data.pingResult, null, 2)}
                        </pre>
                    </>
                )}
            </div>
        </div>
    );
}
