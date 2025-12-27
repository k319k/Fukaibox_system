import { copyFileSync, existsSync, readFileSync, writeFileSync, renameSync, readdirSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";
import { execSync } from "child_process";

const __dirname = dirname(fileURLToPath(import.meta.url));
const rootDir = join(__dirname, "..");
const clientDir = join(rootDir, "build", "client");
const workerFile = join(clientDir, "_worker.js");

console.log("🚀 Starting Cloudflare Pages build...");

try {
    // 1. Run the standard React Router build
    console.log("📦 Running React Router build...");
    execSync("npm run build", { stdio: "inherit", cwd: rootDir });

    // Ensure client dir exists
    if (!existsSync(clientDir)) {
        console.error("❌ build/client directory not found!");
        process.exit(1);
    }

    // 2. Build the worker script using separate Vite config
    console.log("👷 Building worker script...");
    try {
        execSync("npx vite build -c vite.config.worker.ts", { stdio: "inherit", cwd: rootDir });

        // Check for generated worker file (might be app.js or similar)
        // We expect it to be built into build/client
        // Since we can't guarantee the name, let's look for a JS file that is NOT index-*.js or chunk-*.js
        // Actually, in lib mode with entry "workers/app.ts", it often outputs "app.js" or similar.

        const files = readdirSync(clientDir);
        const generatedWorker = files.find(f => f.endsWith(".js") && !f.startsWith("index-") && f !== "wrangler.json" && f !== "_worker.js");

        if (generatedWorker) {
            console.log(`found generated worker: ${generatedWorker}`);
            renameSync(join(clientDir, generatedWorker), workerFile);
            console.log(`✅ Renamed ${generatedWorker} to _worker.js`);
        } else if (existsSync(join(clientDir, "_worker.js"))) {
            console.log("✅ _worker.js already exists");
        } else {
            console.warn("⚠️ Could not locate generated worker file. Creating default export wrapper if possible...");
            // Fallback: if app.js exists (hardcoded check)
            if (existsSync(join(clientDir, "app.js"))) {
                renameSync(join(clientDir, "app.js"), workerFile);
            }
        }

    } catch (e) {
        console.error("❌ Worker build failed:", e.message);
        process.exit(1);
    }

    // 3. Sanitize generated wrangler.json if it exists
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
                "python_modules",
                "assets"
            ];

            for (const field of invalidFields) {
                if (field in config) {
                    delete config[field];
                    // console.log(`  - Removed ${field}`);
                }
            }

            // Check dev.enable_containers
            if (config.dev && config.dev.enable_containers !== undefined) {
                delete config.dev.enable_containers;
            }

            // Fix triggers if empty or invalid
            if (config.triggers && Object.keys(config.triggers).length === 0) {
                delete config.triggers;
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
