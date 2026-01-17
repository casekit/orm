/// <reference types="vitest" />
import "dotenv/config";
import tsconfigPaths from "vite-tsconfig-paths";
import { defineConfig } from "vitest/config";

export default defineConfig({
    plugins: [tsconfigPaths()],
    test: {
        silent: false,
        include: ["**/*.(spec|test|properties).ts?(x)"],
        exclude: ["build", "node_modules"],
        coverage: {
            provider: "v8",
            reporter: ["text", "json", "html", "json-summary"],
            exclude: ["build/**/*", "**/*.test-d.ts", "vitest.config.ts"],
            clean: true,
        },
        restoreMocks: true,
        globals: true,
        setupFiles: ["dotenv/config"],
    },
});
