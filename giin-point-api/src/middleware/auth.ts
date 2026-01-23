
import { Context, Next } from "hono";
import { db } from "../db";

export const authMiddleware = async (c: Context, next: Next) => {
    const authHeader = c.req.header("Authorization");
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
        return c.json({ error: "Unauthorized" }, 401);
    }

    const token = authHeader.split(" ")[1];

    try {
        const rs = await db.execute({
            sql: "SELECT * FROM api_keys WHERE key = ?",
            args: [token]
        });

        if (rs.rows.length === 0) {
            return c.json({ error: "Invalid API Key" }, 403);
        }

        // Optional: Check permissions or expiration here

        await next();
    } catch (e) {
        console.error("Auth Error:", e);
        return c.json({ error: "Auth Check Failed" }, 500);
    }
};
