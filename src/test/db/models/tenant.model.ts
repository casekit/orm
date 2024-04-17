import { ModelDefinition } from "../../../schema/types/strict/ModelDefinition";
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
