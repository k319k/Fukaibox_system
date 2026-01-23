import { describe, it, before, after } from "node:test";
import assert from "node:assert";
import dotenv from "dotenv";
import path from "path";

// Load environment variables from giin-point-api/.env
dotenv.config({ path: path.resolve(__dirname, "../giin-point-api/.env") });

import { db } from "../giin-point-api/src/db";
import { apiKeys, userPoints, pointHistory } from "../giin-point-api/src/schema";
import { eq } from "drizzle-orm";

// Base URL of the running API (ensure your dev server is running on this port)
const API_URL = "http://localhost:3001";
const USER_ID = "test-user-verification";
let API_KEY = "";

// Helper to fetch
const fetchApi = async (path: string, options: RequestInit = {}) => {
    const headers = {
        ...options.headers,
        Authorization: `Bearer ${API_KEY}`,
        "Content-Type": "application/json",
    };
    return fetch(`${API_URL}${path}`, { ...options, headers });
};

describe("Giin Point API (Standalone)", () => {

    before(async () => {
        console.log("Setting up test environment...");
        // Create a temporary API key in the DB
        API_KEY = "test-verification-key-" + Date.now();

        try {
            await db.insert(apiKeys).values({
                key: API_KEY,
                ownerId: "system-test",
                name: "Verification Script",
                permissions: "all",
            });
            console.log("API Key created in DB");

            // Clean up any previous test data for this user
            await db.delete(userPoints).where(eq(userPoints.userId, USER_ID));
            await db.delete(pointHistory).where(eq(pointHistory.userId, USER_ID));
            console.log("Cleaned up old test data");
        } catch (e) {
            console.error("Setup failed. Check database connection:", e);
            process.exit(1);
        }
    });

    after(async () => {
        console.log("Tearing down test environment...");
        try {
            await db.delete(apiKeys).where(eq(apiKeys.key, API_KEY));
            await db.delete(userPoints).where(eq(userPoints.userId, USER_ID));
            await db.delete(pointHistory).where(eq(pointHistory.userId, USER_ID));
            console.log("Cleanup complete");
        } catch (e) {
            console.error("Teardown failed:", e);
        }
    });

    it("GET /health should return status ok", async () => {
        const res = await fetch(`${API_URL}/health`);
        assert.strictEqual(res.status, 200, "Health check failed");
        const data = await res.json();
        assert.strictEqual(data.status, "ok");
    });

    it("GET /points/:userId should return 0 for new user", async () => {
        const res = await fetchApi(`/points/${USER_ID}`);
        assert.strictEqual(res.status, 200, await res.text());
        const data = await res.json();
        assert.strictEqual(data.points, 0);
    });

    it("POST /points/add should add points", async () => {
        const res = await fetchApi("/points/add", {
            method: "POST",
            body: JSON.stringify({
                userId: USER_ID,
                amount: 100,
                reason: "Test points"
            })
        });
        assert.strictEqual(res.status, 200, await res.text());
        const data = await res.json();
        assert.strictEqual(data.success, true);
    });

    it("GET /points/:userId should return updated points", async () => {
        const res = await fetchApi(`/points/${USER_ID}`);
        const data = await res.json();
        assert.strictEqual(data.points, 100);
    });

    it("GET /rank/user/:userId should return rank", async () => {
        const res = await fetchApi(`/rank/user/${USER_ID}`);
        const data = await res.json();
        assert.ok(data.rank >= 1, "Rank should be >= 1");
        assert.strictEqual(data.points, 100);
    });
});
