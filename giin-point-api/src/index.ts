
import { Hono } from "hono";
import { cors } from "hono/cors";
import { serve } from "@hono/node-server";
import { db } from "./db";
import { authMiddleware } from "./middleware/auth";

const app = new Hono();

app.use("*", cors());

// Health Check (Public)
app.get("/", (c) => c.text("Giin Point API is running!"));
app.get("/health", (c) => c.json({ status: "ok" }));

// Protected Routes
app.use("/points/*", authMiddleware);
app.use("/rank/*", authMiddleware);

// Get Points
app.get("/points/:userId", async (c) => {
    const userId = c.req.param("userId");
    try {
        const rs = await db.execute({
            sql: "SELECT points FROM user_points WHERE user_id = ?",
            args: [userId]
        });
        const points = rs.rows.length > 0 ? rs.rows[0].points : 0;
        return c.json({ userId, points });
    } catch (e) {
        console.error(e);
        return c.json({ error: "Failed to fetch points" }, 500);
    }
});

// Update Points (Admin/System)
app.post("/points/add", async (c) => {
    try {
        const body = await c.req.json();
        const { userId, amount, reason } = body;

        if (!userId || typeof amount !== 'number' || !reason) {
            return c.json({ error: "Invalid body" }, 400);
        }

        const now = Date.now();

        // Upsert user_points
        const check = await db.execute({
            sql: "SELECT * FROM user_points WHERE user_id = ?",
            args: [userId]
        });

        if (check.rows.length === 0) {
            await db.execute({
                sql: "INSERT INTO user_points (id, user_id, points, created_at, updated_at) VALUES (?, ?, ?, ?, ?)",
                args: [crypto.randomUUID(), userId, amount, now, now]
            });
        } else {
            await db.execute({
                sql: "UPDATE user_points SET points = points + ?, updated_at = ? WHERE user_id = ?",
                args: [amount, now, userId]
            });
        }

        // Add history
        await db.execute({
            sql: "INSERT INTO point_history (id, user_id, amount, reason, created_at) VALUES (?, ?, ?, ?, ?)",
            args: [crypto.randomUUID(), userId, amount, reason, now]
        });

        return c.json({ success: true, userId, amount });
    } catch (e) {
        console.error(e);
        return c.json({ error: "Transaction failed" }, 500);
    }
});

// Get Rank
app.get("/rank/user/:userId", async (c) => {
    const userId = c.req.param("userId");
    try {
        const userPointsRs = await db.execute({
            sql: "SELECT points FROM user_points WHERE user_id = ?",
            args: [userId]
        });

        if (userPointsRs.rows.length === 0) {
            return c.json({ rank: null, points: 0 });
        }

        const myPoints = userPointsRs.rows[0].points as number;

        const rankRs = await db.execute({
            sql: "SELECT count(*) as count FROM user_points WHERE points > ?",
            args: [myPoints]
        });

        const rank = (rankRs.rows[0].count as number) + 1;
        return c.json({ userId, points: myPoints, rank });
    } catch (e) {
        console.error(e);
        return c.json({ error: "Failed to fetch rank" }, 500);
    }
});

const port = 3001;
console.log(`Server is running on port ${port}`);

serve({
    fetch: app.fetch,
    port
});
