import { Context, Next } from "hono";
import { db } from "../db";
import { apiKeys } from "../schema";
import { eq } from "drizzle-orm";

export const authMiddleware = async (c: Context, next: Next) => {
    const authHeader = c.req.header("Authorization");
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
        return c.json({ error: "Unauthorized" }, 401);
    }

    const token = authHeader.split(" ")[1];

    try {
        const keyRecord = await db.query.apiKeys.findFirst({
            where: eq(apiKeys.key, token),
        });

        if (!keyRecord) {
            return c.json({ error: "Unauthorized: Invalid token" }, 401);
        }

        // Pass permissions or ownerId to context if needed
        c.set("permissions", keyRecord.permissions);
        c.set("ownerId", keyRecord.ownerId);

        await next();
    } catch (error) {
        console.error("Auth Error:", error);
        return c.json({ error: "Internal Server Error" }, 500);
    }
};
