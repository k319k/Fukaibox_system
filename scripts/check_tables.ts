import { db } from "@/lib/db";
import { sql } from "drizzle-orm";

async function main() {
    console.log("Checking tables...");
    const tables = await db.run(sql`SELECT name FROM sqlite_master WHERE type='table'`);
    console.log("Tables:", JSON.stringify(tables, null, 2));

    console.log("Checking indices...");
    const indices = await db.run(sql`SELECT name, tbl_name FROM sqlite_master WHERE type='index'`);
    console.log("Indices:", JSON.stringify(indices, null, 2));

    console.log("Checking user jji... existence...");
    const user = await db.run(sql`SELECT * FROM users WHERE id = 'jjiX0kbXmoBE2jo4x2NPFlsdn238HuWm'`);
    console.log("User found:", JSON.stringify(user, null, 2));

    console.log("Checking accounts for user...");
    const account = await db.run(sql`SELECT * FROM accounts WHERE user_id = 'jjiX0kbXmoBE2jo4x2NPFlsdn238HuWm'`);
    console.log("Account found:", JSON.stringify(account, null, 2));

    console.log("Checking accounts table info...");
    const tableInfo = await db.run(sql`PRAGMA table_info(accounts)`);
    console.log("Table Info:", JSON.stringify(tableInfo, null, 2));
}

main().catch(console.error);
