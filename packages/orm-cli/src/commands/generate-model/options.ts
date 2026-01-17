import { Builder } from "#types.js";

export const builder = {
    name: {
        type: "string",
        desc: "Name of the model",
        demandOption: true,
    },
} as const satisfies Builder;
