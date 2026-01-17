/// <reference types="vitest" />
import "dotenv/config";
import tsconfigPaths from "vite-tsconfig-paths";
import { defineConfig } from "vitest/config";

export default defineConfig({
    plugins: [tsconfigPaths()],
    test: {
        include: ["**/*.(spec|test|properties).ts?(x)"],
        exclude: ["build", "node_modules"],
        restoreMocks: true,
        globals: true,
        setupFiles: ["dotenv/config"],
        onConsoleLog(_log: string, _type: "stdout" | "stderr"): void {
            // silence logs in tests
        },
    },
});
