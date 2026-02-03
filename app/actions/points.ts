"use server";

import { getCurrentUserWithRole } from "@/app/actions/auth";

const API_URL = process.env.POINTS_API_URL || "http://localhost:3001";
const API_SECRET = process.env.POINTS_API_SECRET;

async function fetchPointsApi(path: string, options: RequestInit = {}) {
    if (!API_SECRET) {
        throw new Error("POINTS_API_SECRET is not set");
    }

    const res = await fetch(`${API_URL}${path}`, {
        ...options,
        headers: {
            ...options.headers,
            "Authorization": `Bearer ${API_SECRET}`,
            "Content-Type": "application/json",
        },
    });

    if (!res.ok) {
        const errorText = await res.text();
        throw new Error(`API Error: ${res.status} ${res.statusText} - ${errorText}`);
    }

    // Health check returns text, others json
    const contentType = res.headers.get("content-type");
    if (contentType && contentType.includes("application/json")) {
        return res.json();
    }
    return res.text();
}

export async function checkPointsApiHealth() {
    try {
        const user = await getCurrentUserWithRole();
        if (user?.role !== "gicho") throw new Error("Unauthorized");

        return await fetchPointsApi("/health");
    } catch (e: any) {
        return { error: e.message };
    }
}

export async function getUserPoints(userId: string) {
    try {
        const user = await getCurrentUserWithRole();
        if (user?.role !== "gicho") throw new Error("Unauthorized");

        return await fetchPointsApi(`/points/${userId}`);
    } catch (e: any) {
        return { error: e.message };
    }
}

export async function manageUserPoints(targetUserId: string, amount: number, reason: string) {
    try {
        const user = await getCurrentUserWithRole();
        if (user?.role !== "gicho") throw new Error("Unauthorized");

        return await fetchPointsApi("/points/add", {
            method: "POST",
            body: JSON.stringify({ userId: targetUserId, amount, reason }),
        });
    } catch (e: any) {
        return { error: e.message };
    }
}

export async function getUserRank(targetUserId: string) {
    try {
        const user = await getCurrentUserWithRole();
        if (user?.role !== "gicho") throw new Error("Unauthorized");

        return await fetchPointsApi(`/rank/user/${targetUserId}`);
    } catch (e) {
        return { error: e instanceof Error ? e.message : "Unknown error" };
    }
}
