// Health check API route
import type { Route } from "./+types/api.health";

// GET /api/health - Health check endpoint
export async function loader() {
    return Response.json({
        status: "healthy",
        version: "3.0.0",
        framework: "remix",
        features: ["discord_oauth", "tools", "api_keys", "public_api"],
    });
}
