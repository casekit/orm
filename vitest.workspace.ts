import "dotenv/config";
import tsconfigPaths from "vite-tsconfig-paths";
import { defineWorkspace } from "vitest/config";

export default defineWorkspace([
    "packages/*",
    "examples/*",
    {
        plugins: [tsconfigPaths()],
        test: {
            include: ["packages/**/*.(spec|test|properties).ts?(x)"],
            exclude: [
                "packages/*/build",
                "**/node_modules/**",
                "**/vitest.config.ts",
            ],
            restoreMocks: true,
            globals: true,
            setupFiles: ["dotenv/config"],
        },
    },
]);
