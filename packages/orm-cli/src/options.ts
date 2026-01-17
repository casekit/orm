import { Options } from "yargs";

export const globalOptions = {
    config: {
        type: "string",
        alias: "c",
        describe: "Path to the orm CLIs configuration file",
        default: "orm.config.ts",
    },
    force: {
        type: "boolean",
        desc: "Skip all prompts, use defaults, and overwrite existing files without asking for confirmation",
    },
} as const satisfies Record<string, Options>;
