import { db } from "../giin-point-api/src/db";
import { apiKeys } from "../giin-point-api/src/schema";
import * as dotenv from "dotenv";
import path from "path";
import crypto from "crypto";

// Load environment variables from giin-point-api/.env
dotenv.config({ path: path.resolve(__dirname, "../giin-point-api/.env") });

async function main() {
    const newKey = crypto.randomBytes(32).toString('hex');

    console.log("Generating new API Key...");

    try {
        await db.insert(apiKeys).values({
            key: newKey,
            ownerId: "system-admin",
            name: "FakaiBox Main App",
            permissions: "read:points,write:points,read:rank",
        });

        console.log("\n✅ API Key Created Successfully!");
        console.log("-----------------------------------------");
        console.log(`Key: ${newKey}`);
        console.log("-----------------------------------------");
        console.log("\nPlease set this value as POINTS_API_SECRET in your .env file.");

        process.exit(0);
    } catch (error) {
        console.error("Failed to create key:", error);
        process.exit(1);
    }
}

main();
