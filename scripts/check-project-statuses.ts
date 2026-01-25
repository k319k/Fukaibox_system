import "dotenv/config";
import { db } from "@/lib/db";
import { cookingProjects } from "@/lib/db/schema";
import { desc } from "drizzle-orm";

async function main() {
    const projects = await db.select().from(cookingProjects).orderBy(desc(cookingProjects.createdAt));
    console.log("Current Projects:");
    projects.forEach(p => {
        console.log(`- ID: ${p.id}, Title: ${p.title}, Status: ${p.status}, Created: ${p.createdAt}`);
    });
}

main();
