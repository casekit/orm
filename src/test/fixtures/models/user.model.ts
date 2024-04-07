import { z } from "zod";

import { sql } from "../../../sql";
import { ModelDefinition } from "../../../types/schema/definitions/ModelDefinition";

export const user = {
    columns: {
        id: { type: "uuid", default: sql`uuid_generate_v4()` },
        username: { zodSchema: z.string(), type: "text" },
        joinedAt: { zodSchema: z.date(), type: "timestamp", nullable: true },
        deletedAt: { zodSchema: z.date(), type: "timestamp", nullable: true },
    },
    primaryKey: ["id"],
    uniqueConstraints: [
        { columns: ["username"], where: sql`deleted_at IS NULL` },
    ],
} satisfies ModelDefinition;
