// @ts-check
import eslint from "@eslint/js";
import path from "path";
import tseslint from "typescript-eslint";

export default tseslint.config(
    {
        ignores: [
            "build/**",
            "**/*.mjs",
            "eslint.config.mjs",
            "vitest.workspace.ts",
            "vitest.config.ts",
            "**/*.js",
            "**/test/orm.config.ts",
        ],
    },
    eslint.configs.recommended,
    ...tseslint.configs.strictTypeChecked,
    ...tseslint.configs.stylisticTypeChecked,
    {
        languageOptions: {
            parserOptions: {
                projectService: true,
                tsconfigRootDir: path.join(import.meta.dirname, "config"),
            },
        },
        rules: {
            "no-duplicate-imports": "error",
            "@typescript-eslint/no-unused-expressions": [
                "error",
                {
                    allowTaggedTemplates: true,
                },
            ],
            "@typescript-eslint/dot-notation": "off",
            "@typescript-eslint/consistent-type-definitions": "off",
            "@typescript-eslint/no-empty-interface": "off",
            "@typescript-eslint/restrict-template-expressions": "off",
            "@typescript-eslint/no-non-null-assertion": "off",
            "@typescript-eslint/no-confusing-void-expression": "off",
            "@typescript-eslint/array-type": "off",
            "@typescript-eslint/no-unused-vars": [
                "error",
                {
                    args: "all",
                    argsIgnorePattern: "^_",
                    caughtErrors: "all",
                    caughtErrorsIgnorePattern: "^_",
                    destructuredArrayIgnorePattern: "^_",
                    varsIgnorePattern: "^_",
                    ignoreRestSiblings: true,
                },
            ],
            "@typescript-eslint/no-misused-promises": [
                2,
                {
                    checksVoidReturn: {
                        arguments: false,
                        attributes: false,
                        properties: false,
                    },
                },
            ],
        },
    },
    {
        // unfortunately commander.js returns `any` a lot
        // so it's easier to disable these rules for it :-(
        files: ["packages/orm-cli/**/*.ts", "packages/orm-cli/**/*.tsx"],
        ignores: [
            "build/**",
            "**/*.mjs",
            "eslint.config.mjs",
            "vitest.workspace.ts",
            "**/vitest.config.ts",
            "**/*.js",
        ],
        rules: {
            "@typescript-eslint/no-unsafe-assignment": "off",
            "@typescript-eslint/no-unsafe-return": "off",
            "@typescript-eslint/no-unsafe-argument": "off",
            "@typescript-eslint/no-unused-vars": "off",
            "@typescript-eslint/no-unsafe-member-access": "off",
            "@typescript-eslint/no-unsafe-call": "off",
            "@typescript-eslint/no-unnecessary-condition": "off",
        },
    },
    {
        // remix throws Response objects to short-circuit requests
        // so we need to turn off the rule that disallows throwing non-Error objects
        files: ["examples/remix/**/*.ts", "examples/remix/**/*.tsx"],
        ignores: [
            "build/**",
            "**/*.mjs",
            "eslint.config.mjs",
            "vitest.workspace.ts",
            "**/vitest.config.ts",
            "**/*.js",
        ],
        rules: {
            "@typescript-eslint/prefer-promise-reject-errors": "off",
        },
    },
    {
        files: ["**/*.test.ts", "**/*.test.tsx", "**/*.test-d.ts"],
        rules: {
            "@typescript-eslint/no-unsafe-assignment": "off",
            "@typescript-eslint/no-unsafe-return": "off",
            "@typescript-eslint/no-unsafe-argument": "off",
            "@typescript-eslint/no-unused-vars": "off",
        },
    },
);
