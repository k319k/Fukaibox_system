import { readFileSync, writeFileSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));

const authHelper = `
// Inline auth helper to avoid importing session.server at module level
async function getAuthenticatedUser(request: Request, env: any) {
  const { getSession } = await import("~/services/session.server");
  const session = await getSession(request.headers.get("Cookie") || "");
  const userId = session.get("userId");
  
  if (!userId) {
    throw new Response("Unauthorized", { status: 401 });
  }
  
  const { createDb } = await import("~/db/client.server");
  const db = createDb(env);
  const user = await db.query.users.findFirst({
    where: (users, { eq }) => eq(users.id, userId),
  });
  
  if (!user) {
    throw new Response("User not found", { status: 401 });
  }
  
  return user;
}`;

const gichoHelper = `
// Inline GICHO check helper
async function requireGicho(request: Request, env: any) {
  const user = await getAuthenticatedUser(request, env);
  if (!user.isGicho) {
    throw new Response("Forbidden - GICHO only", { status: 403 });
  }
  return user;
}`;

const files = [
    {
        path: "app/routes/api.api-keys.$id.ts",
        needsAuth: true,
        needsGicho: false,
    },
    {
        path: "app/routes/api.api-keys.ts",
        needsAuth: true,
        needsGicho: false,
    },
    {
        path: "app/routes/api.images.$id.ts",
        needsAuth: true,
        needsGicho: false,
    },
    {
        path: "app/routes/api.images.$sheetId.upload.ts",
        needsAuth: true,
        needsGicho: false,
    },
    {
        path: "app/routes/api.sections.$id.ts",
        needsAuth: true,
        needsGicho: false,
    },
    {
        path: "app/routes/api.sheets.$id.ts",
        needsAuth: true,
        needsGicho: false,
    },
    {
        path: "app/routes/api.sheets.$sheetId.sections.ts",
        needsAuth: true,
        needsGicho: false,
    },
    {
        path: "app/routes/api.tools.$id.ts",
        needsAuth: true,
        needsGicho: false,
    },
    {
        path: "app/routes/api.tools.ts",
        needsAuth: true,
        needsGicho: false,
    },
];

let count = 0;

for (const fileInfo of files) {
    const filePath = join(__dirname, "..", fileInfo.path);
    let content = readFileSync(filePath, "utf-8");

    // Remove the import line
    content = content.replace(
        /import { requireUser(?:, requireGicho)? } from "~\/services\/session\.server";?\r?\n/,
        ""
    );

    // Find where to insert helpers (after imports, before first export)
    const firstExportMatch = content.match(/\r?\nexport (async )?function/);
    if (firstExportMatch) {
        const insertPos = firstExportMatch.index;
        let helpers = authHelper;
        if (fileInfo.needsGicho) {
            helpers += "\n" + gichoHelper;
        }
        content = content.slice(0, insertPos) + "\n" + helpers + content.slice(insertPos);
    }

    // Replace requireUser(request) with await getAuthenticatedUser(request, env)
    content = content.replace(/requireUser\(request\)/g, "await getAuthenticatedUser(request, env)");
    content = content.replace(/requireGicho\(request\)/g, "await requireGicho(request, env)");

    writeFileSync(filePath, content, "utf-8");
    console.log(`✅ Fixed ${fileInfo.path}`);
    count++;
}

console.log(`\n✨ Fixed ${count} files`);
