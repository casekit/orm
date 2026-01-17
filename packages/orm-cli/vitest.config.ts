/// <reference types="vitest" />
import "dotenv/config";
import tsconfigPaths from "vite-tsconfig-paths";
import { defineConfig } from "vitest/config";

export default defineConfig({
    plugins: [tsconfigPaths()],
    test: {
        include: ["**/*.(spec|test|properties).ts?(x)"],
        exclude: ["build", "node_modules"],
        coverage: {
            provider: "v8",
            reporter: ["text", "json", "html", "json-summary"],
            exclude: ["build/**/*", "**/*.test-d.ts", "vitest.config.ts"],
        },
        mockReset: true,
        setupFiles: ["./src/test/setup.ts"],
        // annoying but as we do lots of dropping and recreating of the test database
        // it's much easier to run the tests serially. maybe we could make this work
        // at some point but it's too much of a faff now.
        fileParallelism: false,
    },
});
