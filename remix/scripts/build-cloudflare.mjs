import { copyFileSync, existsSync, readFileSync, writeFileSync } from "fs";
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

    // Sanitize generated wrangler.json if it exists
    const generatedWranglerConfig = join(clientDir, "wrangler.json");
    if (existsSync(generatedWranglerConfig)) {
        console.log("🧹 Sanitizing generated wrangler.json...");
        try {
            const content = readFileSync(generatedWranglerConfig, "utf-8");
            const config = JSON.parse(content);

            // Remove invalid fields for Pages
            const invalidFields = [
                "definedEnvironments",
                "secrets_store_secrets",
                "unsafe_hello_world",
                "worker_loaders",
                "ratelimits",
                "vpc_services",
                "python_modules"
            ];

            for (const field of invalidFields) {
                if (field in config) {
                    delete config[field];
                    console.log(`  - Removed ${field}`);
                }
            }

            // Check dev.enable_containers
            if (config.dev && config.dev.enable_containers !== undefined) {
                delete config.dev.enable_containers;
                console.log(`  - Removed dev.enable_containers`);
            }

            // Fix triggers if empty or invalid
            if (config.triggers && Object.keys(config.triggers).length === 0) {
                delete config.triggers;
                console.log(`  - Removed empty triggers`);
            }

            writeFileSync(generatedWranglerConfig, JSON.stringify(config, null, 2));
            console.log("✅ Sanitized build/client/wrangler.json");
        } catch (e) {
            console.warn("⚠️ Failed to sanitize wrangler.json:", e.message);
        }
    }

    console.log("✨ Build complete and ready for Cloudflare Pages!");
} catch (error) {
    console.error("❌ Build failed:", error);
    process.exit(1);
}
