import { defineConfig } from "vite";
import tsconfigPaths from "vite-tsconfig-paths";
import { resolve, dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));

export default defineConfig({
    resolve: {
        alias: {
            "virtual:react-router/server-build": resolve(__dirname, "build/server/index.js"),
        },
    },
    build: {
        ssr: true,
        target: "esnext",
        outDir: "build/client",
        lib: {
            entry: "workers/app.ts",
            fileName: () => "_worker.js",
            formats: ["es"],
        },
        rollupOptions: {
            external: (id) => id.startsWith("cloudflare:"),
        },
        emptyOutDir: false,
        sourcemap: false,
        minify: false, // Cloudflare Pages has size limits but checking logic first
    },
    plugins: [tsconfigPaths()],
});
