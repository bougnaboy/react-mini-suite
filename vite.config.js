// import { defineConfig } from "vite";
// import react from "@vitejs/plugin-react";

// // https://vite.dev/config/
// export default defineConfig({
//     base: "/freelance-apps-hub/",
//     plugins: [react()],
// });

import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { execSync } from "node:child_process";

function lastCommitISO() {
    try {
        // e.g. 2025-09-26T18:28:57+05:30
        return execSync("git log -1 --format=%cI").toString().trim();
    } catch {
        // Fallback if git history isn't available (e.g., online sandboxes)
        return new Date().toISOString();
    }
}

export default defineConfig({
    plugins: [react()],
    base: "/freelance-apps-hub/",
    define: {
        __APP_BUILD_ISO__: JSON.stringify(new Date().toISOString()),
        __APP_COMMIT_ISO__: JSON.stringify(lastCommitISO()),
    },
    build: {
        sourcemap: false, // disable prod source maps
    },
    css: {
        devSourcemap: false, // disable CSS source maps in dev
    },
});
