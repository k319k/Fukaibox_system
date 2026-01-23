import { db } from "../giin-point-api/src/db";
import { apiKeys } from "../giin-point-api/src/schema";
import * as dotenv from "dotenv";
import path from "path";

// Load environment variables from giin-point-api/.env
dotenv.config({ path: path.resolve(__dirname, "../giin-point-api/.env") });

async function main() {
    const specificKey = "sk_live_giin_point_api_v1_secure_key_8823"; // Deterministic for easy sharing

    console.log(`Registering Key: ${specificKey}`);

    try {
        await db.insert(apiKeys).values({
            key: specificKey,
            ownerId: "system-admin",
            name: "FakaiBox Main App (Manual)",
            permissions: "all",
        });

        console.log("✅ API Key Registered.");
        process.exit(0);
    } catch (error) {
        console.error("Failed:", error);
        process.exit(1);
    }
}

main();
