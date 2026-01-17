import { Builder } from "#types.js";

export const builder = {
    schema: {
        type: "string",
        desc: "The name of the schema to pull in the database",
        array: true,
        default: [],
    },
    force: {
        type: "boolean",
        desc: "Force overwrite existing model files without prompting",
        default: false,
    },
} satisfies Builder;
