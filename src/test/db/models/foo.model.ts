import { ModelDefinition } from "../../../schema/types/definitions/ModelDefinition";
import { sql } from "../../../sql";

export const foo = {
    columns: {
        id: {
            type: "uuid",
            default: sql`uuid_generate_v4()`,
            primaryKey: true,
        },
        bigint: { type: "bigint" },
        text: { type: "text" },
        timestamp: { type: "timestamp" },
        renamedColumn: { name: "original_name", type: "timestamp" },
        a: { type: "bigint" },
        b: { type: "bigint" },
        c: { type: "bigint" },
        d: { type: "bigint" },
        e: { type: "bigint" },
        f: { type: "bigint" },
        g: { type: "bigint" },
        h: { type: "bigint" },
    },
} satisfies ModelDefinition;
