import { ModelDefinition } from "../../..";
import { sql } from "../../../sql";

export const tenant = {
    columns: {
        id: {
            type: "uuid",
            default: sql`uuid_generate_v4()`,
            primaryKey: true,
        },
        name: { type: "text" },
        createdAt: { type: "timestamp", default: sql`now()` },
    },
} as const satisfies ModelDefinition;
