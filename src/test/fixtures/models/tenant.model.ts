import { sql } from "../../../sql";
import { ModelDefinition } from "../../../types/schema/definition/ModelDefinition";

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
} satisfies ModelDefinition;
