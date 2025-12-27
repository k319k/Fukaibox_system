import { copyFileSync, existsSync, mkdirSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";
import { execSync } from "child_process";

const __dirname = dirname(fileURLToPath(import.meta.url));
const rootDir = join(__dirname, "..");
const clientDir = join(rootDir, "build", "client");
const serverFile = join(rootDir, "build", "server", "index.js");
const workerFile = join(clientDir, "_worker.js");

console.log("🚀 Starting Cloudflare Pages build...");

try {
    // Run the standard build
    execSync("npm run build", { stdio: "inherit", cwd: rootDir });

    // Ensure client dir exists (it should after build)
    if (!existsSync(clientDir)) {
        console.error("❌ build/client directory not found!");
        process.exit(1);
    }

    // Copy server/index.js to client/_worker.js
    if (existsSync(serverFile)) {
        console.log("📦 Copying worker file...");
        copyFileSync(serverFile, workerFile);
        console.log("✅ Copied build/server/index.js to build/client/_worker.js");
    } else {
        console.error("❌ build/server/index.js not found!");
        process.exit(1);
    }

    console.log("✨ Build complete and ready for Cloudflare Pages!");
} catch (error) {
    console.error("❌ Build failed:", error);
    process.exit(1);
}
