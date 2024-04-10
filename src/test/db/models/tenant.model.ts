import { ModelDefinition } from "../../../schema/types/definitions/ModelDefinition";
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
} satisfies ModelDefinition;
