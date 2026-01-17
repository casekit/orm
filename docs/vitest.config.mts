import { defineConfig } from "vitest/config";

export default defineConfig({
    test: {
        include: ["examples/**/*.test.ts"],
        globals: true,
        testTimeout: 30000,
        // Run test files sequentially to avoid parallel migration conflicts
        fileParallelism: false,
        // Run tests within a file sequentially
        sequence: {
            concurrent: false,
        },
    },
});
