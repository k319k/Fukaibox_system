import "dotenv/config";
import { db } from "@/lib/db";
import { cookingProjects } from "@/lib/db/schema";
import { eq } from "drizzle-orm";

async function main() {
    const projectId = "9b10d689-601d-4d9c-87a3-b2d82364dd2d"; // ID found in previous step
    console.log(`Updating status for project ${projectId}...`);

    try {
        await db.update(cookingProjects)
            .set({ status: "image_upload" })
            .where(eq(cookingProjects.id, projectId));
        console.log("Status updated to image_upload");

        const p = await db.query.cookingProjects.findFirst({
            where: eq(cookingProjects.id, projectId)
        });
        console.log("New Status:", p?.status);

        // Revert ensuring testing consistency if needed, but for now leave it to see if it fixes User issue?
        // No, revert it to avoid confusing the user on that specific project.
        await db.update(cookingProjects)
            .set({ status: "cooking" })
            .where(eq(cookingProjects.id, projectId));
        console.log("Reverted status to cooking");

    } catch (error) {
        console.error("Update failed:", error);
    }
}

main();
