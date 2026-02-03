import { Hono } from "hono";
import { cors } from "hono/cors";
import { authMiddleware } from "./middleware/auth";
import { db } from "./db";
import { userPoints, pointHistory } from "./schema";
import { eq, sql } from "drizzle-orm";

const app = new Hono();

app.use("/*", cors());

// Health Check
app.get("/", (c) => c.text("Giin Point API is running (Vercel Postgres - Standalone)"));
app.get("/health", (c) => c.json({ status: "ok" }));

// Get Points (Protected)
app.get("/points/:userId", authMiddleware, async (c) => {
    const userId = c.req.param("userId");
    try {
        const user = await db.query.userPoints.findFirst({
            where: eq(userPoints.userId, userId),
        });
        return c.json({ points: user?.points || 0 });
    } catch (e) {
        console.error(e);
        return c.json({ error: "Failed to fetch points" }, 500);
    }
});

// Add/Subtract Points (Protected)
app.post("/points/add", authMiddleware, async (c) => {
    const { userId, amount, reason } = await c.req.json();

    if (!userId || typeof amount !== "number" || !reason) {
        return c.json({ error: "Invalid input" }, 400);
    }

    try {
        // Transaction to update points and add history
        await db.transaction(async (tx) => {
            // 1. Get current points to calculate new total
            const existingUser = await tx.query.userPoints.findFirst({
                where: eq(userPoints.userId, userId)
            });

            const currentPoints = existingUser?.points || 0;
            const newPoints = currentPoints + amount;

            // 2. Upsert user_points
            await tx
                .insert(userPoints)
                .values({
                    userId,
                    points: newPoints,
                    updatedAt: new Date(),
                })
                .onConflictDoUpdate({
                    target: userPoints.userId,
                    set: { points: newPoints, updatedAt: new Date() },
                });

            // 3. Add History
            await tx.insert(pointHistory).values({
                userId,
                amount,
                reason,
            });
        });

        return c.json({ success: true, message: "Points updated" });
    } catch (e) {
        console.error(e);
        return c.json({ error: "Failed to update points" }, 500);
    }
});

// Get Rank (Protected)
app.get("/rank/user/:userId", authMiddleware, async (c) => {
    const userId = c.req.param("userId");
    try {
        // Rank is (count of users with more points) + 1
        const currentUser = await db.query.userPoints.findFirst({
            where: eq(userPoints.userId, userId)
        });

        if (!currentUser) {
            return c.json({ rank: -1, points: 0 }); // Not ranked
        }

        // Count users with more points
        const result = await db.execute(
            sql`SELECT COUNT(*) as count FROM ${userPoints} WHERE ${userPoints.points} > ${currentUser.points}`
        );

        const higherRankCount = Number(result.rows[0].count);
        return c.json({ rank: higherRankCount + 1, points: currentUser.points });

    } catch (e) {
        console.error(e);
        return c.json({ error: "Failed to fetch rank" }, 500);
    }
});

export default app;
