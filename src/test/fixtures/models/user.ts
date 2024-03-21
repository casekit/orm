import { createModel } from "@casekit/orm";

import { z } from "zod";

export const user = createModel({
    columns: {
        id: { schema: z.string(), type: "uuid", primaryKey: true },
        username: { schema: z.string(), type: "text", unique: true },
        joinedAt: {
            schema: z.string().datetime(),
            type: "timestamp",
            nullable: true,
        },
    },
});
