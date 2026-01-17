import { Builder } from "#types.js";

export const builder = {
    force: {
        type: "boolean",
        desc: "Overwrite existing files without asking for confirmation",
        default: false,
    },
    directory: {
        alias: "d",
        type: "string",
        desc: "Location to keep your database configuration",
    },
} as const satisfies Builder;
