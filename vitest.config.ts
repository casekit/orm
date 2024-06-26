/// <reference types="vitest" />
import "dotenv/config";
import tsconfigPaths from "vite-tsconfig-paths";
import { defineConfig } from "vitest/config";

export default defineConfig({
    plugins: [tsconfigPaths()],
    test: {
        // ... Specify options here.
        include: ["**/*.(spec|test|properties).ts?(x)"],
	exclude: ["lib", "node_modules"],
        globalSetup: "src/test/globalSetup.ts",
        coverage: { provider: "istanbul" },
    },
});
