
import "dotenv/config";
import { db } from "../lib/db";
import { sql } from "drizzle-orm";

const TEST_KEY = "test_key_verification_" + Date.now();
const USER_ID = "test_user_verification";
const API_URL = "http://localhost:3001";

async function verify() {
    console.log("Starting Phase 7 Verification...");

    // 0. Insert Dummy User
    try {
        await db.run(sql`
            INSERT INTO users (id, name, email, created_at, updated_at)
            VALUES (${USER_ID}, 'Test User', 'test@example.com', ${Date.now()}, ${Date.now()})
        `);
        console.log("Dummy user inserted.");
    } catch (e) {
        console.error("Failed to insert dummy user:", e);
        return;
    }

    // 1. Insert Test Key
    try {
        await db.run(sql`
            INSERT INTO api_keys (id, key, owner_id, name, permissions, created_at)
            VALUES (${TEST_KEY}, ${TEST_KEY}, ${USER_ID}, 'Test Key', 'all', ${Date.now()})
        `);
        console.log("Test key inserted.");
    } catch (e) {
        console.error("Failed to insert test key:", e);
        return;
    }

    try {
        // Wait for server to start
        await new Promise(resolve => setTimeout(resolve, 2000));

        // Health
        try {
            const health = await fetch(`${API_URL}/health`).then(r => r.json());
            console.log("Health Check:", health);
        } catch (e) {
            console.error("Health check failed. Is server running?");
            throw e;
        }

        // Add Points
        const addRes = await fetch(`${API_URL}/points/add`, {
            method: "POST",
            headers: {
                "Authorization": `Bearer ${TEST_KEY}`,
                "Content-Type": "application/json"
            },
            body: JSON.stringify({ userId: USER_ID, amount: 100, reason: "Test Points" })
        });
        console.log("Add Points:", await addRes.json());

        // Get Points
        const getRes = await fetch(`${API_URL}/points/${USER_ID}`, {
            headers: { "Authorization": `Bearer ${TEST_KEY}` }
        });
        console.log("Get Points:", await getRes.json());

        // Get Rank
        const rankRes = await fetch(`${API_URL}/rank/user/${USER_ID}`, {
            headers: { "Authorization": `Bearer ${TEST_KEY}` }
        });
        console.log("Get Rank:", await rankRes.json());

    } catch (e) {
        console.error("Verification failed:", e);
    } finally {
        // Cleanup
        await db.run(sql`DELETE FROM api_keys WHERE key = ${TEST_KEY}`);
        await db.run(sql`DELETE FROM point_history WHERE user_id = ${USER_ID}`);
        await db.run(sql`DELETE FROM user_points WHERE user_id = ${USER_ID}`);
        await db.run(sql`DELETE FROM users WHERE id = ${USER_ID}`);
        console.log("Cleanup done.");
    }
}

verify();
