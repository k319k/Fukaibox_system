import { config } from "dotenv";
config();

// 直接 HTTP API を使用
const url = "https://fukai-box-k319.aws-ap-northeast-1.turso.io";
const authToken = process.env.TURSO_AUTH_TOKEN!;

async function main() {
    console.log("Testing HTTP API connection to:", url);

    try {
        // v3 pipeline API を使用
        const response = await fetch(`${url}/v3/pipeline`, {
            method: "POST",
            headers: {
                "Authorization": `Bearer ${authToken}`,
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                requests: [
                    {
                        type: "execute",
                        stmt: {
                            sql: "SELECT name FROM sqlite_master WHERE type='table'"
                        }
                    }
                ]
            })
        });

        console.log("Response status:", response.status);
        const text = await response.text();
        console.log("Response body:", text);
    } catch (e: any) {
        console.log("Error:", e.message);
    }
}

main();
