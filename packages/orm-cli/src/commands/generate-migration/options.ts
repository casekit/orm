import { Options } from "yargs";

export const builder = {
    name: {
        type: "string",
        alias: "n",
        desc: "Short description for the migration filename",
        demandOption: true,
    },
    unsafe: {
        type: "boolean",
        desc: "Proceed even with unsafe operations",
        default: false,
    },
} as const satisfies Record<string, Options>;
